param (
    [Parameter(Mandatory = $true)]
    [string]$SitePath,

    [Parameter(Mandatory = $true)]
    [string]$AppPool,

    [Parameter(Mandatory = $true)]
    [string]$DbServer,

    [Parameter(Mandatory = $true)]
    [string]$DbName,

    [Parameter(Mandatory = $true)]
    [string]$DbUser,
    
    [Parameter(Mandatory = $true)]
    [string]$DbPassword,

    [string]$DbBackupDir,
    [string]$ApiFilesPath,
    [string]$AppName = "app"
)

$ErrorActionPreference = "Stop"
Import-Module WebAdministration -ErrorAction Stop -Force

Write-Host "Starting Rollback Procedure..." -ForegroundColor Cyan

# Stop App Pool
try {
    $poolState = Get-WebAppPoolState -Name $AppPool -ErrorAction SilentlyContinue
    if ($poolState -and $poolState.Value -eq "Started") {
        Stop-WebAppPool -Name $AppPool
        Start-Sleep -Seconds 5
        Write-Host "App Pool stopped." -ForegroundColor Green
    }
} catch {
    Write-Host "App Pool stop warning: $_" -ForegroundColor Yellow
}

# Ensure site directory exists
if (-not (Test-Path $SitePath)) {
    New-Item -ItemType Directory -Path $SitePath -Force | Out-Null
}

# Find backup
$backupDir = $ApiFilesPath
# $backupFiles = Get-ChildItem -Path $backupDir -Filter "backup_*.zip" -ErrorAction SilentlyContinue
$backupFiles = Get-ChildItem -Path $backupDir -Filter "backup_${AppName}_*.zip" -ErrorAction SilentlyContinue

if (-not $backupFiles) {
    throw "No backup files found in $backupDir"
}

$latestBackup = $backupFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "Using backup: $($latestBackup.Name)" -ForegroundColor Green

# Stash config files
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$configStash = Join-Path $env:TEMP "rollback_$timestamp"
New-Item -ItemType Directory -Path $configStash -Force | Out-Null

$configFiles = @("web.config")
foreach ($file in $configFiles) {
    $src = Join-Path $SitePath $file
    if (Test-Path $src) {
        Copy-Item $src -Destination $configStash -Force
    }
}

# Clear and restore files
try {
    Get-ChildItem -Path $SitePath -Force | Remove-Item -Recurse -Force
} catch {
    Start-Sleep -Seconds 2
    Get-ChildItem -Path $SitePath -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($latestBackup.FullName, $SitePath)

# Restore config files
foreach ($file in $configFiles) {
    $stashed = Join-Path $configStash $file
    if (Test-Path $stashed) {
        Copy-Item $stashed -Destination (Join-Path $SitePath $file) -Force
    }
}
Remove-Item $configStash -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "File restoration complete." -ForegroundColor Green

# =========================================================================
# Restore API dependencies
#
# backup.ps1 excludes node_modules from the backup zip (-XD node_modules),
# so it must be reinstalled here before the app pool is started back up.
# =========================================================================
if ($AppName -eq "api") {
    Write-Host "Installing API dependencies (npm ci) in $SitePath ..." -ForegroundColor Cyan

    $packageJson = Join-Path $SitePath "package.json"
    if (Test-Path $packageJson) {
        Push-Location $SitePath
        try {
            npm ci --omit=dev
            if ($LASTEXITCODE -ne 0) {
                Write-Host "WARNING: npm ci failed during rollback (exit code $LASTEXITCODE). API may not start correctly." -ForegroundColor Yellow
            } else {
                Write-Host "API dependencies restored successfully." -ForegroundColor Green
            }
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "WARNING: package.json not found at $packageJson - skipping npm ci." -ForegroundColor Yellow
    }
}

# Database restore
if (-not $DbBackupDir) {
    $DbBackupDir = "$backupDir\db_backups"
}

if (Test-Path $DbBackupDir) {
    $dbFiles = Get-ChildItem -Path $DbBackupDir -Filter "${DbName}_*.bak"
    if ($dbFiles) {
        $latestDb = $dbFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        
        # Use a temp file for SQL to avoid command line detection
        $sqlFile = Join-Path $env:TEMP "restore_$timestamp.sql"
        @"
ALTER DATABASE [$DbName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE [$DbName] FROM DISK = N'$($latestDb.FullName)' WITH REPLACE, RECOVERY;
ALTER DATABASE [$DbName] SET MULTI_USER;
"@ | Out-File -FilePath $sqlFile -Encoding ASCII

        $sqlcmd = "sqlcmd -S $DbServer -U $DbUser -P `"$DbPassword`" -C -i `"$sqlFile`""
        Invoke-Expression $sqlcmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database restore complete." -ForegroundColor Green
        }
        Remove-Item $sqlFile -Force -ErrorAction SilentlyContinue
    }
}

# Start App Pool
try {
    Start-WebAppPool -Name $AppPool
    Start-Sleep -Seconds 3
    Write-Host "App Pool started." -ForegroundColor Green
} catch {
    Write-Host "App Pool start warning: $_" -ForegroundColor Yellow
}

Write-Host "Rollback completed successfully!" -ForegroundColor Cyan

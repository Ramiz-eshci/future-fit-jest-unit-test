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

    # Extra folder outside SitePath that should also be backed up (e.g. shared
    # API files/config not part of the IIS site content).
    [string]$ApiFilesPath,

    # NOTE: This path is used by the SQL Server *service account*, not by this
    # script/runner. If SQL Server runs on a different machine than IIS/the
    # runner, this must be a UNC path (e.g. \\fileserver\sql-backups) that the
    # SQL Server service account can write to. If SQL Server is on the same
    # box as IIS, a local path works fine.
    [string]$DbBackupDir,
    [string]$AppName = "app"
)

$ErrorActionPreference = "Stop"

Import-Module WebAdministration

# Check if App Pool exists and is running before stopping
Write-Host "Checking App Pool: $AppPool"
$appPoolState = Get-WebAppPoolState -Name $AppPool -ErrorAction SilentlyContinue

if ($appPoolState -and $appPoolState.Value -eq "Started") {
    Write-Host "Stopping App Pool: $AppPool"
    Stop-WebAppPool -Name $AppPool
    Start-Sleep -Seconds 5
    Write-Host "App Pool stopped successfully."
} else {
    if ($appPoolState) {
        Write-Host "App Pool is already in state: $($appPoolState.Value)"
    } else {
        Write-Host "App Pool not found or already stopped."
    }
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
# $backupZip = "$ApiFilesPath\backup_$timestamp.zip"
$backupZip = "$ApiFilesPath\backup_${AppName}_$timestamp.zip"
$tempCopy  = "$ApiFilesPath\_backup_temp"

if (-not $ApiFilesPath) {
    throw "ApiFilesPath was not provided - it's required as the destination for the backup zip and temp copy."
}

if (-not (Test-Path $ApiFilesPath)) {
    Write-Host "ApiFilesPath does not exist yet, creating: $ApiFilesPath"
    New-Item -ItemType Directory -Path $ApiFilesPath -Force | Out-Null
}

if (Test-Path $tempCopy) {
    Remove-Item $tempCopy -Recurse -Force
}

if (-not (Test-Path $SitePath)) {
    throw "SitePath not found or not reachable from this runner: '$SitePath'"
}

Write-Host "Creating temp backup copy..."
# robocopy $SitePath $tempCopy /E /R:1 /W:1 /XF *.log /NFL /NDL | Out-Null
$robocopyOutput = robocopy $SitePath $tempCopy /E /R:1 /W:1 /XF *.log /XD node_modules /NFL /NDL
$robocopyExit = $LASTEXITCODE

# robocopy exit codes: 0-7 = success (files copied or nothing to do), 8+ = failure
if ($robocopyExit -ge 8) {
    Write-Host "Robocopy output:"
    Write-Host ($robocopyOutput -join "`n")
    throw "robocopy FAILED copying '$SitePath' -> '$tempCopy' (exit code $robocopyExit). Check that SitePath is correct/reachable and that ApiFilesPath ('$ApiFilesPath') exists and is writable by the runner."
}

if (-not (Test-Path $tempCopy)) {
    throw "robocopy reported success (exit code $robocopyExit) but '$tempCopy' was not created. Check ApiFilesPath ('$ApiFilesPath') is a valid, writable location."
}

Write-Host "Creating zip archive..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempCopy, $backupZip)

Remove-Item $tempCopy -Recurse -Force

Write-Host "Backup SUCCESS: $backupZip"

# # =========================================================================
# # API files backup (separate folder outside SitePath)
# # =========================================================================
# if ($ApiFilesPath) {
#     if (-not (Test-Path $ApiFilesPath)) {
#         throw "ApiFilesPath not found: $ApiFilesPath"
#     }

#     Write-Host "Backing up API files folder: $ApiFilesPath"

#     $apiFilesBackupZip = "$SitePath\..\backup_apifiles_$timestamp.zip"
#     $apiFilesTempCopy   = "$SitePath\..\_backup_apifiles_temp"

#     if (Test-Path $apiFilesTempCopy) {
#         Remove-Item $apiFilesTempCopy -Recurse -Force
#     }

#     Write-Host "Creating temp copy of API files..."
#     robocopy $ApiFilesPath $apiFilesTempCopy /E /R:1 /W:1 /XF *.log /NFL /NDL | Out-Null

#     Write-Host "Creating API files zip archive..."
#     Add-Type -AssemblyName System.IO.Compression.FileSystem
#     [System.IO.Compression.ZipFile]::CreateFromDirectory($apiFilesTempCopy, $apiFilesBackupZip)

#     Remove-Item $apiFilesTempCopy -Recurse -Force

#     Write-Host "API files backup SUCCESS: $apiFilesBackupZip"
# } else {
#     Write-Host "ApiFilesPath not provided, skipping API files backup."
# }

# =========================================================================
# Database backup (SQL Server, native BACKUP DATABASE via sqlcmd)
# =========================================================================
if (-not $DbBackupDir) {
    $DbBackupDir = "$SitePath\..\db_backups"
}

Write-Host "Starting database backup for [$DbName] on $DbServer..."

if (-not (Test-Path $DbBackupDir)) {
    Write-Host "Creating DB backup directory: $DbBackupDir"
    New-Item -ItemType Directory -Path $DbBackupDir -Force | Out-Null
    
    # Grant permissions to SQL Server service account (if running locally)
    try {
        Write-Host "Setting permissions on backup directory..."
        # Grant permissions to Everyone temporarily (since SQL Auth is used)
        icacls $DbBackupDir /grant "Everyone:(OI)(CI)F" /T 2>$null
    } catch {
        Write-Host "Warning: Could not set permissions. Ensure SQL Server can write to the directory."
    }
}

# Use the same timestamp as the file backup so file + DB backups can be
# paired up later if needed.
$dbBackupFile = Join-Path $DbBackupDir "${DbName}_$timestamp.bak"

# IMPORTANT: Using SQL Authentication (as confirmed working)
Write-Host "Using SQL Server Authentication"
$escapedPassword = $DbPassword -replace "'", "''"

# Check SQL Server edition to determine if compression is supported
Write-Host "Checking SQL Server edition..."
$editionQuery = "SELECT SERVERPROPERTY('Edition') as Edition"

# Use SQL Authentication for the edition check too
$editionResult = sqlcmd -S $DbServer -U $DbUser -P $escapedPassword -C -Q "$editionQuery" -W -h-1 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Could not determine SQL Server edition. Assuming Standard/Enterprise."
    $edition = $false
} else {
    $edition = $editionResult | Select-String -Pattern "Express" -Quiet
}

if ($edition) {
    Write-Host "SQL Server Express Edition detected - compression not supported"
    $sqlQuery = "BACKUP DATABASE [$DbName] TO DISK = N'$dbBackupFile' WITH INIT, STATS = 10;"
} else {
    Write-Host "SQL Server Standard/Enterprise Edition - compression supported"
    $sqlQuery = "BACKUP DATABASE [$DbName] TO DISK = N'$dbBackupFile' WITH INIT, COMPRESSION, STATS = 10;"
}

# Execute the backup using SQL Authentication
Write-Host "Running: sqlcmd -S $DbServer -U $DbUser -P *** -C -Q `"$sqlQuery`""
$sqlcmdOutput = sqlcmd -S $DbServer -U $DbUser -P $escapedPassword -C -Q "$sqlQuery" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "SQLCMD Error Output:"
    Write-Host $sqlcmdOutput
    throw "Database backup FAILED (sqlcmd exit code $LASTEXITCODE). Check that the SQL Server can write to '$dbBackupFile'."
}

if (-not (Test-Path $dbBackupFile)) {
    throw "Database backup command succeeded but backup file was not found at '$dbBackupFile'. If SQL Server is on a different machine, DbBackupDir must be a UNC path reachable by the SQL Server service account."
}

$fileSize = (Get-Item $dbBackupFile).Length / 1MB
Write-Host "Database backup SUCCESS: $dbBackupFile ($([math]::Round($fileSize, 2)) MB)"

# Compress .bak into zip and remove original
$dbBackupZip = $dbBackupFile -replace '\.bak$', '.zip'
Write-Host "Compressing DB backup to zip..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($dbBackupZip, 'Create')
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
    $zip,
    $dbBackupFile,
    [System.IO.Path]::GetFileName($dbBackupFile),
    [System.IO.Compression.CompressionLevel]::Optimal
) | Out-Null
$zip.Dispose()

Remove-Item $dbBackupFile -Force
$zipSize = (Get-Item $dbBackupZip).Length / 1MB
Write-Host "DB backup compressed: $dbBackupZip ($([math]::Round($zipSize, 2)) MB)"

# Starting the app pool back up is intentionally left to the Deploy step,
# which starts it after publishing new files (matches existing pipeline flow).
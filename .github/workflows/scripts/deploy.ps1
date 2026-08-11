param (
  [string]$SitePath,
  [string]$AppPool,
  [switch]$ClearFirst 
)

$ErrorActionPreference = "Stop"

Import-Module WebAdministration

# Files that must NEVER be overwritten on the IIS server.
# These are managed manually on the server, not by the pipeline.
$excludedFiles = @("web.config", ".env")

# =========================================================================
# Stop App Pool (idempotent - backup.ps1 may have already stopped it)
# =========================================================================
Write-Host "Stopping App Pool..."
$poolState = Get-WebAppPoolState -Name $AppPool -ErrorAction SilentlyContinue

if ($poolState -and $poolState.Value -eq "Started") {
    Stop-WebAppPool -Name $AppPool
    Start-Sleep -Seconds 3
} else {
    if ($poolState) {
        Write-Host "App Pool already in state: $($poolState.Value) - skipping stop."
    } else {
        Write-Host "App Pool '$AppPool' not found - skipping stop."
    }
}

$poolStatus = Get-WebAppPoolState -Name $AppPool
Write-Host "App Pool status after stop: $($poolStatus.Value)"

# =========================================================================
# Clear existing build (Angular/source only)
# =========================================================================
if ($ClearFirst) {
    Write-Host "Clearing existing site files before deploy..."

    # Stash server-managed config files
    $stash = Join-Path $env:TEMP "deploy_stash_$(Get-Date -Format 'yyyyMMddHHmmss')"
    New-Item -ItemType Directory -Path $stash -Force | Out-Null

    foreach ($f in $excludedFiles) {
        $src = Join-Path $SitePath $f
        if (Test-Path $src) {
            Copy-Item $src -Destination $stash -Force
            Write-Host "Stashed: $f"
        }
    }

    # Clear all site files
    Get-ChildItem -Path $SitePath -Force |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

    # Restore config files
    foreach ($f in $excludedFiles) {
        $stashed = Join-Path $stash $f
        if (Test-Path $stashed) {
            Copy-Item $stashed -Destination (Join-Path $SitePath $f) -Force
            Write-Host "Restored: $f"
        }
    }
    Remove-Item $stash -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Site folder cleared."
}

# =========================================================================
# Deploy files
# =========================================================================
Write-Host "Deploying files (excluding: $($excludedFiles -join ', '))..."

$source = Join-Path (Get-Location) "publish"

if (-not (Test-Path $source)) {
    throw "Publish folder not found at: $source"
}

# robocopy /E = all subfolders (incl. empty), /XF = exclude files by name
# /R:2 /W:2 = 2 retries, 2s wait. /NFL /NDL = quieter log.
robocopy $source $SitePath /E /R:2 /W:2 /NFL /NDL /XF $excludedFiles | Out-Null

# robocopy exit codes: 0-7 = success (8+ = failure)
if ($LASTEXITCODE -ge 8) {
    throw "File deployment FAILED (robocopy exit code $LASTEXITCODE)."
}

Write-Host "Files deployed successfully (robocopy exit code $LASTEXITCODE)"

# Safety check: warn if the server is missing config that was never deployed
foreach ($f in $excludedFiles) {
    $target = Join-Path $SitePath $f
    if (-not (Test-Path $target)) {
        Write-Host "WARNING: $f does not exist at $target. The app may fail to start."
        Write-Host "         Create it manually on the server (it is intentionally not deployed)."
    } else {
        Write-Host "Preserved existing: $f"
    }
}

# =========================================================================
# Start App Pool (idempotent)
# =========================================================================
Write-Host "Starting App Pool..."
$poolState = Get-WebAppPoolState -Name $AppPool -ErrorAction SilentlyContinue

if ($poolState -and $poolState.Value -ne "Started") {
    Start-WebAppPool -Name $AppPool
    Start-Sleep -Seconds 2
} else {
    Write-Host "App Pool already started."
}

$poolStatus = Get-WebAppPoolState -Name $AppPool
Write-Host "App Pool status after start: $($poolStatus.Value)"

if ($poolStatus.Value -ne "Started") {
  Write-Host "ERROR: App Pool failed to start!"
  exit 1
}

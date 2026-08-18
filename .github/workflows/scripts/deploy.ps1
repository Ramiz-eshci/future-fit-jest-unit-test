param (
  [Parameter(Mandatory = $true)]
  [string]$SitePath,

  [Parameter(Mandatory = $true)]
  [string]$AppPool,

  [Parameter(Mandatory = $true)]
  [ValidateSet("api", "source")]
  [string]$AppName,

  [switch]$ClearFirst
)

$ErrorActionPreference = "Stop"

Import-Module WebAdministration

# Files that must NEVER be overwritten on the IIS server.
# These are managed manually on the server, not by the pipeline.
$excludedFiles = @("web.config", ".env")

$excludedDirectories = @(
    "api"
)

Write-Host "========================================="
Write-Host "Starting deployment"
Write-Host "Application : $AppName"
Write-Host "Site Path   : $SitePath"
Write-Host "App Pool    : $AppPool"
Write-Host "Clear First : $ClearFirst"
Write-Host "========================================="

# =========================================================================
# Safety checks
# =========================================================================

if (-not (Test-Path $SitePath)) {
    throw "Site path not found: $SitePath"
}

# API must NEVER be cleared.
if ($AppName -eq "api" -and $ClearFirst) {
    throw "Safety check failed: -ClearFirst is not allowed for API deployment."
}

# ClearFirst is intended only for Angular/source.
if ($ClearFirst -and $AppName -ne "source") {
    throw "Safety check failed: -ClearFirst can only be used for source deployment."
}

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
        throw "App Pool '$AppPool' was not found."
    }
}

$poolStatus = Get-WebAppPoolState -Name $AppPool
Write-Host "App Pool status after stop: $($poolStatus.Value)"

# =========================================================================
# Clear existing build (Angular/source ONLY)
#
# IMPORTANT:
# API deployment never enters this block.
# =========================================================================
if ($ClearFirst -and $AppName -eq "source") {
    Write-Host "Clearing existing Angular site files before deploy..."
    Write-Host "Preserving API directory: api"

    # Stash server-managed config files
    $stash = Join-Path $env:TEMP "deploy_stash_$(Get-Date -Format 'yyyyMMddHHmmssfff')"
    New-Item -ItemType Directory -Path $stash -Force | Out-Null

    foreach ($f in $excludedFiles) {
        $src = Join-Path $SitePath $f

        if (Test-Path $src) {
            Copy-Item $src -Destination $stash -Force
            Write-Host "Stashed: $f"
        }
    }

    # Clear Angular files/directories.
    # IMPORTANT:
    # - web.config is preserved
    # - .env is preserved
    # - api directory is preserved
    Get-ChildItem -Path $SitePath -Force |
        Where-Object {
            ($excludedFiles -notcontains $_.Name) -and
            ($excludedDirectories -notcontains $_.Name)
        } |
        Remove-Item -Recurse -Force -ErrorAction Stop

    # Restore config files
    foreach ($f in $excludedFiles) {
        $stashed = Join-Path $stash $f

        if (Test-Path $stashed) {
            Copy-Item `
                $stashed `
                -Destination (Join-Path $SitePath $f) `
                -Force

            Write-Host "Restored: $f"
        }
    }

    Remove-Item $stash -Recurse -Force -ErrorAction SilentlyContinue

    Write-Host "Angular site folder cleared."
    Write-Host "API directory was preserved."
}
elseif ($AppName -eq "api") {
    Write-Host "API deployment: existing API files will NOT be cleared."
    Write-Host "Existing .env and web.config will be preserved."
}
# =========================================================================
# Deploy files
# =========================================================================
Write-Host "Deploying files (excluding: $($excludedFiles -join ', '))..."

$source = Join-Path (Get-Location) "publish"

# If the API artifact still contains an "api" folder,
# deploy the CONTENTS of that folder to the API SitePath.
if ($AppName -eq "api") {

    $apiSource = Join-Path $source "api"

    if (Test-Path $apiSource) {
        Write-Host "API artifact contains an 'api' folder."
        Write-Host "Deploying contents of: $apiSource"
        $source = $apiSource
    }
    else {
        Write-Host "API artifact is already flattened."
        Write-Host "Deploying contents of: $source"
    }
}

# /E      = copy all subfolders
# /R:2    = 2 retries
# /W:2    = 2 seconds between retries
# /NFL    = no file list
# /NDL    = no directory list
# /XF     = exclude server-managed files
#
# IMPORTANT:
# Do NOT use /MIR here.
# /MIR can delete files from the IIS destination.
# robocopy $source $SitePath /E /R:2 /W:2 /NFL /NDL /XF $excludedFiles | Out-Null

if ($AppName -eq "source") {
    robocopy $source $SitePath /E /R:2 /W:2 /NFL /NDL /XF $excludedFiles /XD $excludedDirectories | Out-Null
}
else {
    robocopy $source $SitePath /E /R:2 /W:2 /NFL /NDL /XF $excludedFiles | Out-Null
}

$robocopyExitCode = $LASTEXITCODE

# robocopy exit codes: 0-7 = success (8+ = failure)
if ($robocopyExitCode -ge 8) {
    throw "File deployment FAILED (robocopy exit code $robocopyExitCode)."
}

Write-Host "Files deployed successfully (robocopy exit code $robocopyExitCode)."

# =========================================================================
# Install API dependencies
#
# node_modules is intentionally excluded from the artifact (see
# ci-artifacts.yml), so it must be installed here, directly in $SitePath,
# using the package.json/package-lock.json that were just deployed.
#
# This MUST run before the app pool is started back up.
# =========================================================================
if ($AppName -eq "api") {
    Write-Host "Installing API dependencies (npm ci) in $SitePath ..."

    $packageJson = Join-Path $SitePath "package.json"
    if (-not (Test-Path $packageJson)) {
        throw "package.json not found at $packageJson - cannot install API dependencies."
    }

    Push-Location $SitePath
    try {
        npm ci --omit=dev
        if ($LASTEXITCODE -ne 0) {
            throw "npm ci failed in $SitePath (exit code $LASTEXITCODE)."
        }
    }
    finally {
        Pop-Location
    }

    Write-Host "API dependencies installed successfully."
}

# =========================================================================
# Verify deployment
# =========================================================================

$deployedFiles = Get-ChildItem -Path $SitePath -Recurse -File -Force |
    Where-Object {
        $excludedFiles -notcontains $_.Name
    }

if (-not $deployedFiles) {
    throw "Deployment verification failed: no application files were found in $SitePath."
}

Write-Host "Deployment verification passed. Application files found: $($deployedFiles.Count)"

# =========================================================================
# Safety check: server-managed config files
# =========================================================================
foreach ($f in $excludedFiles) {
    $target = Join-Path $SitePath $f

    if (-not (Test-Path $target)) {
        Write-Host "WARNING: $f does not exist at $target."
        Write-Host "         The pipeline intentionally does not deploy this file."
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

Write-Host "========================================="
Write-Host "Deployment completed successfully"
Write-Host "Application : $AppName"
Write-Host "========================================="

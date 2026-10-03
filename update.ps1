# Medley Magic Auto-Update Script
# Downloads and installs the latest version from GitHub Releases

param(
    [string]$Version = "latest",
    [switch]$Silent = $false
)

$RepoOwner = "GilbertZennerDev"
$RepoName = "medley-desktop"
$AppName = "Medley Magic"
$AppExeName = "Medley Magic.exe"
$InstallerName = "Medley Magic Setup"

# Paths
$LocalAppData = [System.Environment]::GetFolderPath("LocalApplicationData")
$AppPath = Join-Path $LocalAppData "Programs" $AppName
$InstallerPath = Join-Path $env:TEMP "medley-setup.exe"
$VersionFile = Join-Path $AppPath "version.txt"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Get-LatestRelease {
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$RepoOwner/$RepoName/releases/latest" -ErrorAction Stop
        return $response
    }
    catch {
        Write-Log "Failed to fetch latest release: $_" "ERROR"
        return $null
    }
}

function Get-DownloadUrl {
    param([object]$Release)

    $asset = $Release.assets | Where-Object { $_.name -like "*Setup*.exe" } | Select-Object -First 1

    if (-not $asset) {
        Write-Log "No installer found in release" "ERROR"
        return $null
    }

    return $asset.browser_download_url
}

function Get-CurrentVersion {
    if (Test-Path $VersionFile) {
        return Get-Content $VersionFile -Raw | ForEach-Object { $_.Trim() }
    }
    return "0.0.0"
}

function Update-App {
    Write-Log "Starting Medley Magic update..."

    # Get latest release
    Write-Log "Checking for updates..."
    $release = Get-LatestRelease

    if (-not $release) {
        Write-Log "Could not fetch release information" "ERROR"
        return $false
    }

    $latestVersion = $release.tag_name -replace '^v', ''
    $currentVersion = Get-CurrentVersion

    Write-Log "Current version: $currentVersion"
    Write-Log "Latest version:  $latestVersion"

    if ($latestVersion -eq $currentVersion -and -not $Silent) {
        Write-Log "Already up to date!" "INFO"
        return $true
    }

    # Get download URL
    $downloadUrl = Get-DownloadUrl $release
    if (-not $downloadUrl) {
        return $false
    }

    # Download installer
    Write-Log "Downloading version $latestVersion..."
    try {
        (New-Object System.Net.ServicePointManager).SecurityProtocol = "Tls12"
        Invoke-WebRequest -Uri $downloadUrl -OutFile $InstallerPath -ErrorAction Stop
        Write-Log "Download complete"
    }
    catch {
        Write-Log "Download failed: $_" "ERROR"
        return $false
    }

    # Close running instances
    Write-Log "Closing running instances..."
    Stop-Process -Name $AppExeName -ErrorAction SilentlyContinue -Force
    Start-Sleep -Milliseconds 500

    # Run installer
    Write-Log "Running installer..."
    $process = Start-Process -FilePath $InstallerPath -ArgumentList "/VERYSILENT /NORESTART" -PassThru -Wait

    if ($process.ExitCode -eq 0) {
        # Update version file
        if (-not (Test-Path $AppPath)) {
            New-Item -ItemType Directory -Path $AppPath -Force | Out-Null
        }
        Set-Content -Path $VersionFile -Value $latestVersion -Force
        Write-Log "Update successful! Installed version $latestVersion" "SUCCESS"

        # Clean up
        Remove-Item $InstallerPath -ErrorAction SilentlyContinue

        # Restart app
        if (-not $Silent) {
            Write-Log "Restarting Medley Magic..."
            Start-Process -FilePath (Join-Path $AppPath $AppExeName)
        }

        return $true
    }
    else {
        Write-Log "Installer exited with code $($process.ExitCode)" "ERROR"
        return $false
    }
}

# Main
if ($PSVersionTable.PSVersion.Major -lt 3) {
    Write-Log "PowerShell 3.0 or later is required" "ERROR"
    exit 1
}

$success = Update-App
exit ($success ? 0 : 1)

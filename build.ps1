#Requires -Version 7
param(
  [switch]$BuildOnly
)

$ErrorActionPreference = 'Stop'

Write-Host "🎵 Medley Desktop Build & Package" -ForegroundColor Cyan
Write-Host ""

# Setup paths
$sourceDir = "E:\WebApps\medley-desktop"
$buildDir = "D:\app-builder\medley-desktop"

if (-not (Test-Path $sourceDir)) {
  Write-Host "❌ Source dir not found: $sourceDir" -ForegroundColor Red
  exit 1
}

# Step 1: Copy to build dir
Write-Host "📋 Copying to build directory..." -ForegroundColor Yellow
robocopy $sourceDir $buildDir /E /XD node_modules .next .git dist out 2>&1 | Out-Null

if ($LASTEXITCODE -gt 7) {
  Write-Host "❌ Copy failed" -ForegroundColor Red
  exit 1
}

Write-Host "✓ Copy complete" -ForegroundColor Green
Write-Host ""

# Step 2: Install deps
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Push-Location $buildDir
npm install 2>&1 | Select-Object -Last 5

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ npm install failed" -ForegroundColor Red
  Pop-Location
  exit 1
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build TypeScript
Write-Host "🔨 Building TypeScript..." -ForegroundColor Yellow
npm run build 2>&1 | Select-Object -Last 3

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Build failed" -ForegroundColor Red
  Pop-Location
  exit 1
}

Write-Host "✓ Build complete" -ForegroundColor Green
Write-Host ""

# Step 4: Package for Windows
Write-Host "📦 Packaging for Windows (NSIS + Portable)..." -ForegroundColor Yellow
npm run dist:win

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ dist:win failed" -ForegroundColor Red
  Pop-Location
  exit 1
}

Write-Host "✓ Windows build complete" -ForegroundColor Green
Write-Host ""

# Show output
Write-Host "📂 Output location:" -ForegroundColor Cyan
Write-Host "   $buildDir\out\" -ForegroundColor White
Write-Host ""

$installers = Get-ChildItem "$buildDir\out" -Filter "*.exe" -ErrorAction SilentlyContinue
if ($installers) {
  Write-Host "📥 Installers:" -ForegroundColor Cyan
  $installers | ForEach-Object { Write-Host "   • $($_.Name) ($([math]::Round($_.Length / 1MB, 1)) MB)" -ForegroundColor White }
}

Write-Host ""
Write-Host "✅ Build finished!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test installer: $buildDir\out\Medley.Magic.Setup.*.exe" -ForegroundColor White
Write-Host "  2. Commit changes: git add . && git commit -m 'Add auto-update support with electron-updater'" -ForegroundColor White
Write-Host "  3. Create GitHub release with new version tag" -ForegroundColor White

Pop-Location

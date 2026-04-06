$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"
$backendVenvPath = Join-Path $backendPath ".venv"
$backendVenvPython = Join-Path $backendVenvPath "Scripts\python.exe"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Has-Command {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Refresh-Path {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

function Ensure-Node {
    if (Has-Command "node" -and Has-Command "npm") {
        return $true
    }

    Write-Step "Installing Node.js LTS with winget"

    if (-not (Has-Command "winget")) {
        Write-Host "winget is not available, so Node.js cannot be installed automatically." -ForegroundColor Red
        return $false
    }

    & winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements

    Refresh-Path

    $commonNodePaths = @(
        "C:\Program Files\nodejs",
        "C:\Program Files (x86)\nodejs",
        (Join-Path $env:LOCALAPPDATA "Programs\nodejs")
    )

    foreach ($pathItem in $commonNodePaths) {
        if (Test-Path (Join-Path $pathItem "node.exe")) {
            if (-not ($env:Path -split ";" | Where-Object { $_ -eq $pathItem })) {
                $env:Path = "$pathItem;$env:Path"
            }
        }
    }

    return (Has-Command "node" -and Has-Command "npm")
}

function Start-Window {
    param(
        [string]$WorkingDirectory,
        [string]$Command
    )

    Start-Process -FilePath "powershell" -WorkingDirectory $WorkingDirectory -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        $Command
    ) | Out-Null
}

if (-not (Has-Command "python")) {
    Write-Host "Python is not installed or not available in PATH." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendVenvPython)) {
    Write-Step "Creating backend virtual environment"
    & python -m venv $backendVenvPath
}

Write-Step "Installing backend requirements"
& $backendVenvPython -m pip install -r (Join-Path $backendPath "requirements.txt")

if (-not (Test-Path (Join-Path $backendPath ".env"))) {
    Write-Step "Creating backend .env"
    Copy-Item (Join-Path $backendPath ".env.example") (Join-Path $backendPath ".env")
}

Write-Step "Running database migrations"
Push-Location $backendPath
& $backendVenvPython -m alembic upgrade head

Write-Step "Seeding demo data"
& $backendVenvPython -m scripts.seed
Pop-Location

if (-not (Test-Path (Join-Path $frontendPath ".env.local"))) {
    Write-Step "Creating frontend .env.local"
    Copy-Item (Join-Path $frontendPath ".env.example") (Join-Path $frontendPath ".env.local")
}

if (-not (Ensure-Node)) {
    Write-Host ""
    Write-Host "Node.js/npm could not be prepared automatically." -ForegroundColor Red
    Write-Host "Install Node.js LTS manually, then run this file again." -ForegroundColor Yellow
    exit 1
}

Write-Step "Installing frontend requirements"
Push-Location $frontendPath
& npm install
Pop-Location

Write-Step "Starting backend server"
Start-Window -WorkingDirectory $backendPath -Command "& '$backendVenvPython' -m uvicorn app.main:app --reload"

Write-Step "Starting frontend server"
Start-Window -WorkingDirectory $frontendPath -Command "npm run dev"

Write-Step "Opening the public home page"
Start-Sleep -Seconds 8
Start-Process "http://localhost:3000/"

Write-Step "Done"
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green

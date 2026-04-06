$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$backendVenvPath = Join-Path $backendPath ".venv"
$backendVenvPython = Join-Path $backendVenvPath "Scripts\python.exe"

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed or not available in PATH." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendVenvPython)) {
    & python -m venv $backendVenvPath
}

& $backendVenvPython -m pip install -r (Join-Path $backendPath "requirements.txt")

if (-not (Test-Path (Join-Path $backendPath ".env"))) {
    Copy-Item (Join-Path $backendPath ".env.example") (Join-Path $backendPath ".env")
}

Push-Location $backendPath
& $backendVenvPython -m alembic upgrade head
& $backendVenvPython -m scripts.seed
& $backendVenvPython -m uvicorn app.main:app --reload
Pop-Location

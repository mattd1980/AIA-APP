# Push to GitHub and ensure database migrations are applied.
# 1. Applies pending Prisma migrations to the database (backend/.env DATABASE_URL).
# 2. Commits and pushes all changes. When Railway (or your host) deploys from this push,
#    it runs "prisma migrate deploy" at startup, so the deployed DB stays in sync.

param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$backendDir = Join-Path $PSScriptRoot ".." "backend"

Write-Host "=== Push to GitHub (with DB migrations) ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Run migrations so the database schema is up to date (local or configured DB)
Write-Host "1. Applying database migrations (backend)..." -ForegroundColor Yellow
Push-Location $backendDir
try {
    & npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy failed" }
    Write-Host "   Migrations applied." -ForegroundColor Green
} catch {
    Write-Host "   Migration failed or DATABASE_URL not set. Continuing anyway (deploy will run migrations)." -ForegroundColor Yellow
} finally {
    Pop-Location
}
Write-Host ""

# Step 2: Git add, commit, push
Write-Host "2. Staging all changes..." -ForegroundColor Yellow
git add -A
$status = git status --short
if (-not $status) {
    Write-Host "   Nothing to commit (working tree clean)." -ForegroundColor Green
    exit 0
}

if (-not $Message) {
    $Message = "Update app: locations/rooms/safes, insurer categories, CSV export, AI no-people rules"
}

Write-Host "3. Committing..." -ForegroundColor Yellow
git commit -m $Message
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "4. Pushing to origin..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Done. On deploy, your host will run 'prisma migrate deploy' and apply any new migrations." -ForegroundColor Green

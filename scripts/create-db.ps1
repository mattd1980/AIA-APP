# Script PowerShell pour créer la base de données aia_app
# Usage: .\scripts\create-db.ps1

Write-Host "=== Création de la base de données aia_app ===" -ForegroundColor Cyan

# Mot de passe PostgreSQL
$env:PGPASSWORD = '123'

# Chercher psql dans les emplacements standards
$pgPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files\PostgreSQL\12\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $pgPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "PostgreSQL trouvé : $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "PostgreSQL non trouvé dans les emplacements standards." -ForegroundColor Yellow
    Write-Host "Veuillez créer la base de données manuellement :" -ForegroundColor Yellow
    Write-Host "  CREATE DATABASE aia_app;" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou utiliser pgAdmin pour créer la base de données." -ForegroundColor Yellow
    exit 1
}

# Vérifier si la base de données existe déjà
Write-Host "Vérification de l'existence de la base de données..." -ForegroundColor Cyan
$checkResult = & $psqlPath -U postgres -t -c "SELECT 1 FROM pg_database WHERE datname='aia_app';" 2>&1

if ($checkResult -match "1") {
    Write-Host "La base de données 'aia_app' existe déjà." -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous la supprimer et la recréer ? (o/N)"
    if ($response -eq "o" -or $response -eq "O") {
        Write-Host "Suppression de la base de données existante..." -ForegroundColor Yellow
        & $psqlPath -U postgres -c "DROP DATABASE IF EXISTS aia_app;" 2>&1 | Out-Null
    } else {
        Write-Host "Opération annulée." -ForegroundColor Yellow
        exit 0
    }
}

# Créer la base de données
Write-Host "Création de la base de données 'aia_app'..." -ForegroundColor Cyan
$createResult = & $psqlPath -U postgres -c "CREATE DATABASE aia_app;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Base de données créée avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "  1. Vérifier que DATABASE_URL dans backend/.env est correcte" -ForegroundColor White
    Write-Host "  2. Exécuter : cd backend && npx prisma migrate dev" -ForegroundColor White
    Write-Host "  3. Exécuter : npx prisma generate" -ForegroundColor White
} else {
    Write-Host "Erreur lors de la création de la base de données :" -ForegroundColor Red
    Write-Host $createResult -ForegroundColor Red
    exit 1
}

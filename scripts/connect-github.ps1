# Script pour connecter le repo local au repo GitHub
param(
    [string]$Username = "TomoFilesSoft",
    [string]$RepoName = "AIA-APP"
)

$repoUrl = "https://github.com/$Username/$RepoName.git"

Write-Host "Configuration du remote GitHub..." -ForegroundColor Cyan
Write-Host "Repository: $repoUrl" -ForegroundColor Yellow

# Vérifier si le remote existe déjà
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Remote 'origin' existe deja: $existingRemote" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous le remplacer? (o/n)"
    if ($response -eq "o" -or $response -eq "O") {
        git remote remove origin
        git remote add origin $repoUrl
        Write-Host "Remote mis a jour" -ForegroundColor Green
    } else {
        Write-Host "Remote non modifie" -ForegroundColor Yellow
        exit 0
    }
} else {
    git remote add origin $repoUrl
    Write-Host "Remote 'origin' ajoute" -ForegroundColor Green
}

# Vérifier que la branche est 'main'
git branch -M main

Write-Host ""
Write-Host "Configuration terminee!" -ForegroundColor Green
Write-Host ""
Write-Host "Pour pousser le code vers GitHub:" -ForegroundColor Cyan
Write-Host "  git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour verifier:" -ForegroundColor Cyan
Write-Host "  git remote -v" -ForegroundColor Yellow

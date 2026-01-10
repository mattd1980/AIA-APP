# Script pour créer un repository GitHub
param(
    [string]$RepoName = "AIA-APP",
    [string]$Description = "Application d'Inventaire IA pour Assurance",
    [switch]$Private = $false
)

# Vérifier si un token GitHub est disponible
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "❌ GITHUB_TOKEN non trouvé dans les variables d'environnement" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour créer le repo, vous avez deux options:" -ForegroundColor Yellow
    Write-Host "1. Créer le repo manuellement sur GitHub.com" -ForegroundColor Yellow
    Write-Host "2. Configurer GITHUB_TOKEN et réexécuter ce script" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour configurer le token:" -ForegroundColor Cyan
    Write-Host '  $env:GITHUB_TOKEN = "votre_token_ici"' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Headers pour l'API GitHub
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

# Body de la requête
$body = @{
    name = $RepoName
    description = $Description
    private = $Private
} | ConvertTo-Json

try {
    Write-Host "🔄 Création du repository GitHub: $RepoName..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ Repository créé avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository URL: $($response.html_url)" -ForegroundColor Green
    Write-Host "Clone URL: $($response.clone_url)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "  1. git remote add origin $($response.clone_url)" -ForegroundColor Cyan
    Write-Host "  2. git push -u origin main" -ForegroundColor Cyan
    
    # Retourner l'URL pour utilisation dans d'autres scripts
    return $response.clone_url
}
catch {
    Write-Host "❌ Erreur lors de la création du repository:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host ""
        Write-Host "💡 Le token GitHub est invalide ou expiré" -ForegroundColor Yellow
    }
    elseif ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host ""
        Write-Host "💡 Le repository existe peut-être déjà ou le nom est invalide" -ForegroundColor Yellow
    }
    
    exit 1
}

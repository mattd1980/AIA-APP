# Script simple pour créer et configurer le repo GitHub
$repoName = "AIA-APP"
$token = $env:GITHUB_TOKEN

if (-not $token) {
    Write-Host "GITHUB_TOKEN non trouve dans les variables d'environnement"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "1. Creer le repo manuellement sur https://github.com/new"
    Write-Host "   Nom: AIA-APP"
    Write-Host "   Description: Application d'Inventaire IA pour Assurance"
    Write-Host "   Public"
    Write-Host ""
    Write-Host "2. Configurer le token:"
    Write-Host '   $env:GITHUB_TOKEN = "votre_token"'
    Write-Host ""
    exit 0
}

$headers = @{
    Authorization = "token $token"
    Accept = "application/vnd.github.v3+json"
}

$body = @{
    name = $repoName
    description = "Application d'Inventaire IA pour Assurance"
    private = $false
} | ConvertTo-Json

try {
    Write-Host "Creation du repository GitHub..."
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    
    Write-Host "Repository cree avec succes!"
    Write-Host "URL: $($response.html_url)"
    Write-Host "Clone URL: $($response.clone_url)"
    
    # Configurer le remote
    Write-Host ""
    Write-Host "Configuration du remote..."
    git remote add origin $response.clone_url
    Write-Host "Remote 'origin' configure"
    
    Write-Host ""
    Write-Host "Pour pousser le code:"
    Write-Host "  git push -u origin main"
}
catch {
    Write-Host "Erreur: $($_.Exception.Message)"
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "Le repository existe peut-etre deja"
        Write-Host "Essayer de connecter le remote existant..."
        git remote add origin "https://github.com/$($env:USERNAME)/$repoName.git"
    }
}

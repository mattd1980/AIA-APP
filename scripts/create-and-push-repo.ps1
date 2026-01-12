# Script to create GitHub repository and push code
param(
    [string]$Token = $env:GITHUB_TOKEN
)

$repoName = "AIA-APP"
$description = "Application d'Inventaire IA pour Assurance"
$username = "mattd1980"

if (-not $Token) {
    Write-Host "❌ GITHUB_TOKEN not found in environment variables" -ForegroundColor Red
    Write-Host ""
    Write-Host "To create the repository, you need a Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor Cyan
    Write-Host "3. Select scope: 'repo' (all repo permissions)" -ForegroundColor Cyan
    Write-Host "4. Generate and copy the token" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor Yellow
    Write-Host '  $env:GITHUB_TOKEN = "your_token_here"' -ForegroundColor Cyan
    Write-Host '  .\scripts\create-and-push-repo.ps1' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
}

$body = @{
    name = $repoName
    description = $description
    private = $false
} | ConvertTo-Json

try {
    Write-Host "🔄 Creating GitHub repository: $repoName..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ Repository created successfully!" -ForegroundColor Green
    Write-Host "   URL: $($response.html_url)" -ForegroundColor Green
    Write-Host ""
    
    # Verify remote is set
    $remoteUrl = git remote get-url origin 2>$null
    if (-not $remoteUrl) {
        Write-Host "📋 Setting up remote..." -ForegroundColor Cyan
        git remote add origin $response.clone_url
        Write-Host "✅ Remote configured" -ForegroundColor Green
    } else {
        Write-Host "✅ Remote already configured: $remoteUrl" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🚀 Pushing code to GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ Success! Repository created and code pushed." -ForegroundColor Green
    Write-Host "   View at: $($response.html_url)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host ""
        Write-Host "💡 The token is invalid or expired" -ForegroundColor Yellow
    }
    elseif ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host ""
        Write-Host "💡 Repository might already exist. Trying to push anyway..." -ForegroundColor Yellow
        git push -u origin main
    }
    else {
        exit 1
    }
}

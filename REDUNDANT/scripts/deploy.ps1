# 🚀 Quick Deployment Script for Windows

Write-Host "🏗️ Building for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "📦 Build completed! Deploying to Netlify..." -ForegroundColor Green
    netlify deploy --prod --dir=dist
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment complete! Your app is live!" -ForegroundColor Green
        Write-Host "🧪 Run the QA checklist from DEPLOYMENT_QA_PLAN.md" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}

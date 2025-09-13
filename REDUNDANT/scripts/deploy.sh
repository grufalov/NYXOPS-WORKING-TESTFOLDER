#!/bin/bash
# 🚀 Quick Deployment Script

echo "🏗️ Building for production..."
npm run build

echo "📦 Build completed! Deploying to Netlify..."
netlify deploy --prod --dir=dist

echo "✅ Deployment complete! Your app is live!"
echo "🧪 Run the QA checklist from DEPLOYMENT_QA_PLAN.md"

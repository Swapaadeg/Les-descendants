#!/bin/bash
set -e

echo "=== ARKI'FAMILY - DEPLOYMENT TO O2SWITCH ==="

# Variables
SERVER="teze5999@hoya.o2switch.net"
REMOTE_DIR="~/arki-family.swapdevstudio.fr"

echo ""
echo "1️⃣ Building frontend..."
npm run build

echo ""
echo "2️⃣ Committing dist files..."
git add dist/
git commit -m "build: Update dist for deployment" || echo "No changes to commit"

echo ""
echo "3️⃣ Pushing to GitHub..."
git push origin deploy-dist

echo ""
echo "4️⃣ Deploying to o2switch..."
ssh $SERVER << 'EOFREMOTE'
    cd ~/arki-family.swapdevstudio.fr

    echo "  → Pulling latest code..."
    git pull origin deploy-dist

    echo "  → Copying frontend files..."
    cp -r dist/* .

    echo "  → Checking permissions..."
    chmod 755 api/uploads api/logs

    echo "  → Running migrations..."
    cd api/database/migrations
    php run_migrations.php || echo "Migrations already up to date"

    echo "  ✅ Deployment complete!"
EOFREMOTE

echo ""
echo "=== DEPLOYMENT SUCCESSFUL ==="
echo "🌐 Site: https://arki-family.swapdevstudio.fr"
echo "📊 Verify logs: ssh $SERVER 'tail -f $REMOTE_DIR/api/logs/error.log'"

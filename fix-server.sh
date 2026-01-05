#!/bin/bash
set -e

cd ~/arki-family.swapdevstudio.fr

echo "=== Current git status ==="
git status

echo ""
echo "=== Checking config.php for sendJsonResponse ==="
if grep -q "function sendJsonResponse" api/config.php; then
    echo "✓ sendJsonResponse found in config.php"
else
    echo "✗ sendJsonResponse NOT found - will force update"
fi

echo ""
echo "=== Resetting to origin/deploy-dist ==="
git fetch origin
git reset --hard origin/deploy-dist

echo ""
echo "=== Verifying sendJsonResponse is now present ==="
if grep -q "function sendJsonResponse" api/config.php; then
    echo "✓ SUCCESS: sendJsonResponse is now in config.php"
else
    echo "✗ FAIL: sendJsonResponse still missing!"
fi

echo ""
echo "=== Current config.php line count ==="
wc -l api/config.php

echo ""
echo "✓ Done!"

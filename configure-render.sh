#!/bin/bash
# Configure WireGuard for Render deployment

set -e

echo "=== WireGuard Configuration for Render ==="
echo ""

# Try multiple ways to get public IP
echo "🔍 Discovering your public IP..."
PUBLIC_IP=""

# Try method 1
if command -v curl &> /dev/null; then
    PUBLIC_IP=$(curl -s --max-time 2 https://checkip.amazonaws.com 2>/dev/null || echo "")
fi

# Try method 2
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP=$(curl -s --max-time 2 http://icanhazip.com 2>/dev/null || echo "")
fi

# Try method 3
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP=$(dig +short myip.opendns.com @resolver1.opendns.com 2>/dev/null || echo "")
fi

if [ -z "$PUBLIC_IP" ]; then
    echo "❌ Could not auto-detect public IP"
    echo "📝 Please enter your public IP (from: https://whatismyipaddress.com/):"
    read -p "Your public IP: " PUBLIC_IP
fi

echo "✅ Public IP: $PUBLIC_IP"
echo ""

# Verify IP format
if ! [[ $PUBLIC_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo "❌ Invalid IP format: $PUBLIC_IP"
    exit 1
fi

# Update .env.wireguard
echo "📝 Updating .env.wireguard..."
sed -i "s/YOUR_PUBLIC_IP_HERE/$PUBLIC_IP/g" .env.wireguard

# Update wireguard-config/wg0.conf
echo "📝 Updating wireguard-config/wg0.conf..."
sed -i "s/YOUR_PUBLIC_IP_HERE/$PUBLIC_IP/g" wireguard-config/wg0.conf

echo ""
echo "✅ Configuration updated!"
echo ""
echo "📋 Summary:"
echo "   Server Public Key: a7t+jzOb7pGa9X1P/9zrtkwSVSOJsqOdVE77mRN6lyA="
echo "   Client Private Key: ACatqUC7diI0F5bQu5/5NGDbl0mQSbd7lsJIye9kYH4="
echo "   Endpoint: $PUBLIC_IP:51820"
echo "   WireGuard Subnet: 10.0.0.0/24"
echo ""
echo "📁 Files ready:"
echo "   ✓ .env.wireguard"
echo "   ✓ wireguard-config/wg0.conf"
echo "   ✓ docker-compose-render-wg.yml"
echo ""
echo "Next steps:"
echo "  1. Review .env.wireguard"
echo "  2. git add .env.wireguard wireguard-config/"
echo "  3. git commit -m 'Add WireGuard configuration'"
echo "  4. git push"
echo "  5. Render will auto-deploy"
echo ""

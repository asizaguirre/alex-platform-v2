# Render Deployment Configuration
# Deploy script that configures WireGuard + application

#!/bin/bash

set -e

echo "=== Render Deployment Script ==="
echo ""

# Install WireGuard
echo "📦 Installing WireGuard..."
apt-get update
apt-get install -y wireguard wireguard-tools iproute2

# Enable IP forwarding
echo "🔧 Enabling IP forwarding..."
echo 1 > /proc/sys/net/ipv4/ip_forward

# Build application
echo "🔨 Building Spring Boot application..."
cd /app/backend
mvn clean package -DskipTests

echo ""
echo "✅ Build complete!"
echo "ℹ️  WireGuard variables will be configured at runtime via environment variables"
echo ""

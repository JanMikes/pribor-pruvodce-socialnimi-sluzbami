#!/bin/sh
set -ea

# Install npm dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  if [ -f "package-lock.json" ]; then
    npm ci
  else
    npm install
  fi
fi

# Build strapi if dist is missing or outdated
if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
  echo "Building Strapi..."
  npm run build
fi

exec "$@"

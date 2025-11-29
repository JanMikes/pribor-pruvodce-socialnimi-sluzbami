#!/bin/sh
set -ea

# Install npm dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm ci
fi

exec "$@"

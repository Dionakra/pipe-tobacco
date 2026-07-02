#!/bin/bash
# Optimize all SVG logos in public/logos/ using svgo
set -e

if ! command -v npx &> /dev/null; then
  echo "npx is required"
  exit 1
fi

echo "Optimizing SVG logos in public/logos/..."
for f in public/logos/*.svg; do
  npx svgo "$f" --output "$f" 2>&1 | grep -E "Done" || true
done
echo "Done."

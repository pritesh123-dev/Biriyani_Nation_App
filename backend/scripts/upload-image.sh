#!/usr/bin/env bash
# Uploads a dish photo and prints the key to paste into the admin panel.
#   ./scripts/upload-image.sh chicken.jpg dishes/chicken.jpg
set -euo pipefail

FILE="${1:?usage: upload-image.sh <local-file> <s3-key>}"
KEY="${2:?usage: upload-image.sh <local-file> <s3-key>}"
STACK="${STACK_NAME:-biriyani-nation}"
REGION="${AWS_REGION:-ap-south-1}"

BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='MediaBucket'].OutputValue" --output text)
CDN=$(aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='MediaUrl'].OutputValue" --output text)

# Long max-age is safe because a new photo gets a new key.
aws s3 cp "$FILE" "s3://${BUCKET}/${KEY}" --region "$REGION" \
  --cache-control "public, max-age=31536000, immutable"

echo
echo "Uploaded. Paste this key into the dish's Photo field:"
echo "  ${KEY}"
echo "Public URL: ${CDN}/${KEY}"

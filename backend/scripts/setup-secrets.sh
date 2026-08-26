#!/usr/bin/env bash
# Creates the SSM parameters the API needs. Standard-tier parameters are
# free — this is why we do not use Secrets Manager ($0.40/secret/month).
set -euo pipefail

STAGE="${1:-prod}"
REGION="${AWS_REGION:-ap-south-1}"
P="/biriyani-nation/${STAGE}"

echo "Setting up secrets for stage '${STAGE}' in ${REGION}"

# 1. JWT signing key — generated here, never typed by a human.
if aws ssm get-parameter --name "${P}/jwt-secret" --region "$REGION" >/dev/null 2>&1; then
  echo "  jwt-secret already exists, leaving it alone"
else
  SECRET=$(openssl rand -base64 48)
  aws ssm put-parameter --region "$REGION" \
    --name "${P}/jwt-secret" --type SecureString --value "$SECRET" \
    --description "HMAC key for BiriyaniNation session tokens" >/dev/null
  echo "  jwt-secret created"
fi

# 2. WhatsApp Cloud API credentials.
read -rp "  WhatsApp permanent access token (blank to skip): " WA_TOKEN
if [ -n "$WA_TOKEN" ]; then
  aws ssm put-parameter --region "$REGION" --overwrite \
    --name "${P}/whatsapp-token" --type SecureString --value "$WA_TOKEN" >/dev/null
  read -rp "  WhatsApp phone number ID: " WA_ID
  aws ssm put-parameter --region "$REGION" --overwrite \
    --name "${P}/whatsapp-phone-id" --type SecureString --value "$WA_ID" >/dev/null
  echo "  whatsapp credentials stored"
fi

echo
echo "Done. Parameters under ${P}/"
aws ssm get-parameters-by-path --path "$P" --region "$REGION" \
  --query 'Parameters[].Name' --output table 2>/dev/null || true

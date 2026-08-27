#!/usr/bin/env bash
# Lists every registered customer, regardless of signup date.
#
# The admin panel's Customers tab queries one day at a time (cheap, uses
# an index). This script scans the whole table instead — fine at a
# cloud-kitchen's scale (hundreds to low thousands of customers), not
# something you'd want at Zomato scale.
#
#   ./scripts/list-customers.sh [table-name]
set -euo pipefail

TABLE="${1:-biriyani-nation-prod}"
REGION="${AWS_REGION:-ap-south-1}"

aws dynamodb scan \
  --table-name "$TABLE" \
  --region "$REGION" \
  --filter-expression "sk = :sk" \
  --expression-attribute-values '{":sk":{"S":"PROFILE"}}' \
  --query 'Items[].{phone:phone.S, name:displayName.S, coins:coins.N, orders:orderCount.N, spent:totalSpent.N, joined:createdAt.S}' \
  --output table

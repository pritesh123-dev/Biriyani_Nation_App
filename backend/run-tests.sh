#!/usr/bin/env bash
# Bundles each test file (so TS + ESM imports resolve) and runs it on plain node.
set -euo pipefail
cd "$(dirname "$0")"
status=0
for f in tests/*.test.ts; do
  out=".test-$(basename "$f" .test.ts).mjs"
  ./node_modules/.bin/esbuild "$f" --bundle --platform=node --target=node22 \
    --format=esm --outfile="$out" '--external:@aws-sdk/*' >/dev/null
  node "$out" || status=1
  rm -f "$out"
done
exit $status

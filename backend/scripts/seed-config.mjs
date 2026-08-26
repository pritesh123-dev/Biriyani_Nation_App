#!/usr/bin/env node
/**
 * Materialises the default menu into DynamoDB so it becomes editable
 * from the admin panel.
 *
 * Strictly optional: the API already falls back to these same defaults
 * when no CONFIG row exists, so the app works the moment it deploys.
 * Running this just means the admin panel starts from a stored copy.
 *
 *   node scripts/seed-config.mjs biriyani-nation-prod [--force]
 */
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const table = process.argv[2];
if (!table) {
  console.error('Usage: node scripts/seed-config.mjs <table-name> [--force]');
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Bundle the TypeScript source so the seed can never drift from the shape
// the running API expects. The bundle is emitted inside the project (not
// a temp dir) so its external @aws-sdk imports resolve against
// node_modules.
const out = join(root, '.seed-config.mjs');
try {
  execFileSync(
    join(root, 'node_modules/.bin/esbuild'),
    [join(root, 'src/lib/config.ts'), '--bundle', '--platform=node',
     '--target=node20', '--format=esm', `--outfile=${out}`, '--external:@aws-sdk/*'],
    { stdio: 'pipe' },
  );

  const { DEFAULT_CONFIG } = await import(pathToFileURL(out).href);

  const ddb = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }),
  );

  const existing = await ddb.send(new GetCommand({
    TableName: table, Key: { pk: 'CONFIG', sk: 'CURRENT' },
  }));

  if (existing.Item && !process.argv.includes('--force')) {
    console.log(
      `Config already exists (version ${existing.Item.config?.version ?? 0}). ` +
      'Pass --force to overwrite it.',
    );
    process.exit(0);
  }

  await ddb.send(new PutCommand({
    TableName: table,
    Item: {
      pk: 'CONFIG', sk: 'CURRENT',
      config: { ...DEFAULT_CONFIG, updatedAt: new Date().toISOString() },
    },
  }));

  console.log(
    `Seeded ${DEFAULT_CONFIG.dishes.length} dishes and ` +
    `${DEFAULT_CONFIG.addons.length} add-ons into ${table}.`,
  );
} finally {
  rmSync(out, { force: true });
}

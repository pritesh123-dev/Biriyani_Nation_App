import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand,
  UpdateCommand, DeleteCommand, TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE = process.env.TABLE_NAME!;

/**
 * Key layout (single table).
 *
 *   USER#<phone>   / PROFILE            one row per registered customer
 *   USER#<phone>   / ORDER#<isoTs>      that customer's order history
 *   OTP#<phone>    / CHALLENGE          hashed code, self-deletes via ttl
 *   RATE#<phone>   / <window>           OTP send throttle, self-deletes via ttl
 *   ORDER#<id>     / META               the order itself
 *   CONFIG         / CURRENT            menu, prices, images, store settings
 *   COUNTER        / ORDER              daily order-number sequence
 *
 * gsi1 gives the kitchen "today's orders, newest first":
 *   gsi1pk = ORDERS#<yyyy-mm-dd>, gsi1sk = <isoTs>#<orderId>
 */
export const K = {
  user:      (phone: string) => ({ pk: `USER#${phone}`, sk: 'PROFILE' }),
  userOrder: (phone: string, ts: string) => ({ pk: `USER#${phone}`, sk: `ORDER#${ts}` }),
  otp:       (phone: string) => ({ pk: `OTP#${phone}`,  sk: 'CHALLENGE' }),
  rate:      (phone: string, window: string) => ({ pk: `RATE#${phone}`, sk: window }),
  order:     (id: string)    => ({ pk: `ORDER#${id}`,   sk: 'META' }),
  config:    ()              => ({ pk: 'CONFIG',        sk: 'CURRENT' }),
  counter:   (day: string)   => ({ pk: 'COUNTER',       sk: `ORDER#${day}` }),
};

export async function getItem<T>(key: Record<string, string>): Promise<T | null> {
  const r = await ddb.send(new GetCommand({ TableName: TABLE, Key: key }));
  return (r.Item as T) ?? null;
}

export async function putItem(item: object): Promise<void> {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
}

export async function deleteItem(key: Record<string, string>): Promise<void> {
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: key }));
}

export { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand, TransactWriteCommand };

/** Unix seconds, for DynamoDB TTL attributes. */
export const ttlIn = (seconds: number) => Math.floor(Date.now() / 1000) + seconds;

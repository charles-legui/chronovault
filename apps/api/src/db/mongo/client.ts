import { MongoClient, Db } from 'mongodb';
import { dbConfig } from '../../config/database.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(dbConfig.mongo.uri);
  await client.connect();
  db = client.db(dbConfig.mongo.dbName);

  console.log(`[mongo] connected to "${dbConfig.mongo.dbName}"`);
  return db;
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[mongo] disconnected');
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongo() first.');
  }
  return db;
}

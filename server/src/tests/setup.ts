import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export default async function globalSetup() {
  const replset = await MongoMemoryReplSet.create({
    replSet: { storageEngine: 'wiredTiger' },
  });
  const uri = replset.getUri();

  // Store replset instance on global for teardown access
  (global as any).__MONGOD__ = replset;

  process.env['MONGODB_URI'] = uri;
  process.env['NODE_ENV'] = 'test';
  process.env['JWT_SECRET'] = 'test-secret-key';

  console.log('MongoDB Memory Replica Set started at:', uri);
}

export async function globalTeardown() {
  const mongod = (global as any).__MONGOD__;
  if (mongod) {
    await mongod.stop();
    console.log('MongoDB Memory Server stopped');
  }
}

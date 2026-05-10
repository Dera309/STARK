import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export default async function globalTeardown() {
  console.log('Global teardown called');
  const mongod = (global as any).__MONGOD__;
  console.log('MongoD instance:', !!mongod);
  if (mongod) {
    console.log('Stopping MongoDB Memory Server...');
    await mongod.stop();
    console.log('MongoDB Memory Server stopped');
  } else {
    console.log('No MongoD instance found to stop');
  }

  // Force close mongoose connections
  console.log('Closing mongoose connections...');
  await mongoose.disconnect();
  console.log('Mongoose disconnected');
}
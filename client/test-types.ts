// Test file to check if Notification type can be imported
import { Notification } from './src/types';

const test: Notification = {
  _id: 'test',
  userId: 'test',
  type: 'SYSTEM',
  title: 'Test',
  body: 'Test',
  read: false,
  channel: 'IN_APP',
  createdAt: new Date()
};

console.log('Notification type works:', test);

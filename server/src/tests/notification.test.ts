import mongoose from 'mongoose';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Notification } from '../models/Notification';
import { makeRequest, createAuthHeader } from './helpers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Notification Integration Tests', () => {
  let adminToken: string;
  let adminId: string;
  let userId: string;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Role.deleteMany({});
    await Notification.deleteMany({});

    // 1. Create Roles
    const adminRole = new Role({ name: 'ADMIN', permissions: ['*'] });
    await adminRole.save();
    const customerRole = new Role({ name: 'CUSTOMER', permissions: [] });
    await customerRole.save();

    // 2. Create Admin
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@stark.com',
      phone: '111',
      passwordHash: 'h',
      roleId: adminRole._id,
      kycStatus: 'VERIFIED',
    });
    await admin.save();
    adminId = admin._id.toString();
    adminToken = jwt.sign({ userId: adminId, jti: 'a1' }, env.JWT_SECRET);

    // 3. Create Normal User
    const user = new User({
      firstName: 'Normal',
      lastName: 'User',
      email: 'user@stark.com',
      phone: '222',
      passwordHash: 'h',
      roleId: customerRole._id,
      kycStatus: 'PENDING',
    });
    await user.save();
    userId = user._id.toString();

    // Mock Sessions
    const { Session } = await import('../models/Session');
    await Session.create([
      { userId: adminId, token: 'a1', deviceFingerprint: 'x', ipAddress: 'y', expiresAt: new Date(Date.now() + 100000) }
    ]);
  });

  it('should notify admins when a user KYC status is updated', async () => {
    // 1. Trigger KYC update (as admin)
    const res = await makeRequest()
      .patch(`/api/v1/admin/users/${userId}/kyc`)
      .set(createAuthHeader(adminToken))
      .send({ status: 'VERIFIED', tier: 1 });

    expect(res.status).toBe(200);

    // 2. Check if a notification was created for the admin
    const adminNotifications = await Notification.find({ userId: adminId });
    expect(adminNotifications.length).toBeGreaterThan(0);
    
    const kycNotification = adminNotifications.find(n => n.type === 'KYC_UPDATE');
    expect(kycNotification).toBeDefined();
    expect(kycNotification!.title).toContain('Admin Action: KYC');
  });

  it('should notify admins when a system event occurs (simulated)', async () => {
    // This tests the notifyAdmins method directly or via an event
    const { notificationService } = await import('../services/notificationService');
    
    await notificationService.notifyAdmins('SYSTEM', 'Test Alert', 'Something happened');
    
    const adminNotifications = await Notification.find({ userId: adminId });
    expect(adminNotifications.some(n => n.title === 'Test Alert')).toBe(true);
  });
});

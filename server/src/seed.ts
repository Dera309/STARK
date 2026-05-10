import { Role } from './models/Role';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

export const seedRoles = async () => {
  try {
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      await Role.create({
        name: 'ADMIN',
        permissions: ['*'],
        isBuiltIn: true,
      });
      console.log('✅ Created ADMIN role');
    }

    const customerRole = await Role.findOne({ name: 'CUSTOMER' });
    if (!customerRole) {
      await Role.create({
        name: 'CUSTOMER',
        permissions: ['basic_banking'],
        isBuiltIn: true,
      });
      console.log('✅ Created CUSTOMER role');
    }
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  }
};

export const seedAdminUser = async () => {
  try {
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      console.warn('⚠️ Cannot seed admin: ADMIN role not found');
      return;
    }

    const adminEmail = 'admin@stark.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: adminEmail,
        phone: '0000000000',
        passwordHash: 'StarkAdmin123!',
        roleId: adminRole._id,
        kycStatus: 'VERIFIED',
        kycTier: 3,
        status: 'ACTIVE',
      });
      console.log('✅ Created default ADMIN user: admin@stark.com');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
};

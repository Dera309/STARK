const axios = require('axios');

// Force unlock a specific user
async function forceUnlockUser() {
  try {
    console.log('=== FORCE UNLOCKING USER ===');

    // Login as admin
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'admin-device'
    });
    
    const adminToken = adminLogin.data.token;
    console.log('Admin login successful');

    const adminApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Get users
    const usersResponse = await adminApi.get('/admin/users');
    const testUser = usersResponse.data.find(u => u.email === 'john@example.com');
    
    if (!testUser) {
      console.log('Test user not found');
      return;
    }

    console.log(`Found user: ${testUser.email}`);
    console.log(`Current status: ${testUser.status}`);
    console.log(`Failed attempts: ${testUser.failedLoginAttempts}`);
    console.log(`Locked until: ${testUser.lockedUntil}`);

    // Force unlock by updating user directly
    console.log('\nForce unlocking user...');
    await adminApi.patch(`/admin/users/${testUser._id}`, {
      status: 'ACTIVE',
      failedLoginAttempts: 0,
      lockedUntil: null
    });
    
    console.log('User force unlocked successfully');

    // Verify unlock
    const updatedUserResponse = await adminApi.get(`/admin/users/${testUser._id}`);
    const updatedUser = updatedUserResponse.data;
    
    console.log('\nUpdated user status:');
    console.log(`Status: ${updatedUser.status}`);
    console.log(`Failed attempts: ${updatedUser.failedLoginAttempts}`);
    console.log(`Locked until: ${updatedUser.lockedUntil}`);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

forceUnlockUser();

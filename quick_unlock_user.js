const axios = require('axios');

// Quick unlock using the correct endpoint
async function quickUnlockUser() {
  try {
    console.log('=== QUICK UNLOCK USER ===');

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

    // Use the correct endpoint to manage user status
    console.log('\nUnlocking user account...');
    await adminApi.patch(`/admin/users/${testUser._id}/status`, {
      status: 'ACTIVE'
    });
    
    console.log('User unlocked successfully');

    // Verify unlock
    const updatedUsersResponse = await adminApi.get('/admin/users');
    const updatedUser = updatedUsersResponse.data.find(u => u.email === 'john@example.com');
    
    console.log('\nUpdated user status:');
    console.log(`Status: ${updatedUser.status}`);
    console.log(`Failed attempts: ${updatedUser.failedLoginAttempts}`);
    console.log(`Locked until: ${updatedUser.lockedUntil}`);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

quickUnlockUser();

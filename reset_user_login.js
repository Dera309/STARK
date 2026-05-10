const axios = require('axios');

// Reset user login attempts directly via database update simulation
async function resetUserLogin() {
  try {
    console.log('=== RESET USER LOGIN ATTEMPTS ===');

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
    console.log(`Current failed attempts: ${testUser.failedLoginAttempts}`);
    console.log(`Locked until: ${testUser.lockedUntil}`);

    // Try to update user with reset fields
    console.log('\nResetting user login attempts...');
    try {
      // Try using the manageUserStatus endpoint with additional fields
      await adminApi.patch(`/admin/users/${testUser._id}/status`, {
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        lockedUntil: null
      });
      console.log('User reset via status endpoint');
    } catch (statusError) {
      console.log('Status endpoint failed, trying direct user update...');
      
      // If that doesn't work, we'll need to create a direct endpoint
      // For now, let's just try to wait for the lock to expire
      console.log('Lock expires at:', new Date(testUser.lockedUntil).toLocaleString());
      console.log('Current time:', new Date().toLocaleString());
      
      const lockExpiration = new Date(testUser.lockedUntil);
      const now = new Date();
      
      if (lockExpiration > now) {
        const waitTime = lockExpiration - now;
        console.log(`Need to wait ${Math.ceil(waitTime / 60000)} minutes for lock to expire`);
        console.log('Forcing lock expiration by updating timestamp...');
        
        // Set lock time to past
        await adminApi.patch(`/admin/users/${testUser._id}/status`, {
          status: 'ACTIVE'
        });
        
        // Then try a different approach - set lockedUntil to past date
        console.log('Attempting to force unlock by setting past lock time...');
      }
    }

    // Check final status
    const finalUsersResponse = await adminApi.get('/admin/users');
    const finalUser = finalUsersResponse.data.find(u => u.email === 'john@example.com');
    
    console.log('\nFinal user status:');
    console.log(`Status: ${finalUser.status}`);
    console.log(`Failed attempts: ${finalUser.failedLoginAttempts}`);
    console.log(`Locked until: ${finalUser.lockedUntil}`);

    // Try user login
    console.log('\nTesting user login...');
    try {
      const userLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
        email: 'john@example.com',
        password: 'Password123!',
        deviceFingerprint: 'test-device'
      });
      
      console.log('✅ User login successful!');
      console.log('User token:', userLogin.data.token.substring(0, 20) + '...');
      
      return userLogin.data.token;
      
    } catch (loginError) {
      console.log('❌ User login still failed:', loginError.response?.data?.message);
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

resetUserLogin();

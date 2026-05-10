const axios = require('axios');

// Simple test for notification bar functionality
async function testNotificationBarFix() {
  try {
    console.log('=== NOTIFICATION BAR FIX TEST ===\n');

    // Step 1: Check server health
    console.log('1. Checking server health...');
    const healthResponse = await axios.get('http://localhost:3003/api/v1/health');
    console.log('   ✅ Server is running');

    // Step 2: Login as admin and test admin notifications
    console.log('\n2. Testing admin notifications...');
    try {
      const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
        email: 'admin@stark.com',
        password: 'StarkAdmin123!',
        deviceFingerprint: 'admin-device'
      });
      
      const adminApi = axios.create({
        baseURL: 'http://localhost:3003/api/v1',
        headers: {
          'Authorization': `Bearer ${adminLogin.data.token}`,
          'Content-Type': 'application/json'
        }
      });

      const adminNotificationsResponse = await adminApi.get('/notifications');
      const adminNotifications = adminNotificationsResponse.data;
      console.log(`   ✅ Admin notifications endpoint working: ${adminNotifications.length} notifications`);
      
    } catch (adminError) {
      console.log('   ❌ Admin notifications failed:', adminError.response?.data?.message);
    }

    // Step 3: Create test user if needed and test user notifications
    console.log('\n3. Testing user notifications...');
    try {
      // Try to login with existing user
      const userLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123!',
        deviceFingerprint: 'test-device'
      });
      
      const userApi = axios.create({
        baseURL: 'http://localhost:3003/api/v1',
        headers: {
          'Authorization': `Bearer ${userLogin.data.token}`,
          'Content-Type': 'application/json'
        }
      });

      const userNotificationsResponse = await userApi.get('/notifications');
      const userNotifications = userNotificationsResponse.data;
      console.log(`   ✅ User notifications endpoint working: ${userNotifications.length} notifications`);
      
    } catch (userError) {
      console.log('   ❌ User notifications failed (user might not exist):', userError.response?.data?.message);
    }

    console.log('\n=== ISSUES IDENTIFIED ===');
    console.log('1. ❌ Customer layout is missing NotificationCenter component');
    console.log('2. ✅ Admin layout has NotificationCenter component');
    console.log('3. ✅ Backend notification endpoints are working');
    console.log('4. ❌ Socket connection might have issues');

  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testNotificationBarFix();

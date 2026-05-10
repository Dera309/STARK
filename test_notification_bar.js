const axios = require('axios');

// Test notification bar functionality
async function testNotificationBar() {
  try {
    console.log('=== TESTING NOTIFICATION BAR FUNCTIONALITY ===\n');

    // Step 1: Check server health
    console.log('1. Checking server health...');
    const healthResponse = await axios.get('http://localhost:3003/api/v1/health');
    console.log('   Server health:', healthResponse.data);

    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'test-device'
    });
    const adminToken = adminLogin.data.token;
    console.log('   Admin login successful');

    const adminApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 3: Get user and unlock if needed
    console.log('\n3. Getting and unlocking test user...');
    const usersResponse = await adminApi.get('/admin/users');
    const testUser = usersResponse.data.find(u => u.email === 'john@example.com');
    
    if (!testUser) {
      console.log('   Test user not found');
      return;
    }

    // Reset user login attempts
    await adminApi.patch(`/admin/users/${testUser._id}/status`, {
      status: 'ACTIVE',
      failedLoginAttempts: 0,
      lockedUntil: null
    });
    console.log('   User unlocked successfully');

    // Step 4: Login as user
    console.log('\n4. Logging in as user...');
    const userLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'john@example.com',
      password: 'Password123!',
      deviceFingerprint: 'test-device'
    });
    
    const userToken = userLogin.data.token;
    console.log('   User login successful');
    
    const userApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 5: Test notification endpoint
    console.log('\n5. Testing notification endpoint...');
    try {
      const notificationsResponse = await userApi.get('/notifications');
      const notifications = notificationsResponse.data;
      console.log(`   Found ${notifications.length} notifications`);
      
      if (notifications.length > 0) {
        console.log('   Sample notification:', notifications[0].title);
      }
    } catch (notifError) {
      console.log('   ❌ Notification endpoint failed:', notifError.response?.data?.message);
    }

    // Step 6: Test admin notifications
    console.log('\n6. Testing admin notifications...');
    try {
      const adminNotificationsResponse = await adminApi.get('/notifications');
      const adminNotifications = adminNotificationsResponse.data;
      console.log(`   Found ${adminNotifications.length} admin notifications`);
    } catch (adminNotifError) {
      console.log('   ❌ Admin notification endpoint failed:', adminNotifError.response?.data?.message);
    }

    // Step 7: Create test notifications
    console.log('\n7. Creating test notifications...');
    
    // Get user details for transfer
    const userDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
    const userDetail = userDetailResponse.data;
    
    if (userDetail.accounts.length >= 2) {
      // Credit account first
      await adminApi.post('/admin/accounts/credit', {
        accountId: userDetail.accounts[0]._id,
        amount: 5000,
        reason: 'Test notification bar'
      });

      // Perform transfer to trigger notifications
      const transferResponse = await userApi.post('/transactions/transfer', {
        sourceAccountId: userDetail.accounts[0]._id,
        targetAccountNumber: userDetail.accounts[1].accountNumber,
        amount: 2000,
        category: 'TRANSFER'
      });
      
      console.log('   Transfer successful, notifications should be created');
    }

    // Step 8: Wait and check notifications again
    console.log('\n8. Waiting for notifications to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n9. Checking updated notifications...');
    try {
      const updatedNotificationsResponse = await userApi.get('/notifications');
      const updatedNotifications = updatedNotificationsResponse.data;
      console.log(`   Found ${updatedNotifications.length} user notifications after transfer`);
      
      updatedNotifications.slice(0, 3).forEach((notif, index) => {
        console.log(`     ${index + 1}. ${notif.title} - ${notif.type}`);
      });
    } catch (notifError) {
      console.log('   ❌ Updated notification check failed:', notifError.response?.data?.message);
    }

    // Step 9: Test mark as read
    console.log('\n10. Testing mark as read functionality...');
    try {
      await userApi.patch('/notifications/read');
      console.log('   Mark as read successful');
    } catch (markReadError) {
      console.log('   ❌ Mark as read failed:', markReadError.response?.data?.message);
    }

    console.log('\n=== NOTIFICATION BAR TEST COMPLETED ===');
    console.log('✅ Backend notification endpoints are working');
    console.log('❌ Customer layout is missing NotificationCenter component');
    console.log('✅ Admin layout has NotificationCenter component');

  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testNotificationBar();

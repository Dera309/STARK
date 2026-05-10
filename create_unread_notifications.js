const axios = require('axios');

// Create unread notifications to test the mark-as-read button
async function createUnreadNotifications() {
  try {
    console.log('=== CREATING UNREAD NOTIFICATIONS FOR TESTING ===\n');

    // Step 1: Login as admin
    console.log('1. Login as admin...');
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'test-device'
    });
    
    const adminApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${adminLogin.data.token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 2: Get users to work with
    console.log('\n2. Getting users...');
    const usersResponse = await adminApi.get('/admin/users');
    const testUser = usersResponse.data.find(u => u.email === 'john@example.com');
    
    if (!testUser) {
      console.log('   ❌ Test user not found');
      return;
    }

    console.log(`   ✅ Found test user: ${testUser.email}`);

    // Step 3: Get user details including accounts
    console.log('\n3. Getting user account details...');
    const userDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
    const userDetail = userDetailResponse.data;
    
    if (!userDetail.accounts || userDetail.accounts.length === 0) {
      console.log('   ❌ No accounts found for user');
      return;
    }

    console.log(`   ✅ Found ${userDetail.accounts.length} accounts`);
    const firstAccount = userDetail.accounts[0];
    console.log(`   📋 Using account: ${firstAccount.accountNumber}`);

    // Step 4: Reset user and create notifications
    console.log('\n4. Resetting user and creating notifications...');
    
    // Reset user
    await adminApi.patch(`/admin/users/${testUser._id}/status`, {
      status: 'ACTIVE',
      failedLoginAttempts: 0,
      lockedUntil: null
    });

    // Credit account to create notification
    console.log('   💰 Crediting account...');
    await adminApi.post('/admin/accounts/credit', {
      accountId: firstAccount._id,
      amount: 3000, // $30.00
      reason: 'Test notification creation'
    });

    // Wait for notification to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Check notifications
    console.log('\n5. Checking created notifications...');
    const notificationsResponse = await adminApi.get('/notifications');
    const notifications = notificationsResponse.data;
    
    console.log(`   📬 Total notifications: ${notifications.length}`);
    
    // Find unread notifications
    const unreadNotifications = notifications.filter(n => !n.read);
    console.log(`   🔔 Unread notifications: ${unreadNotifications.length}`);
    
    if (unreadNotifications.length > 0) {
      console.log('\n6. Unread notifications found:');
      unreadNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title}`);
        console.log(`      Type: ${notif.type}`);
        console.log(`      Read: ${notif.read}`);
        console.log('');
      });
      
      console.log('✅ SUCCESS: Unread notifications created!');
      console.log('🔍 The "Mark All as Read" button should now be visible in the notification panel');
      console.log('🧪 Test the button by:');
      console.log('   1. Opening the notification panel');
      console.log('   2. Looking for the "Mark All as Read" button in the footer');
      console.log('   3. Clicking the button to test functionality');
      
    } else {
      console.log('   ❌ No unread notifications created');
      
      // Try creating manual notification
      console.log('\n6. Creating manual notification...');
      try {
        // Direct notification creation via database simulation
        await adminApi.post('/admin/users/notify', {
          userId: testUser._id,
          type: 'SYSTEM',
          title: 'Test Notification',
          body: 'This is a test notification for debugging the mark-as-read button'
        });
      } catch (manualError) {
        console.log('   Manual notification creation failed, trying alternative...');
        
        // Create another transaction to trigger notification
        if (userDetail.accounts.length >= 2) {
          // Login as user to perform transfer
          const userLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
            email: 'john@example.com',
            password: 'Password123!',
            deviceFingerprint: 'test-device'
          });
          
          const userApi = axios.create({
            baseURL: 'http://localhost:3003/api/v1',
            headers: {
              'Authorization': `Bearer ${userLogin.data.token}`,
              'Content-Type': 'application/json'
            }
          });

          // Perform transfer
          await userApi.post('/transactions/transfer', {
            sourceAccountId: firstAccount._id,
            targetAccountNumber: userDetail.accounts[1].accountNumber,
            amount: 1000, // $10.00
            category: 'TRANSFER'
          });
          
          console.log('   🔄 Transfer performed to create notifications');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check final notifications
          const finalNotificationsResponse = await adminApi.get('/notifications');
          const finalNotifications = finalNotificationsResponse.data;
          const finalUnreadCount = finalNotifications.filter(n => !n.read).length;
          
          console.log(`   📬 Final notifications: ${finalNotifications.length}`);
          console.log(`   🔔 Final unread count: ${finalUnreadCount}`);
          
          if (finalUnreadCount > 0) {
            console.log('   ✅ SUCCESS: Unread notifications created via transfer!');
          }
        }
      }
    }

    console.log('\n=== TESTING INSTRUCTIONS ===');
    console.log('1. Open the admin dashboard in your browser');
    console.log('2. Click the notification bell icon');
    console.log('3. Look for the "Mark All as Read" button in the footer');
    console.log('4. If button is visible, click it to test functionality');
    console.log('5. Verify that all notifications are marked as read');

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

createUnreadNotifications();

const axios = require('axios');

// Debug notification system step by step
async function debugNotifications() {
  try {
    console.log('=== DEBUGGING NOTIFICATION SYSTEM ===\n');

    // Step 1: Check server health
    console.log('1. Checking server health...');
    const healthResponse = await axios.get('http://localhost:3003/api/v1/health');
    console.log('   Server health:', healthResponse.data);

    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'debug-device'
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

    // Step 3: Get user details
    console.log('\n3. Getting user details...');
    const usersResponse = await adminApi.get('/admin/users');
    const testUser = usersResponse.data.find(u => u.email === 'john@example.com');
    
    if (!testUser) {
      console.log('   Test user not found');
      return;
    }

    const userDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
    const userDetail = userDetailResponse.data;
    console.log(`   Found user: ${testUser.email} with ${userDetail.accounts.length} accounts`);
    
    userDetail.accounts.forEach((acc, index) => {
      console.log(`     ${index + 1}. ${acc.type} - ${acc.accountNumber} - Balance: ${(acc.balance / 100).toLocaleString()} ${acc.currency}`);
    });

    if (userDetail.accounts.length < 2) {
      console.log('   Need at least 2 accounts for transfer testing');
      return;
    }

    // Step 4: Credit account to have funds
    console.log('\n4. Crediting account to have funds...');
    const creditResponse = await adminApi.post('/admin/accounts/credit', {
      accountId: userDetail.accounts[0]._id,
      amount: 2000, // $20.00
      reason: 'Debug notification test'
    });
    console.log('   Credit successful:', creditResponse.data.message);

    // Step 5: Wait and check notifications
    console.log('\n5. Waiting for notifications to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 6: Check user notifications via admin API
    console.log('\n6. Checking user notifications...');
    try {
      // First try to login as the user to check notifications
      console.log('   Attempting to login as user to check notifications...');
      
      const userLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
        email: 'john@example.com',
        password: 'Password123!',
        deviceFingerprint: 'debug-device'
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

      // Get notifications
      const notificationsResponse = await userApi.get('/notifications');
      const notifications = notificationsResponse.data;
      
      console.log(`   Found ${notifications.length} notifications:`);
      notifications.forEach((notif, index) => {
        console.log(`     ${index + 1}. ${notif.title}`);
        console.log(`        ${notif.body}`);
        console.log(`        Type: ${notif.type}, Read: ${notif.read}`);
        console.log(`        Created: ${new Date(notif.createdAt).toLocaleString()}`);
        console.log('');
      });

      // Step 7: Test transfer if we have funds
      if (userDetail.accounts[0].balance >= 1000) {
        console.log('\n7. Testing transfer with notifications...');
        
        const transferResponse = await userApi.post('/transactions/transfer', {
          sourceAccountId: userDetail.accounts[0]._id,
          targetAccountNumber: userDetail.accounts[1].accountNumber,
          amount: 1000, // $10.00
          category: 'TRANSFER'
        });
        
        console.log('   Transfer successful:', transferResponse.data.message);
        
        // Wait for notifications
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check updated notifications
        const updatedNotificationsResponse = await userApi.get('/notifications');
        const updatedNotifications = updatedNotificationsResponse.data;
        
        console.log(`   Updated notifications (${updatedNotifications.length}):`);
        updatedNotifications.slice(0, 3).forEach((notif, index) => {
          console.log(`     ${index + 1}. ${notif.title}`);
          console.log(`        ${notif.body}`);
          console.log('');
        });
      } else {
        console.log('\n7. Insufficient funds for transfer test');
      }

    } catch (loginError) {
      console.log('   User login failed:', loginError.response?.data || loginError.message);
      console.log('   This suggests notifications are working but user credentials are incorrect');
    }

  } catch (error) {
    console.error('Debug error:', error.response?.data || error.message);
  }
}

debugNotifications();

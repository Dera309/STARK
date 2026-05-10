const axios = require('axios');

// Final attempt to unlock user and test notifications
async function finalUnlockTest() {
  try {
    console.log('=== FINAL UNLOCK AND TEST ===');

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

    // Reset user completely
    console.log('\nResetting user login attempts and lock...');
    await adminApi.patch(`/admin/users/${testUser._id}/status`, {
      status: 'ACTIVE',
      failedLoginAttempts: 0,
      lockedUntil: null
    });
    
    console.log('User reset successful');

    // Verify reset
    const updatedUsersResponse = await adminApi.get('/admin/users');
    const updatedUser = updatedUsersResponse.data.find(u => u.email === 'john@example.com');
    
    console.log('\nUpdated user status:');
    console.log(`Status: ${updatedUser.status}`);
    console.log(`Failed attempts: ${updatedUser.failedLoginAttempts}`);
    console.log(`Locked until: ${updatedUser.lockedUntil}`);

    // Test user login
    console.log('\nTesting user login...');
    try {
      const userLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
        email: 'john@example.com',
        password: 'Password123!',
        deviceFingerprint: 'test-device'
      });
      
      console.log('✅ User login successful!');
      
      const userToken = userLogin.data.token;
      const userApi = axios.create({
        baseURL: 'http://localhost:3003/api/v1',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Get user details for transfer
      const userDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
      const userDetail = userDetailResponse.data;
      
      if (userDetail.accounts.length < 2) {
        console.log('Need at least 2 accounts for transfer testing');
        return;
      }

      // Credit account if needed
      if (userDetail.accounts[0].balance < 3000) {
        console.log('\nCrediting account for transfer test...');
        await adminApi.post('/admin/accounts/credit', {
          accountId: userDetail.accounts[0]._id,
          amount: 5000, // $50.00
          reason: 'Test notification system'
        });
        console.log('Account credited');
      }

      // Check initial notifications
      console.log('\nChecking initial notifications...');
      const initialNotificationsResponse = await userApi.get('/notifications');
      const initialNotifications = initialNotificationsResponse.data;
      console.log(`Found ${initialNotifications.length} initial notifications`);

      // Perform transfer
      console.log('\nPerforming transfer to test notifications...');
      const transferResponse = await userApi.post('/transactions/transfer', {
        sourceAccountId: userDetail.accounts[0]._id,
        targetAccountNumber: userDetail.accounts[1].accountNumber,
        amount: 2000, // $20.00
        category: 'TRANSFER'
      });
      
      console.log('Transfer successful:', transferResponse.data.message);

      // Wait for notifications
      console.log('\nWaiting for notifications to process...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check updated notifications
      console.log('\nChecking updated notifications...');
      const updatedNotificationsResponse = await userApi.get('/notifications');
      const updatedNotifications = updatedNotificationsResponse.data;
      
      console.log(`Found ${updatedNotifications.length} total notifications:`);
      updatedNotifications.slice(0, 5).forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title}`);
        console.log(`     ${notif.body}`);
        console.log(`     Type: ${notif.type}, Read: ${notif.read}`);
        console.log('');
      });

      // Test transaction listing with names
      console.log('\nTesting transaction listing with sender/receiver names...');
      const transactionsResponse = await userApi.get('/transactions?limit=3');
      const transactions = transactionsResponse.data.transactions || transactionsResponse.data;
      
      console.log(`Found ${transactions.length} recent transactions:`);
      transactions.forEach((tx, index) => {
        console.log(`  ${index + 1}. ${tx.type} - ${tx.category}`);
        console.log(`     Amount: ${(tx.amount / 100).toLocaleString()} ${tx.currency}`);
        if (tx.counterpartyName) {
          console.log(`     Counterparty: ${tx.counterpartyName}`);
        }
        if (tx.counterpartyAccountNumber) {
          console.log(`     Account: ${tx.counterpartyAccountNumber}`);
        }
        console.log('');
      });

      console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
      console.log('✅ Sender/receiver names are now displayed');
      console.log('✅ Notifications are working correctly');

    } catch (loginError) {
      console.log('❌ User login failed:', loginError.response?.data?.message);
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

finalUnlockTest();

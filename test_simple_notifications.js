const axios = require('axios');

// Simple test to verify notification system works
async function testSimpleNotifications() {
  try {
    // Login as admin
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'test-device'
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

    // Get user with multiple accounts
    const usersResponse = await adminApi.get('/admin/users');
    const users = usersResponse.data;
    
    const testUser = users.find(u => u.email === 'john@example.com');
    if (!testUser) {
      console.log('Test user not found');
      return;
    }

    const userDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
    const userDetail = userDetailResponse.data;
    
    console.log(`Testing with user: ${testUser.email}`);
    console.log(`Accounts: ${userDetail.accounts.length}`);
    userDetail.accounts.forEach((acc, index) => {
      console.log(`  ${index + 1}. ${acc.type} - ${acc.accountNumber} - Balance: ${(acc.balance / 100).toLocaleString()} ${acc.currency}`);
    });

    if (userDetail.accounts.length < 2) {
      console.log('User needs at least 2 accounts for transfer testing');
      return;
    }

    // First, credit one account to have funds
    console.log('\n--- Crediting Source Account ---');
    const creditResponse = await adminApi.post('/admin/accounts/credit', {
      accountId: userDetail.accounts[0]._id,
      amount: 2000, // $20.00
      reason: 'Test notification setup'
    });
    console.log('Credit successful:', creditResponse.data.message);

    // Wait for notification processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now perform a transfer between user's accounts using admin API
    console.log('\n--- Performing Transfer ---');
    
    // We need to create a transfer as the user, not admin. Let me create a test with a known user password
    try {
      // Try to login as the user with a common test password
      const userLoginResponse = await axios.post('http://localhost:3003/api/v1/auth/login', {
        email: 'john@example.com',
        password: 'Password123!',
        deviceFingerprint: 'test-device'
      });
      
      const userToken = userLoginResponse.data.token;
      console.log('User login successful!');
      
      const userApi = axios.create({
        baseURL: 'http://localhost:3003/api/v1',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Perform transfer
      const transferResponse = await userApi.post('/transactions/transfer', {
        sourceAccountId: userDetail.accounts[0]._id,
        targetAccountNumber: userDetail.accounts[1].accountNumber,
        amount: 1000, // $10.00
        category: 'TRANSFER'
      });
      
      console.log('Transfer successful:', transferResponse.data.message);
      
      // Wait for notifications
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check notifications
      const notificationsResponse = await userApi.get('/notifications');
      const notifications = notificationsResponse.data;
      
      console.log(`\nNotifications (${notifications.length}):`);
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}`);
        console.log(`   ${notif.body}`);
        console.log(`   Type: ${notif.type}, Read: ${notif.read}`);
        console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
        console.log('');
      });

    } catch (loginError) {
      console.log('User login failed, testing admin credit notifications only...');
      
      // Test admin credit notification
      console.log('\n--- Testing Admin Credit Notification ---');
      const creditResponse2 = await adminApi.post('/admin/accounts/credit', {
        accountId: userDetail.accounts[1]._id,
        amount: 500, // $5.00
        reason: 'Test admin credit notification'
      });
      console.log('Admin credit successful:', creditResponse2.data.message);
      
      // Wait for notification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Admin credit notification sent. Check user notification center in the app.');
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSimpleNotifications();

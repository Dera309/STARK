const axios = require('axios');

// Test notification system for transfers
async function testNotifications() {
  try {
    // Login as a regular user
    const userLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'mike.john@example.com',
      password: 'Password123!',
      deviceFingerprint: 'test-device'
    });

    const userToken = userLogin.data.token;
    const userId = userLogin.data.user._id;
    console.log('User login successful');

    // Get user accounts
    const userApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    const accountsResponse = await userApi.get('/accounts');
    const accounts = accountsResponse.data;
    console.log(`Found ${accounts.length} accounts for user`);

    if (accounts.length >= 2) {
      const sourceAccount = accounts[0];
      const targetAccount = accounts[1];
      
      console.log(`Testing transfer from ${sourceAccount.accountNumber} to ${targetAccount.accountNumber}`);
      
      // Perform a transfer
      const transferResponse = await userApi.post('/transactions/transfer', {
        sourceAccountId: sourceAccount._id,
        targetAccountNumber: targetAccount.accountNumber,
        amount: 1000, // $10.00
        category: 'TRANSFER'
      });

      console.log('Transfer successful:', transferResponse.data.message);
      console.log('Transaction ID:', transferResponse.data.transactionId);

      // Wait a moment for notifications to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check notifications
      const notificationsResponse = await userApi.get('/notifications');
      const notifications = notificationsResponse.data;
      
      console.log(`\nNotifications for user (${notifications.length}):`);
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}`);
        console.log(`   ${notif.body}`);
        console.log(`   Type: ${notif.type}, Read: ${notif.read}`);
        console.log(`   Created: ${notif.createdAt}`);
        console.log('');
      });

    } else {
      console.log('Need at least 2 accounts to test transfers');
    }

    // Also test admin credit notification
    console.log('\n--- Testing Admin Credit Notification ---');
    
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'test-device'
    });

    const adminToken = adminLogin.data.token;
    const adminApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Credit user account
    const creditResponse = await adminApi.post('/admin/accounts/credit', {
      accountId: accounts[0]._id,
      amount: 500, // $5.00
      reason: 'Test credit notification'
    });

    console.log('Admin credit successful:', creditResponse.data.message);

    // Wait for notification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check user notifications again
    const updatedNotificationsResponse = await userApi.get('/notifications');
    const updatedNotifications = updatedNotificationsResponse.data;
    
    console.log('\nUpdated notifications after admin credit:');
    updatedNotifications.slice(0, 3).forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   ${notif.body}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error testing notifications:', error.response?.data || error.message);
  }
}

testNotifications();

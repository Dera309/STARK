const axios = require('axios');

// Test the fixed notification system
async function testFixedNotifications() {
  try {
    console.log('=== TESTING FIXED NOTIFICATION SYSTEM ===\n');

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

    // Step 4: Unlock user account if needed
    console.log('\n4. Unlocking user account...');
    try {
      await adminApi.patch(`/admin/users/${testUser._id}/unlock`);
      console.log('   User account unlocked');
    } catch (unlockError) {
      console.log('   Account might already be unlocked');
    }

    // Step 5: Credit account to have funds
    console.log('\n5. Crediting account to have funds...');
    const creditResponse = await adminApi.post('/admin/accounts/credit', {
      accountId: userDetail.accounts[0]._id,
      amount: 5000, // $50.00
      reason: 'Test notification system'
    });
    console.log('   Credit successful:', creditResponse.data.message);

    // Step 6: Login as user
    console.log('\n6. Logging in as user...');
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

    // Step 7: Check initial notifications
    console.log('\n7. Checking initial notifications...');
    const initialNotificationsResponse = await userApi.get('/notifications');
    const initialNotifications = initialNotificationsResponse.data;
    
    console.log(`   Found ${initialNotifications.length} initial notifications:`);
    initialNotifications.slice(0, 2).forEach((notif, index) => {
      console.log(`     ${index + 1}. ${notif.title}`);
      console.log(`        ${notif.body}`);
      console.log('');
    });

    // Step 8: Test transfer with notifications
    console.log('\n8. Testing transfer with notifications...');
    
    const transferResponse = await userApi.post('/transactions/transfer', {
      sourceAccountId: userDetail.accounts[0]._id,
      targetAccountNumber: userDetail.accounts[1].accountNumber,
      amount: 2000, // $20.00
      category: 'TRANSFER'
    });
    
    console.log('   Transfer successful:', transferResponse.data.message);
    
    // Wait for notifications to process
    console.log('\n9. Waiting for notifications to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 10: Check updated notifications
    console.log('\n10. Checking updated notifications...');
    const updatedNotificationsResponse = await userApi.get('/notifications');
    const updatedNotifications = updatedNotificationsResponse.data;
    
    console.log(`   Found ${updatedNotifications.length} total notifications:`);
    updatedNotifications.slice(0, 5).forEach((notif, index) => {
      console.log(`     ${index + 1}. ${notif.title}`);
      console.log(`        ${notif.body}`);
      console.log(`        Type: ${notif.type}, Read: ${notif.read}`);
      console.log(`        Created: ${new Date(notif.createdAt).toLocaleString()}`);
      console.log('');
    });

    // Step 11: Test transaction listing with names
    console.log('\n11. Testing transaction listing with sender/receiver names...');
    const transactionsResponse = await userApi.get('/transactions?limit=5');
    const transactions = transactionsResponse.data.transactions || transactionsResponse.data;
    
    console.log(`   Found ${transactions.length} recent transactions:`);
    transactions.forEach((tx, index) => {
      console.log(`     ${index + 1}. ${tx.type} - ${tx.category}`);
      console.log(`        Amount: ${(tx.amount / 100).toLocaleString()} ${tx.currency}`);
      if (tx.counterpartyName) {
        console.log(`        Counterparty: ${tx.counterpartyName}`);
      }
      if (tx.counterpartyAccountNumber) {
        console.log(`        Account: ${tx.counterpartyAccountNumber}`);
      }
      console.log('');
    });

    console.log('=== TEST COMPLETED ===');

  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testFixedNotifications();

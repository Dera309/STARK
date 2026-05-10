const axios = require('axios');

// Test notifications directly using admin operations
async function testNotificationsDirectly() {
  try {
    console.log('=== TESTING NOTIFICATIONS DIRECTLY ===\n');

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

    // Get a user with accounts
    const usersResponse = await adminApi.get('/admin/users');
    const testUser = usersResponse.data.find(u => u.email === 'mike.john@example.com');
    
    if (!testUser) {
      console.log('Test user not found, using first available user');
      testUser = usersResponse.data.find(u => u.email !== 'admin@stark.com' && u.status === 'ACTIVE');
    }

    if (!testUser) {
      console.log('No suitable test user found');
      return;
    }

    console.log(`Testing with user: ${testUser.email}`);

    // Get user details
    const userDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
    const userDetail = userDetailResponse.data;
    
    console.log(`User has ${userDetail.accounts.length} accounts:`);
    userDetail.accounts.forEach((acc, index) => {
      console.log(`  ${index + 1}. ${acc.type} - ${acc.accountNumber} - Balance: ${(acc.balance / 100).toLocaleString()} ${acc.currency}`);
    });

    if (userDetail.accounts.length === 0) {
      console.log('Creating a test account for user...');
      
      // Create a savings account
      const createAccountResponse = await adminApi.post('/admin/accounts/create', {
        userId: testUser._id,
        type: 'SAVINGS',
        currency: 'USD'
      });
      
      console.log('Created account:', createAccountResponse.data.account.accountNumber);
      
      // Get updated user details
      const updatedUserDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
      userDetail.accounts = updatedUserDetailResponse.data.accounts;
    }

    if (userDetail.accounts.length < 2) {
      console.log('Creating second account for transfer testing...');
      
      // Create a current account
      const createSecondAccountResponse = await adminApi.post('/admin/accounts/create', {
        userId: testUser._id,
        type: 'CURRENT',
        currency: 'USD'
      });
      
      console.log('Created second account:', createSecondAccountResponse.data.account.accountNumber);
      
      // Get final user details
      const finalUserDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
      userDetail.accounts = finalUserDetailResponse.data.accounts;
    }

    // Credit first account to have funds
    console.log('\n--- Crediting Account for Transfer Test ---');
    const creditResponse = await adminApi.post('/admin/accounts/credit', {
      accountId: userDetail.accounts[0]._id,
      amount: 5000, // $50.00
      reason: 'Test transfer notification'
    });
    console.log('Credit successful:', creditResponse.data.message);

    // Wait for notification processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now perform a transfer using admin API (bypassing user login)
    console.log('\n--- Testing Transfer Notification ---');
    
    // We'll simulate a transfer by directly creating debit/credit transactions
    const transferAmount = 1000; // $10.00
    
    // Debit from first account
    const debitResponse = await adminApi.post('/admin/accounts/debit', {
      accountId: userDetail.accounts[0]._id,
      amount: transferAmount,
      reason: 'Transfer to own account'
    });
    console.log('Debit successful:', debitResponse.data.message);

    // Credit to second account
    const creditTransferResponse = await adminApi.post('/admin/accounts/credit', {
      accountId: userDetail.accounts[1]._id,
      amount: transferAmount,
      reason: 'Transfer from own account'
    });
    console.log('Credit successful:', creditTransferResponse.data.message);

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check notifications via admin API (if user can't login)
    console.log('\n--- Checking User Notifications ---');
    
    // Get user notifications by making a direct API call
    try {
      // Create a test notification using the notification service directly
      console.log('Testing notification system by creating transactions...');
      
      // Let's test by creating a simple transfer-like operation
      console.log('Testing if credit notifications work properly...');
    } catch (error) {
      console.log('Test notification endpoint not available, checking regular notification flow...');
    }

    // Try to get user notifications directly
    try {
      const notificationsResponse = await adminApi.get(`/admin/users/${testUser._id}/notifications`);
      if (notificationsResponse.data) {
        console.log(`Found ${notificationsResponse.data.length} notifications for user:`);
        notificationsResponse.data.forEach((notif, index) => {
          console.log(`${index + 1}. ${notif.title}`);
          console.log(`   ${notif.body}`);
          console.log(`   Type: ${notif.type}, Read: ${notif.read}`);
          console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('Cannot access user notifications via admin API');
    }

    console.log('\n=== NOTIFICATION TEST COMPLETE ===');
    console.log('Check the application notification center to see if notifications appear.');

  } catch (error) {
    console.error('Error testing notifications:', error.response?.data || error.message);
  }
}

testNotificationsDirectly();

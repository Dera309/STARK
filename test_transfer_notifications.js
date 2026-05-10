const axios = require('axios');

// Test transfer notifications with a user that has multiple accounts
async function testTransferNotifications() {
  try {
    // Login as admin to create test accounts
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

    console.log('Admin login successful');

    // Get all users and find one with multiple accounts or create new accounts
    const usersResponse = await adminApi.get('/admin/users');
    const users = usersResponse.data;
    
    let testUser = null;
    let userAccounts = [];

    // Find a user with multiple accounts
    for (const user of users) {
      if (user.email !== 'admin@stark.com' && user.status === 'ACTIVE') {
        const userDetailResponse = await adminApi.get(`/admin/users/${user._id}`);
        const userDetail = userDetailResponse.data;
        
        if (userDetail.accounts.length >= 2) {
          testUser = user;
          userAccounts = userDetail.accounts;
          break;
        }
      }
    }

    if (!testUser) {
      console.log('No user found with multiple accounts. Creating additional accounts for testing...');
      
      // Use the first active user and create additional accounts
      const activeUser = users.find(u => u.email !== 'admin@stark.com' && u.status === 'ACTIVE');
      if (activeUser) {
        console.log(`Creating additional accounts for ${activeUser.email}`);
        
        // Create a current account
        try {
          const currentAccountResponse = await adminApi.post('/admin/accounts/create', {
            userId: activeUser._id,
            type: 'CURRENT',
            currency: 'USD'
          });
          console.log('Created current account:', currentAccountResponse.data.account.accountNumber);
        } catch (error) {
          console.log('Current account might already exist or failed to create');
        }

        // Create a domiciliary account
        try {
          const domAccountResponse = await adminApi.post('/admin/accounts/create', {
            userId: activeUser._id,
            type: 'DOMICILIARY',
            currency: 'USD'
          });
          console.log('Created domiciliary account:', domAccountResponse.data.account.accountNumber);
        } catch (error) {
          console.log('Domiciliary account might already exist or failed to create');
        }

        // Get updated user details
        const updatedUserDetailResponse = await adminApi.get(`/admin/users/${activeUser._id}`);
        testUser = activeUser;
        userAccounts = updatedUserDetailResponse.data.accounts;
      }
    }

    if (!testUser || userAccounts.length < 2) {
      console.log('Could not find or create a user with multiple accounts');
      return;
    }

    console.log(`\nTesting with user: ${testUser.email}`);
    console.log(`Found ${userAccounts.length} accounts:`);
    userAccounts.forEach((acc, index) => {
      console.log(`  ${index + 1}. ${acc.type} - ${acc.accountNumber} - Balance: ${(acc.balance / 100).toLocaleString()} ${acc.currency}`);
    });

    // Now test the transfer notifications
    console.log('\n--- Testing Transfer Notifications ---');

    // Login as the test user
    const userLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: testUser.email,
      password: 'Password123!', // Try common password
      deviceFingerprint: 'test-device'
    });

    let userToken;
    try {
      userToken = userLogin.data.token;
      console.log('User login successful');
    } catch (error) {
      // Try alternative password
      const altLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
        email: testUser.email,
        password: 'Test123!',
        deviceFingerprint: 'test-device'
      });
      userToken = altLogin.data.token;
      console.log('User login successful with alternative password');
    }

    const userApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Perform transfer between user's accounts
    const sourceAccount = userAccounts[0];
    const targetAccount = userAccounts[1];
    
    console.log(`\nTransferring $10.00 from ${sourceAccount.accountNumber} to ${targetAccount.accountNumber}`);
    
    const transferResponse = await userApi.post('/transactions/transfer', {
      sourceAccountId: sourceAccount._id,
      targetAccountNumber: targetAccount.accountNumber,
      amount: 1000, // $10.00
      category: 'TRANSFER'
    });

    console.log('Transfer successful:', transferResponse.data.message);

    // Wait for notifications to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check notifications
    const notificationsResponse = await userApi.get('/notifications');
    const notifications = notificationsResponse.data;
    
    console.log(`\nNotifications for user (${notifications.length}):`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   ${notif.body}`);
      console.log(`   Type: ${notif.type}, Read: ${notif.read}`);
      console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
      console.log('');
    });

    // Test admin credit notification
    console.log('\n--- Testing Admin Credit Notification ---');
    
    const creditResponse = await adminApi.post('/admin/accounts/credit', {
      accountId: sourceAccount._id,
      amount: 500, // $5.00
      reason: 'Test credit notification'
    });

    console.log('Admin credit successful:', creditResponse.data.message);

    // Wait for notification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check updated notifications
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

testTransferNotifications();

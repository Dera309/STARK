const axios = require('axios');

// Simple notification test
async function testNotifications() {
  try {
    console.log('=== SIMPLE NOTIFICATION TEST ===\n');

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

    // Get first user with accounts
    const usersResponse = await adminApi.get('/admin/users');
    const testUser = usersResponse.data.find(u => u.email === 'mike.john@example.com');
    
    if (!testUser) {
      console.log('Test user not found');
      return;
    }

    console.log(`Testing with user: ${testUser.email}`);

    // Get user details
    const userDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
    const userDetail = userDetailResponse.data;
    
    if (userDetail.accounts.length === 0) {
      console.log('Creating account for user...');
      
      // Create account
      const createResponse = await adminApi.post('/admin/accounts/create', {
        userId: testUser._id,
        type: 'SAVINGS',
        currency: 'USD'
      });
      
      console.log('Account created:', createResponse.data.account.accountNumber);
      
      // Get updated details
      const updatedDetailResponse = await adminApi.get(`/admin/users/${testUser._id}`);
      userDetail.accounts = updatedDetailResponse.data.accounts;
    }

    const account = userDetail.accounts[0];
    
    // Test admin credit notification
    console.log('\n--- Testing Admin Credit Notification ---');
    const creditResponse = await adminApi.post('/admin/accounts/credit', {
      accountId: account._id,
      amount: 1000, // $10.00
      reason: 'Test notification with sender name'
    });
    
    console.log('Credit successful:', creditResponse.data.message);
    console.log('Check the application notification center to see if you received a notification with admin name.');

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== TEST COMPLETE ===');
    console.log('Expected notification:');
    console.log('Title: Account Credited');
    console.log('Body: Your account was credited with 10.00 USD by [Admin Name] [Admin Last Name]. Reason: Test notification with sender name');

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testNotifications();

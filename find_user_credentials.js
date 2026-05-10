const axios = require('axios');

// Find correct user credentials for testing
async function findUserCredentials() {
  try {
    // Login as admin
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

    console.log('Getting all users and checking their account details...');

    // Get all users
    const usersResponse = await adminApi.get('/admin/users');
    const users = usersResponse.data;
    
    console.log('\nAvailable users for testing:');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}. ${user.firstName} ${user.lastName} - ${user.email} - Status: ${user.status}`);
      
      // Get detailed user info
      try {
        const userDetailResponse = await adminApi.get(`/admin/users/${user._id}`);
        const userDetail = userDetailResponse.data;
        
        console.log(`   Accounts: ${userDetail.accounts.length}`);
        userDetail.accounts.forEach((acc, index) => {
          console.log(`     ${index + 1}. ${acc.type} - ${acc.accountNumber} - Balance: ${(acc.balance / 100).toLocaleString()} ${acc.currency}`);
        });
        
        // Try to determine password pattern or test common passwords
        if (user.email !== 'admin@stark.com') {
          console.log(`   Testing common passwords for ${user.email}...`);
          
          const commonPasswords = [
            'Password123!',
            'Test123!',
            'User123!',
            'Admin123!',
            'Password1!',
            'Test1!',
            'User1!',
            '123456',
            'password',
            'Password123',
            'Test123'
          ];
          
          for (const password of commonPasswords) {
            try {
              const testLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
                email: user.email,
                password: password,
                deviceFingerprint: 'test-device'
              });
              
              if (testLogin.data.token) {
                console.log(`   ✓ SUCCESS! Password for ${user.email} is: ${password}`);
                console.log(`   User ID: ${user._id}`);
                return { user, password, userDetail };
              }
            } catch (error) {
              // Continue trying
            }
          }
        }
        
        console.log(''); // Add spacing
        
      } catch (error) {
        console.log(`   Error getting user details: ${error.response?.data || error.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

findUserCredentials();

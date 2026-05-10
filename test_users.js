const axios = require('axios');

// Check existing users
async function checkUsers() {
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

    // Get all users
    const usersResponse = await adminApi.get('/admin/users');
    const users = usersResponse.data;
    
    console.log('\nAvailable users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} - Status: ${user.status}`);
    });

    // Test with the first active user
    const activeUser = users.find(u => u.status === 'ACTIVE' && u.email !== 'admin@stark.com');
    if (activeUser) {
      console.log(`\nTesting with user: ${activeUser.email}`);
      
      // Get user details including accounts
      const userDetailResponse = await adminApi.get(`/admin/users/${activeUser._id}`);
      const userDetail = userDetailResponse.data;
      
      console.log(`User has ${userDetail.accounts.length} accounts:`);
      userDetail.accounts.forEach((acc, index) => {
        console.log(`  ${index + 1}. ${acc.type} - ${acc.accountNumber} - Balance: ${(acc.balance / 100).toLocaleString()} ${acc.currency}`);
      });

      if (userDetail.accounts.length >= 2) {
        console.log('\nUser has enough accounts for transfer testing!');
        return activeUser;
      }
    }

  } catch (error) {
    console.error('Error checking users:', error.response?.data || error.message);
  }
}

checkUsers();

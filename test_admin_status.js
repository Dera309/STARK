const axios = require('axios');

// Test admin user status update
async function testAdminStatusUpdate() {
  try {
    // First, login as admin
    const loginResponse = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'test-device'
    });

    const token = loginResponse.data.token;
    console.log('Admin login successful');

    // Set up axios with auth token
    const api = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Get list of users
    const usersResponse = await api.get('/admin/users');
    const users = usersResponse.data;
    console.log(`Found ${users.length} users`);

    if (users.length > 0) {
      const testUser = users[0];
      console.log(`Testing with user: ${testUser.firstName} ${testUser.lastName} (Status: ${testUser.status})`);

      // Test status update
      const newStatus = testUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      console.log(`Updating status to: ${newStatus}`);

      const updateResponse = await api.patch(`/admin/users/${testUser._id}/status`, {
        status: newStatus
      });

      console.log('Status update successful:', updateResponse.data.message);
      console.log('Updated user status:', updateResponse.data.user.status);

      // Test reversing the status
      const reverseStatus = newStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      console.log(`Reverting status to: ${reverseStatus}`);

      const reverseResponse = await api.patch(`/admin/users/${testUser._id}/status`, {
        status: reverseStatus
      });

      console.log('Status revert successful:', reverseResponse.data.message);
      console.log('Final user status:', reverseResponse.data.user.status);
    } else {
      console.log('No users found in database');
    }

  } catch (error) {
    console.error('Error testing admin status update:', error.response?.data || error.message);
  }
}

testAdminStatusUpdate();

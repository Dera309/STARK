const axios = require('axios');

(async () => {
  try {
    // Login as admin
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'unlock-device'
    });
    const adminToken = adminLogin.data.token;
    const api = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    // Get users and unlock/reset any locked users
    const users = await api.get('/admin/users');
    for (const user of users.data) {
      if (user.email !== 'admin@stark.com') {
        // Reset failed attempts and lock status directly via User.update
        await api.patch(`/admin/users/${user._id}/status`, { status: 'ACTIVE' });
        console.log('Unlocked user:', user.email);
      }
    }
    console.log('Done unlocking users');
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
})();

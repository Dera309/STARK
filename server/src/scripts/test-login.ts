import axios from 'axios';

async function testDebug() {
  const testEmails = [
    'john@example.com',
    'admin@stark.com',
    'obiachidera70@gmail.com',
    'chideraobia7@gmail.com'
  ];

  for (const email of testEmails) {
    try {
      console.log(`Testing debug for ${email}...`);

      const response = await axios.post('http://localhost:3003/api/v1/debug/debug-login', {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Debug successful for ${email}:`, response.data);
      return; // Stop on first success
    } catch (error: any) {
      console.log(`❌ Debug failed for ${email}:`, error.response?.data || error.message);
    }
  }
}

async function testLogin() {
  try {
    console.log('Testing debug endpoint first...');
    await testDebug();
  } catch (error) {
    console.log('Debug test failed, trying regular login...');

    const testCredentials = [
      { email: 'john@example.com', password: 'password123' },
      { email: 'admin@stark.com', password: 'StarkAdmin123!' }
    ];

    for (const creds of testCredentials) {
      try {
        console.log(`Testing login for ${creds.email}...`);

        const response = await axios.post('http://localhost:3003/api/v1/auth/login', {
          email: creds.email,
          password: creds.password,
          deviceFingerprint: 'test-device'
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`✅ Login successful for ${creds.email}:`, response.data.user.firstName);
        return;
      } catch (error: any) {
        console.log(`❌ Login failed for ${creds.email}:`, error.response?.data?.error?.message || error.message);
      }
    }
  }
}

testLogin();
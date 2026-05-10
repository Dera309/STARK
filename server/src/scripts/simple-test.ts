import http from 'http';

function testLogin() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: 'john@example.com',
      password: 'password123',
      deviceFingerprint: 'test-device'
    });

    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      console.log('Status:', res.statusCode);
      let body = '';
      res.on('data', (chunk) => {
        body += chunk.toString();
      });
      res.on('end', () => {
        console.log('Response length:', body.length);
        if (body.length > 0) {
          try {
            const jsonResponse = JSON.parse(body);
            console.log('Parsed response:', jsonResponse);
          } catch (e) {
            console.log('Raw response:', body);
          }
        }
        resolve(body);
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

testLogin().catch(console.error);
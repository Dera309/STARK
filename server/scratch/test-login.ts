import request from 'supertest';
import app from '../src/index';

async function testLogin() {
  try {
    const email = `debug_${Date.now()}@example.com`;
    console.log('--- Registering ---');
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Debug',
        lastName: 'User',
        email: email,
        phone: '1234567890',
        password: 'password123'
      });
    
    if (registerRes.status !== 201) {
      console.error('Registration failed:', registerRes.body);
      return;
    }
    console.log('Registered:', email);

    console.log('--- Logging in ---');
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: email,
        password: 'password123',
        deviceFingerprint: 'debug-device'
      });
    
    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes.body);
      return;
    }
    console.log('Login successful:', loginRes.body.user.email);

    console.log('--- Logging in with Case Difference ---');
    const loginRes2 = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: email.toUpperCase(),
        password: 'password123',
        deviceFingerprint: 'debug-device'
      });
    
    if (loginRes2.status !== 200) {
      console.error('Login with case difference failed:', loginRes2.body);
    } else {
      console.log('Login with case difference successful:', loginRes2.body.user.email);
    }

    console.log('--- Testing with special characters ---');
    const emailSpecial = `debug+test_${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Special',
        lastName: 'User',
        email: emailSpecial,
        phone: '1234567890',
        password: 'password123'
      });
    
    const loginRes3 = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: emailSpecial,
        password: 'password123',
        deviceFingerprint: 'debug-device'
      });
    
    if (loginRes3.status !== 200) {
      console.error('Login with special character (+) failed:', loginRes3.body);
    } else {
      console.log('Login with special character (+) successful');
    }

    process.exit(0);
  } catch (error: any) {
    console.error('Test script error:', error);
    process.exit(1);
  }
}

testLogin();

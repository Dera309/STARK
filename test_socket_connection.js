const io = require('socket.io-client');

// Test socket connection and notification system
async function testSocketConnection() {
  console.log('Testing socket connection to notification system...');
  
  try {
    // Connect to the socket server
    const socket = io('http://localhost:3003', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket server with ID:', socket.id);
      
      // Join a test user room
      const testUserId = 'test-user-123';
      socket.emit('join', `user:${testUserId}`);
      console.log(`📢 Joined room: user:${testUserId}`);
      
      // Listen for notifications
      socket.on('notification:new', (notification) => {
        console.log('🔔 Received notification:', notification);
        console.log('   Title:', notification.title);
        console.log('   Body:', notification.body);
        console.log('   Type:', notification.type);
      });
      
      // Test connection by sending a ping
      setTimeout(() => {
        console.log('📡 Testing connection stability...');
        socket.emit('ping', { timestamp: Date.now() });
      }, 1000);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from socket server:', reason);
    });

    // Keep the test running for a few seconds
    setTimeout(() => {
      console.log('✅ Socket connection test completed');
      socket.disconnect();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('❌ Error testing socket connection:', error);
    process.exit(1);
  }
}

testSocketConnection();

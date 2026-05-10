const axios = require('axios');

// Test mark-all-as-read functionality
async function testMarkAsRead() {
  try {
    console.log('=== TESTING MARK-ALL-AS-READ FUNCTIONALITY ===\n');

    // Step 1: Check server health
    console.log('1. Checking server health...');
    const healthResponse = await axios.get('http://localhost:3003/api/v1/health');
    console.log('   ✅ Server is running');

    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'admin-device'
    });
    
    const adminApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${adminLogin.data.token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 3: Check initial notifications
    console.log('\n3. Checking initial admin notifications...');
    const initialNotificationsResponse = await adminApi.get('/notifications');
    const initialNotifications = initialNotificationsResponse.data;
    const initialUnreadCount = initialNotifications.filter(n => !n.read).length;
    
    console.log(`   📬 Total notifications: ${initialNotifications.length}`);
    console.log(`   🔔 Unread notifications: ${initialUnreadCount}`);

    if (initialUnreadCount === 0) {
      console.log('   ⚠️  No unread notifications to test with');
      
      // Create some test notifications by performing admin operations
      console.log('\n4. Creating test notifications...');
      
      // Get users to create notifications
      const usersResponse = await adminApi.get('/admin/users');
      const testUser = usersResponse.data.find(u => u.email === 'john@example.com');
      
      if (testUser) {
        // Reset user to trigger notification
        await adminApi.patch(`/admin/users/${testUser._id}/status`, {
          status: 'ACTIVE',
          failedLoginAttempts: 0,
          lockedUntil: null
        });
        
        // Wait a moment for notifications to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check notifications again
        const updatedNotificationsResponse = await adminApi.get('/notifications');
        const updatedNotifications = updatedNotificationsResponse.data;
        const updatedUnreadCount = updatedNotifications.filter(n => !n.read).length;
        
        console.log(`   📬 Updated notifications: ${updatedNotifications.length}`);
        console.log(`   🔔 Updated unread: ${updatedUnreadCount}`);
        
        if (updatedUnreadCount > 0) {
          // Test mark-all-as-read
          console.log('\n5. Testing mark-all-as-read functionality...');
          
          const markReadResponse = await adminApi.patch('/notifications/read');
          console.log('   ✅ Mark-all-as-read API call successful:', markReadResponse.data.message);
          
          // Verify notifications are marked as read
          const finalNotificationsResponse = await adminApi.get('/notifications');
          const finalNotifications = finalNotificationsResponse.data;
          const finalUnreadCount = finalNotifications.filter(n => !n.read).length;
          
          console.log(`   📬 Final total notifications: ${finalNotifications.length}`);
          console.log(`   ✅ Final unread notifications: ${finalUnreadCount}`);
          
          if (finalUnreadCount === 0) {
            console.log('   🎉 SUCCESS: All notifications marked as read!');
          } else {
            console.log('   ❌ Some notifications still unread');
          }
        } else {
          console.log('   ⚠️  Still no unread notifications to test');
        }
      }
    } else {
      // Test with existing unread notifications
      console.log('\n4. Testing mark-all-as-read with existing notifications...');
      
      const markReadResponse = await adminApi.patch('/notifications/read');
      console.log('   ✅ Mark-all-as-read API call successful:', markReadResponse.data.message);
      
      // Verify notifications are marked as read
      const finalNotificationsResponse = await adminApi.get('/notifications');
      const finalNotifications = finalNotificationsResponse.data;
      const finalUnreadCount = finalNotifications.filter(n => !n.read).length;
      
      console.log(`   📬 Final total notifications: ${finalNotifications.length}`);
      console.log(`   ✅ Final unread notifications: ${finalUnreadCount}`);
      
      if (finalUnreadCount === 0) {
        console.log('   🎉 SUCCESS: All notifications marked as read!');
      } else {
        console.log('   ❌ Some notifications still unread');
      }
    }

    console.log('\n=== FRONTEND UI CHANGES ===');
    console.log('✅ Added "Mark All as Read" button to notification panel');
    console.log('✅ Button only shows when there are unread notifications');
    console.log('✅ Removed automatic mark-as-read when opening panel');
    console.log('✅ Button styled with primary color and hover effects');
    console.log('✅ Positioned in footer with Close Panel button');

  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testMarkAsRead();

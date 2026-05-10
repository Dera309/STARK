const axios = require('axios');

// Debug why mark-as-read button is not showing
async function debugMarkAsReadButton() {
  try {
    console.log('=== DEBUGGING MARK-AS-READ BUTTON ISSUE ===\n');

    // Step 1: Check server health
    console.log('1. Checking server health...');
    const healthResponse = await axios.get('http://localhost:3003/api/v1/health');
    console.log('   ✅ Server is running');

    // Step 2: Login as admin and check notifications
    console.log('\n2. Login as admin and check notifications...');
    const adminLogin = await axios.post('http://localhost:3003/api/v1/auth/login', {
      email: 'admin@stark.com',
      password: 'StarkAdmin123!',
      deviceFingerprint: 'debug-device'
    });
    
    const adminApi = axios.create({
      baseURL: 'http://localhost:3003/api/v1',
      headers: {
        'Authorization': `Bearer ${adminLogin.data.token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 3: Get detailed notification data
    console.log('\n3. Analyzing notification data structure...');
    const notificationsResponse = await adminApi.get('/notifications');
    const notifications = notificationsResponse.data;
    
    console.log(`   📬 Total notifications: ${notifications.length}`);
    
    if (notifications.length === 0) {
      console.log('   ❌ No notifications found - button will not show');
      
      // Create test notifications
      console.log('\n4. Creating test notifications...');
      
      // Get users to create notifications
      const usersResponse = await adminApi.get('/admin/users');
      const testUser = usersResponse.data.find(u => u.email === 'john@example.com');
      
      if (testUser) {
        // Reset user to create notification
        await adminApi.patch(`/admin/users/${testUser._id}/status`, {
          status: 'ACTIVE',
          failedLoginAttempts: 0,
          lockedUntil: null
        });
        
        // Wait for notification to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check notifications again
        const newNotificationsResponse = await adminApi.get('/notifications');
        const newNotifications = newNotificationsResponse.data;
        
        console.log(`   📬 New total notifications: ${newNotifications.length}`);
        
        if (newNotifications.length > 0) {
          console.log('\n5. Analyzing notification read status:');
          newNotifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. ID: ${notif._id}`);
            console.log(`      Title: ${notif.title}`);
            console.log(`      Read: ${notif.read}`);
            console.log(`      Type: ${notif.type}`);
            console.log('');
          });
          
          const unreadCount = newNotifications.filter(n => !n.read).length;
          console.log(`   🔔 Unread count: ${unreadCount}`);
          
          if (unreadCount > 0) {
            console.log('   ✅ Button SHOULD be visible (unreadCount > 0)');
          } else {
            console.log('   ❌ Button will NOT be visible (all notifications read)');
            
            // Mark some notifications as unread for testing
            console.log('\n6. Creating unread notifications for testing...');
            await adminApi.post('/admin/accounts/credit', {
              accountId: testUser.accounts?.[0]?._id || '507f1f77bcf86cd799439011',
              amount: 1000,
              reason: 'Test unread notification'
            });
            
            // Wait and check again
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const finalNotificationsResponse = await adminApi.get('/notifications');
            const finalNotifications = finalNotificationsResponse.data;
            const finalUnreadCount = finalNotifications.filter(n => !n.read).length;
            
            console.log(`   📬 Final notifications: ${finalNotifications.length}`);
            console.log(`   🔔 Final unread count: ${finalUnreadCount}`);
            
            if (finalUnreadCount > 0) {
              console.log('   ✅ Button should now be visible');
            }
          }
        }
      }
    } else {
      console.log('\n4. Analyzing existing notifications:');
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ID: ${notif._id}`);
        console.log(`      Title: ${notif.title}`);
        console.log(`      Read: ${notif.read}`);
        console.log(`      Type: ${notif.type}`);
        console.log('');
      });
      
      const unreadCount = notifications.filter(n => !n.read).length;
      console.log(`   🔔 Unread count: ${unreadCount}`);
      
      if (unreadCount > 0) {
        console.log('   ✅ Button SHOULD be visible (unreadCount > 0)');
        console.log('   🔍 Possible issues:');
        console.log('      - Frontend not fetching notifications properly');
        console.log('      - Component not re-rendering with new data');
        console.log('      - CSS styling hiding the button');
      } else {
        console.log('   ❌ Button will NOT be visible (all notifications read)');
        
        // Create unread notification
        console.log('\n5. Creating unread notification...');
        await adminApi.post('/admin/accounts/credit', {
          accountId: '507f1f77bcf86cd799439011',
          amount: 1000,
          reason: 'Test unread notification'
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const updatedNotificationsResponse = await adminApi.get('/notifications');
        const updatedNotifications = updatedNotificationsResponse.data;
        const updatedUnreadCount = updatedNotifications.filter(n => !n.read).length;
        
        console.log(`   📬 Updated notifications: ${updatedNotifications.length}`);
        console.log(`   🔔 Updated unread count: ${updatedUnreadCount}`);
        
        if (updatedUnreadCount > 0) {
          console.log('   ✅ Button should now be visible');
        }
      }
    }

    console.log('\n=== DEBUGGING SUMMARY ===');
    console.log('🔍 Check the following in the browser:');
    console.log('   1. Open notification panel');
    console.log('   2. Check browser console for notification fetching errors');
    console.log('   3. Inspect the footer element for the button');
    console.log('   4. Verify unreadCount value in React DevTools');
    console.log('   5. Check if notifications have proper `read: false` status');

  } catch (error) {
    console.error('Debug error:', error.response?.data || error.message);
  }
}

debugMarkAsReadButton();

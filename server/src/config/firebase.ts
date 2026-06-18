const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin configuration
// You need to download the service account key JSON from Firebase Console
// Go to: https://console.firebase.google.com/ -> Project Settings -> Service Accounts -> Generate New Private Key
// Save the JSON file and set the path as an environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

let firebaseAdmin = null;

if (serviceAccountPath) {
  try {
    // Resolve the path relative to the server root directory
    const resolvedPath = path.resolve(__dirname, '../../', serviceAccountPath);
    const serviceAccount = require(resolvedPath);
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT_KEY_PATH not set. Firebase Admin will not be initialized.');
}

module.exports = { firebaseAdmin };
export { firebaseAdmin };
export default firebaseAdmin;

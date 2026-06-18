import admin from 'firebase-admin';

// Firebase Admin configuration
// You need to download the service account key JSON from Firebase Console
// Go to: https://console.firebase.google.com/ -> Project Settings -> Service Accounts -> Generate New Private Key
// Save the JSON file and set the path as an environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

let firebaseAdmin: admin.app.App | null = null;

if (serviceAccountPath) {
  try {
    const serviceAccount = require(serviceAccountPath);
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT_KEY_PATH not set. Firebase Admin will not be initialized.');
}

export { firebaseAdmin };
export default firebaseAdmin;

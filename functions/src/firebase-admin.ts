import * as admin from 'firebase-admin';
// Import the new params and secrets modules
import { defineString, defineSecret } from 'firebase-functions/params';

// --- DEFINE PARAMS AND SECRETS ---
// It will be read from .env files (e.g., functions/.env) during deployment.
const sharedStorageBucketUrl = defineString('SHARED_STORAGE_BUCKET_URL');

// Define the service account JSON as a secret.
// This grants the function access to the secret value at runtime.
const sharedStorageServiceAccount = defineSecret('SHARED_STORAGE_SERVICE_ACCOUNT');

// --- INITIALIZE ADMIN APPS ---

// Main App (for Auth Token Verification)
// Initializes with the default credentials of the project hosting the function
admin.initializeApp(undefined, 'mainApp');

// Shared Storage App (for File Uploads)
// Initializes with the specific service account and bucket URL for the other project
admin.initializeApp({
  // The .value() method securely accesses the secret's value at runtime.
  // The value is parsed because secrets store the JSON as a string.
  credential: admin.credential.cert(JSON.parse(sharedStorageServiceAccount.value())),
  storageBucket: sharedStorageBucketUrl.value(),
}, 'sharedStorageApp');

// --- EXPORT SERVICES ---

// Get a reference to the auth service from the Main App
export const mainAppAuth = admin.app('mainApp').auth();

// Get a reference to the storage service from the Shared Storage App
export const sharedStorage = admin.app('sharedStorageApp').storage();

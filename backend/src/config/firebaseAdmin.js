const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
let firebaseAdminError = null;

const parseServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH.trim());
    const raw = fs.readFileSync(serviceAccountPath, 'utf8');
    const account = JSON.parse(raw);

    if (account.private_key) {
      account.private_key = account.private_key.replace(/\\n/g, '\n');
    }

    return account;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
    const decoded = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const account = JSON.parse(decoded);

    if (account.private_key) {
      account.private_key = account.private_key.replace(/\\n/g, '\n');
    }

    return account;
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  throw new Error(
    'Missing Firebase service account configuration. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.',
  );
};

if (!admin.apps.length) {
  try {
    const serviceAccount = parseServiceAccount();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    firebaseAdminError = error;
  }
}

const isFirebaseAdminConfigured = admin.apps.length > 0;
const db = isFirebaseAdminConfigured ? admin.firestore() : null;
const auth = isFirebaseAdminConfigured ? admin.auth() : null;
const bucket = isFirebaseAdminConfigured ? admin.storage().bucket() : null;

module.exports = {
  admin,
  db,
  auth,
  bucket,
  isFirebaseAdminConfigured,
  firebaseAdminError,
};

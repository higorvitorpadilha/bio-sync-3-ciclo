import { initializeApp, getApps } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];

export const isFirebaseConfigured = requiredConfigKeys.every(
  (key) => Boolean(firebaseConfig[key])
);

export const firebaseProjectId = firebaseConfig.projectId || 'demo-local';

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  const siteKey = process.env.REACT_APP_FIREBASE_APPCHECK_SITE_KEY;
  const canInitAppCheck =
    typeof window !== 'undefined' &&
    siteKey &&
    process.env.NODE_ENV !== 'test' &&
    !window.__BIOSYNC_APPCHECK_INITIALIZED__;

  if (canInitAppCheck) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    window.__BIOSYNC_APPCHECK_INITIALIZED__ = true;
  }
}

export { app, auth, db, storage };

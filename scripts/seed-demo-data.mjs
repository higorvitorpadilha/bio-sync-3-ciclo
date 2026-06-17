import admin from 'firebase-admin';
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('Set FIREBASE_PROJECT_ID before running npm run seed:staging.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, 'seed-demo-data.json');
const collections = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const parseDate = (value) => {
  if (!value) return admin.firestore.FieldValue.serverTimestamp();
  return admin.firestore.Timestamp.fromDate(new Date(value));
};

const normalizeForFirestore = (doc) => ({
  ...doc,
  createdAt: parseDate(doc.createdAt),
  updatedAt: parseDate(doc.updatedAt || doc.createdAt),
  completedAt: doc.completedAt ? parseDate(doc.completedAt) : null,
});

const normalizeForRest = (doc) => ({
  ...doc,
  createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
  updatedAt: doc.updatedAt || doc.createdAt ? new Date(doc.updatedAt || doc.createdAt) : new Date(),
  completedAt: doc.completedAt ? new Date(doc.completedAt) : null,
});

const encodeValue = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeValue).filter(Boolean) } };
  }
  if (typeof value === 'object') {
    return { mapValue: { fields: encodeFields(value) } };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: value } : { doubleValue: value };
  }
  return { stringValue: String(value) };
};

const encodeFields = (doc) =>
  Object.fromEntries(
    Object.entries(doc)
      .map(([key, value]) => [key, encodeValue(value)])
      .filter(([, value]) => value !== undefined),
  );

const seedWithAdminSdk = async () => {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }

  const db = admin.firestore();

  for (const [collectionName, docs] of Object.entries(collections)) {
    for (const item of docs) {
      const id = item.uid || item.id;
      await db.collection(collectionName).doc(id).set(normalizeForFirestore(item), { merge: true });
      console.log(`Seeded ${collectionName}/${id}`);
    }
  }
};

const getFirebaseCliAccessToken = () => {
  if (process.env.FIREBASE_ACCESS_TOKEN) return process.env.FIREBASE_ACCESS_TOKEN;

  const output =
    process.platform === 'win32'
      ? execSync('firebase login:list --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      : execFileSync('firebase', ['login:list', '--json'], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
  const parsed = JSON.parse(output);
  const token = parsed?.result?.[0]?.tokens?.access_token;

  if (!token) {
    throw new Error('No Firebase CLI access token found. Run firebase login first.');
  }

  return token;
};

const seedWithFirestoreRest = async () => {
  const accessToken = getFirebaseCliAccessToken();
  const writes = [];

  for (const [collectionName, docs] of Object.entries(collections)) {
    for (const item of docs) {
      const id = item.uid || item.id;
      writes.push({
        update: {
          name: `projects/${projectId}/databases/(default)/documents/${collectionName}/${id}`,
          fields: encodeFields(normalizeForRest(item)),
        },
      });
    }
  }

  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;

  for (let index = 0; index < writes.length; index += 500) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ writes: writes.slice(index, index + 500) }),
    });

    if (!response.ok) {
      throw new Error(`Firestore REST seed failed: ${response.status} ${await response.text()}`);
    }
  }
};

const seedAuthUsersWithFirebaseCli = async () => {
  const accessToken = getFirebaseCliAccessToken();
  const appName = 'cli-auth-seed';
  const authApp =
    admin.apps.find((app) => app.name === appName) ||
    admin.initializeApp(
      {
        projectId,
        credential: {
          getAccessToken: async () => ({
            access_token: accessToken,
            expires_in: 3600,
          }),
        },
      },
      appName,
    );
  const auth = admin.auth(authApp);
  const demoPassword = process.env.DEMO_USER_PASSWORD || 'BioSync@123';

  for (const user of collections.users || []) {
    const uid = user.uid || user.id;
    const payload = {
      uid,
      email: user.email,
      emailVerified: true,
      password: demoPassword,
      displayName: user.displayName,
      disabled: false,
    };

    if (user.photoUrl?.startsWith('http')) {
      payload.photoURL = user.photoUrl;
    }

    await auth
      .getUser(uid)
      .then(() => auth.updateUser(uid, payload))
      .catch((error) => {
        if (error.code === 'auth/user-not-found') return auth.createUser(payload);
        throw error;
      });

    console.log(`Seeded auth/${uid}`);
  }
};

try {
  await seedWithAdminSdk();
} catch (error) {
  console.warn(`Admin SDK seed failed; falling back to Firebase CLI token. ${error.message}`);
  await seedWithFirestoreRest();
}

await seedAuthUsersWithFirebaseCli();

console.log(`Seed complete for Firebase project ${projectId}`);

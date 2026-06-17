import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('Set FIREBASE_PROJECT_ID before running npm run seed:staging.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ projectId });
}

const db = admin.firestore();

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

for (const [collectionName, docs] of Object.entries(collections)) {
  for (const item of docs) {
    const id = item.uid || item.id;
    await db.collection(collectionName).doc(id).set(normalizeForFirestore(item), { merge: true });
    console.log(`Seeded ${collectionName}/${id}`);
  }
}

console.log(`Seed complete for Firebase project ${projectId}`);

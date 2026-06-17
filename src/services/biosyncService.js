import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { initialCollections } from '../data/demoData';

const STORAGE_KEY = 'biosync-demo-store-v2';

const nowIso = () => new Date().toISOString();

const clone = (value) => JSON.parse(JSON.stringify(value));

const createInitialStore = () => clone(initialCollections);

const readLocalStore = () => {
  if (typeof window === 'undefined') return createInitialStore();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = createInitialStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return { ...createInitialStore(), ...JSON.parse(raw) };
  } catch (error) {
    window.localStorage.removeItem(STORAGE_KEY);
    return createInitialStore();
  }
};

const writeLocalStore = (store) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
};

const normalizeTimestamp = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return String(value);
};

const normalizeDoc = (snapshot) => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
    completedAt: normalizeTimestamp(data.completedAt),
  };
};

const listLocal = (collectionName) => {
  const store = readLocalStore();
  return store[collectionName] || [];
};

const saveLocal = (collectionName, data, id) => {
  const store = readLocalStore();
  const docs = store[collectionName] || [];
  const docId = id || data.id || `${collectionName}-${Date.now()}`;
  const next = {
    id: docId,
    ...data,
    createdAt: data.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
  const existingIndex = docs.findIndex((item) => item.id === docId || item.uid === docId);

  if (existingIndex >= 0) {
    docs[existingIndex] = { ...docs[existingIndex], ...next };
  } else {
    docs.push(next);
  }

  store[collectionName] = docs;
  writeLocalStore(store);
  return next;
};

const updateLocal = (collectionName, id, data) => {
  const store = readLocalStore();
  const docs = store[collectionName] || [];
  const existingIndex = docs.findIndex((item) => item.id === id || item.uid === id);
  if (existingIndex < 0) throw new Error('Registro nao encontrado.');
  docs[existingIndex] = { ...docs[existingIndex], ...data, updatedAt: nowIso() };
  store[collectionName] = docs;
  writeLocalStore(store);
  return docs[existingIndex];
};

const listDocs = async (collectionName) => {
  if (!isFirebaseConfigured || !db) return listLocal(collectionName);
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(normalizeDoc);
};

const saveDoc = async (collectionName, data, id) => {
  if (!isFirebaseConfigured || !db) return saveLocal(collectionName, data, id);

  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (id) {
    await setDoc(
      doc(db, collectionName, id),
      { ...payload, createdAt: data.createdAt || serverTimestamp() },
      { merge: true }
    );
    return { id, ...data };
  }

  const ref = await addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
};

const patchDoc = async (collectionName, id, data) => {
  if (!isFirebaseConfigured || !db) return updateLocal(collectionName, id, data);
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return { id, ...data };
};

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  if (!isFirebaseConfigured || !db) {
    return listLocal('users').find((user) => user.uid === uid || user.id === uid) || null;
  }
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? normalizeDoc(snapshot) : null;
};

export const saveUserProfile = async (uid, data) => {
  return saveDoc('users', { ...data, uid }, uid);
};

export const listDisposalPoints = async ({ includePending = false } = {}) => {
  const points = await listDocs('disposalPoints');
  return points
    .filter((point) => includePending || point.status === 'approved')
    .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
};

export const createDisposalPoint = async (data, ownerId) => {
  return saveDoc('disposalPoints', {
    ...data,
    ownerId,
    status: 'pending',
  });
};

export const updateDisposalPointStatus = async (id, status) => {
  return patchDoc('disposalPoints', id, { status });
};

export const listPickupRequests = async () => {
  const requests = await listDocs('pickupRequests');
  return requests.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
};

export const createPickupRequest = async (data, donor) => {
  return saveDoc('pickupRequests', {
    ...data,
    donorId: donor?.uid || 'anonymous',
    donorName: donor?.displayName || donor?.email || 'Doador',
    status: 'open',
    assignedCollectorId: '',
  });
};

export const assignPickupRequest = async (id, collectorId) => {
  return patchDoc('pickupRequests', id, {
    status: 'assigned',
    assignedCollectorId: collectorId,
  });
};

export const completePickupRequest = async (id) => {
  return patchDoc('pickupRequests', id, {
    status: 'completed',
    completedAt: nowIso(),
  });
};

export const listContent = async (collectionName) => {
  const docs = await listDocs(collectionName);
  return docs
    .filter((item) => item.published !== false)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
};

export const getContentBySlug = async (collectionName, slug) => {
  const docs = await listContent(collectionName);
  return docs.find((item) => item.slug === slug || item.id === slug) || null;
};

export const getDashboardStats = async () => {
  const [points, requests, users] = await Promise.all([
    listDisposalPoints({ includePending: true }),
    listPickupRequests(),
    listDocs('users'),
  ]);

  return {
    totalPoints: points.length,
    pendingPoints: points.filter((point) => point.status === 'pending').length,
    openRequests: requests.filter((request) => request.status === 'open').length,
    completedRequests: requests.filter((request) => request.status === 'completed').length,
    users: users.length,
  };
};

export const resetDemoStore = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createInitialStore()));
  }
};

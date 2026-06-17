import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { demoUsers } from '../data/demoData';
import { getUserProfile, saveUserProfile } from '../services/biosyncService';

const AuthContext = createContext(null);
const LOCAL_AUTH_KEY = 'biosync-demo-auth';

const readLocalUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(LOCAL_AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
};

const writeLocalUser = (user) => {
  if (typeof window !== 'undefined') {
    if (user) window.localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(LOCAL_AUTH_KEY);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(readLocalUser());
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await getUserProfile(firebaseUser.uid);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || profile?.displayName || firebaseUser.email,
        photoURL: firebaseUser.photoURL || profile?.photoUrl || '/user.png',
        role: profile?.role || 'donor',
        ...profile,
      });
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      return credentials.user;
    }

    const demoUser =
      demoUsers.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase()) ||
      demoUsers[0];
    const localUser = { ...demoUser, uid: demoUser.uid || demoUser.id };
    writeLocalUser(localUser);
    setUser(localUser);
    return localUser;
  };

  const register = async ({ password, ...profile }) => {
    if (isFirebaseConfigured && auth) {
      const credentials = await createUserWithEmailAndPassword(auth, profile.email, password);
      await updateProfile(credentials.user, { displayName: profile.displayName });
      await saveUserProfile(credentials.user.uid, {
        ...profile,
        uid: credentials.user.uid,
        photoUrl: '/user.png',
      });
      return credentials.user;
    }

    const uid = `demo-${Date.now()}`;
    const localUser = { ...profile, uid, id: uid, photoUrl: '/user.png' };
    await saveUserProfile(uid, localUser);
    writeLocalUser(localUser);
    setUser(localUser);
    return localUser;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    writeLocalUser(null);
    setUser(null);
  };

  const resetPassword = async (email) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
      return;
    }
    if (!email) throw new Error('Informe seu e-mail para simular a recuperacao.');
  };

  const refreshProfile = async () => {
    if (!user?.uid) return null;
    const profile = await getUserProfile(user.uid);
    const nextUser = { ...user, ...profile };
    setUser(nextUser);
    writeLocalUser(nextUser);
    return nextUser;
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isFirebaseConfigured,
    login,
    register,
    logout,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
};

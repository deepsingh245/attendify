import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signup(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  return signOut(auth);
}

// Firestore functions
export async function addCollection(collectionName: string, data: any) {
  return addDoc(collection(db, collectionName), data);
}

export async function setDocument(collectionName: string, docId: string, data: any) {
  return setDoc(doc(db, collectionName, docId), data);
}

export async function getDocument(collectionName: string, docId: string) {
  return getDoc(doc(db, collectionName, docId));
}

export async function getCollection(collectionName: string) {
  return getDocs(collection(db, collectionName));
}

export async function updateDocument(collectionName: string, docId: string, data: any) {
  return updateDoc(doc(db, collectionName, docId), data);
}

export async function deleteDocument(collectionName: string, docId: string) {
  return deleteDoc(doc(db, collectionName, docId));
}

// Subcollection functions
export async function addSubcollection(parentCollection: string, parentId: string, subCollection: string, data: any) {
  return addDoc(collection(db, parentCollection, parentId, subCollection), data);
}

export async function getSubcollection(parentCollection: string, parentId: string, subCollection: string) {
  return getDocs(collection(db, parentCollection, parentId, subCollection));
}

export async function setSubDocument(parentCollection: string, parentId: string, subCollection: string, docId: string, data: any) {
  return setDoc(doc(db, parentCollection, parentId, subCollection, docId), data);
}

export async function getSubDocument(parentCollection: string, parentId: string, subCollection: string, docId: string) {
  return getDoc(doc(db, parentCollection, parentId, subCollection, docId));
}

export async function updateSubDocument(parentCollection: string, parentId: string, subCollection: string, docId: string, data: any) {
  return updateDoc(doc(db, parentCollection, parentId, subCollection, docId), data);
}

export async function deleteSubDocument(parentCollection: string, parentId: string, subCollection: string, docId: string) {
  return deleteDoc(doc(db, parentCollection, parentId, subCollection, docId));
}

// Query example
export async function queryCollection(collectionName: string, field: string, value: any) {
  const q = query(collection(db, collectionName), where(field, '==', value));
  return getDocs(q);
}

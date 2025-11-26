/// <reference types="vite/client" />
import { LOCAL_STORAGE_KEYS } from '@/constants/constants';
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
  QueryConstraint,
  WhereFilterOp,
  orderBy,
  limit,
  writeBatch,
  WithFieldValue,
  DocumentData,
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
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ROLE);
  return signOut(auth);
}

// Firestore functions
export const addCollection = async <T>(collectionName: string, data: T) => {
  return addDoc(collection(db, collectionName), data as WithFieldValue<DocumentData>);
}

export const addDocument = async <T>(collectionName: string, data: T) => {
  return addDoc(collection(db, collectionName), data as WithFieldValue<DocumentData>);
}

export async function setDocument<T>(collectionName: string, docId: string, data: T) {
  return setDoc(doc(db, collectionName, docId), data as WithFieldValue<DocumentData>);
}

export async function getDocument(collectionName: string, docId: string) {
  return getDoc(doc(db, collectionName, docId));
}

export async function getCollection(collectionName: string) {
  return getDocs(collection(db, collectionName));
}

export async function updateDocument<T>(collectionName: string, docId: string, data: T) {
  return updateDoc(doc(db, collectionName, docId), data as WithFieldValue<DocumentData>);
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
export async function queryCollection(collectionName: string, field: string, value: any, op: WhereFilterOp = '==') {
  const q = query(collection(db, collectionName), where(field, op, value));
  return getDocs(q);
}

/**
 * Build a Firestore query dynamically with multiple filters, ordering, and limits.
 *
 * @param collectionName - The Firestore collection name
 * @param filters - An array of filter objects: [{ field, op, value }]
 * @param order - Optional ordering: { field, direction }
 * @param limitCount - Optional limit number
 * @returns A Firestore query object
 */
export const buildQuery = (
  collectionName: string,
  filters: { field: string; op: WhereFilterOp; value: any }[] = [],
  order?: { field: string; direction?: "asc" | "desc" },
  limitCount?: number
) => {
  const constraints: QueryConstraint[] = [];

  // Apply filters
  filters.forEach(({ field, op, value }) => {
    constraints.push(where(field, op, value));
  });

  // Apply ordering if provided
  if (order) {
    constraints.push(orderBy(order.field, order.direction || "asc"));
  }

  // Apply limit if provided
  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  // Build and return query
  return query(collection(db, collectionName), ...constraints);
};



/**
 * Generic Firestore batch writer
 *
 * @param db - Firestore instance
 * @param collectionName - Name of the Firestore collection
 * @param operations - Array of operations to perform
 * @param options - Optional config
 */
export const batchWrite = async <T>(
  collectionName: string,
  operations: Array<{
    id?: string;              // Optional document ID (if omitted, Firestore auto-generates one)
    data?: T;                 // Document data (required for 'set' and 'update')
    type: "set" | "update" | "delete";
  }>,
  options?: { merge?: boolean } // Merge mode for set operations
): Promise<void> => {
  const batch = writeBatch(db);
  const collectionRef = collection(db, collectionName);

  for (const op of operations) {
    const docRef = op.id ? doc(collectionRef, op.id) : doc(collectionRef);

    switch (op.type) {
      case "set":
        if (!op.data) throw new Error("Missing data for set operation");
        batch.set(docRef, op.data, { merge: options?.merge ?? false });
        break;
      case "update":
        if (!op.data || !op.id) throw new Error("Missing data or id for update operation");
        batch.update(docRef, op.data);
        break;
      case "delete":
        if (!op.id) throw new Error("Missing id for delete operation");
        batch.delete(docRef);
        break;
      default:
        throw new Error(`Unsupported operation type: ${op.type}`);
    }
  }

  await batch.commit();
  console.log(`✅ Batch committed successfully with ${operations.length} operations.`);
};
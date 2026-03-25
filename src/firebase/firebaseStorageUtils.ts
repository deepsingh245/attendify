import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseStorageConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_STORAGE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_STORAGE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_STORAGE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_STORAGE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_STORAGE_APP_ID,
};

const firebaseStorageApp = initializeApp(firebaseStorageConfig, 'storage-app');
const storage = getStorage(firebaseStorageApp);

export const uploadFileToFirebaseStorage = async (file: File, destinationPath: string) => {
  try {
    const storageRef = ref(storage, destinationPath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<{ url: string; path: string }>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        () => {
          // Optionally track progress here
        },
        (error) => {
          console.error('Error uploading file to Firebase Storage:', error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(storageRef);
          resolve({ url, path: destinationPath });
        }
      );
    });
  } catch (err) {
    console.error('Unhandled error in uploadFileToFirebaseStorage:', err);
    throw err;
  }
};

export const getStorageFileUrl = async (path: string) => {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
};

export const deleteStorageFile = async (path: string) => {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
};

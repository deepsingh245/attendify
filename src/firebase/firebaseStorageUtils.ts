import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseStorageConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_CORE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_CORE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_CORE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_CORE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_CORE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_CORE_APP_ID,
};

const firebaseStorageApp = initializeApp(firebaseStorageConfig, 'storage-app');
const storage = getStorage(firebaseStorageApp);

// Path helpers — all files live under attendify/{category}/{id}/
export const StoragePaths = {
  studentProfile: (id: string) => `attendify/students/${id}/profile.jpg`,
  teacherProfile: (id: string) => `attendify/teachers/${id}/profile.jpg`,
  adminProfile:   (id: string) => `attendify/admin/${id}/profile.jpg`,
  other:          (path: string) => `attendify/others/${path}`,
};

export const uploadFileToFirebaseStorage = async (file: File, destinationPath: string) => {
  const storageRef = ref(storage, destinationPath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<{ url: string; path: string }>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      () => {},
      (error) => {
        console.error('Storage upload error:', error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(storageRef);
        resolve({ url, path: destinationPath });
      }
    );
  });
};

export const getStorageFileUrl = async (path: string) => {
  return getDownloadURL(ref(storage, path));
};

export const deleteStorageFile = async (path: string) => {
  return deleteObject(ref(storage, path));
};

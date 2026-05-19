import { Collections } from "@/constants/constants";
import { getCollection, getDocument, addDocument } from "./firebaseUtils";
import { Admin, Class } from "./interfaces/user.interface";


export const getAdminById = async (adminId: string): Promise<Admin | null> => {
  try {
    const adminDoc = await getDocument(Collections.ADMINS, adminId);
    return adminDoc.data() as Admin;
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    throw error;
  }
};

export const getAllClasses = async () => {
  try {
    const classesCollection = await getCollection(Collections.CLASSES);
    return classesCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Class[];
  } catch (error) {
    console.error("Error fetching all classes:", error);
    throw error;
  }
};

// Add a new class
export const addClass = async (classData: Omit<Class, 'id'>): Promise<string> => {
  try {
    const docRef = await addDocument(Collections.CLASSES, classData);
    console.log(`✅ Class created successfully with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

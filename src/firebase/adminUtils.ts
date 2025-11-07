import { Collections } from "@/constants/constants";
import { getCollection, getDocument } from "./firebaseUtils";
import { Class } from "./interfaces/user.interface";


export const getAdminById = async (adminId: string) => {
  try {
    const adminDoc = await getDocument(Collections.ADMINS, adminId);
    return adminDoc;
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    throw error;
  }
};

export const getAllClasses = async () => {
  try {
    const classesCollection = await getCollection(Collections.CLASSES);
    return classesCollection.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Class[];
  } catch (error) {
    console.error("Error fetching all classes:", error);
    throw error;
  }
};

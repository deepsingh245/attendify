import { Collections } from "@/constants/constants";
import { getCollection, getDocument, queryCollection } from "./firebaseUtils";
import { Student } from "./interfaces/user.interface";

// Helper to safely retrieve document data with error handling
export const safeGetDocumentData = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const doc = await getDocument(collectionName, docId);
    return doc.data() as T | null; // Dynamically return the type T
  } catch (error) {
    console.error(`Error fetching document ${docId} from ${collectionName}:`, error);
    throw new Error(`Failed to get document ${docId}`);
  }
};

// Get a single student by ID (using the generic function)
export const getStudentById = async (studentId: string): Promise<Student | null> => {
  const studentData = await safeGetDocumentData<Student>(Collections.STUDENTS, studentId);
  return studentData ?? null; // Return null if no student is found
};

// Get all students
export const getAllStudents = async (): Promise<Student[]> => {
  try {
    const studentsCollection = await getCollection(Collections.STUDENTS);
    return studentsCollection.docs.map(doc => doc.data() as Student);
  } catch (error) {
    console.error("Error fetching all students:", error);
    return [];
  }
};

// Get all students in a class
export const getStudentsInClass = async (classId: string): Promise<Student[]> => {
  try {
    const allStudents = await queryCollection(Collections.STUDENTS, "classId", classId);
    return allStudents.docs.map(doc => doc.data() as Student);
  } catch (error) {
    console.error(`Error fetching students for class ${classId}:`, error);
    return [];
  }
};
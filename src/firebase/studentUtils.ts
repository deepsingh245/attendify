import { Collections } from "@/constants/constants";
import { getCollection, getDocument, queryCollection, setDocument, createAuthUser } from "./firebaseUtils";
import { Student } from "./interfaces/user.interface";
import { FieldValue } from "firebase/firestore";

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
    const allStudents = await queryCollection(Collections.STUDENTS, "classId", classId as unknown as FieldValue);
    return allStudents.docs.map(doc => doc.data() as Student);
  } catch (error) {
    console.error(`Error fetching students for class ${classId}:`, error);
    return [];
  }
};

// Update a student
export const updateStudent = async (studentId: string, updateData: Partial<Student>): Promise<void> => {
  try {
    const { updateDocument } = await import('./firebaseUtils');
    const payload = Object.fromEntries(
      Object.entries({ ...updateData, updatedAt: new Date().toISOString() })
        .filter(([, v]) => v !== undefined)
    );
    await updateDocument(Collections.STUDENTS, studentId, payload);
    console.log(`✅ Student ${studentId} updated successfully`);
  } catch (error) {
    console.error(`Error updating student ${studentId}:`, error);
    throw error;
  }
};

// Add a new student with Firebase Authentication
export const addStudent = async (studentData: Partial<Student> & { password: string }): Promise<string> => {
  try {
    // Validate required fields for auth
    if (!studentData.email || !studentData.password) {
      throw new Error("Email and password are required to create a student account");
    }

    // Step 1: Create Firebase Authentication user via secondary app (keeps admin signed in)
    const uid = await createAuthUser(studentData.email, studentData.password);

    // Step 2: Prepare student data with the UID as the document ID
    const { password: _pw, ...studentDataWithoutPassword } = studentData;
    const newStudent = {
      ...studentDataWithoutPassword,
      id: uid, // Use Firebase Auth UID as the student ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      role: 'student' as const,
    };
    
    // Step 3: Create Firestore document with the same ID as the Auth UID
    await setDocument(Collections.STUDENTS, uid, newStudent);
    
    console.log(`✅ Student created successfully with ID: ${uid}`);
    return uid;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error adding student:", error);
    
    // Provide more specific error messages
    if (error?.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered');
    } else if (error?.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters');
    } else if (error?.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    }
    
    throw error;
  }
};
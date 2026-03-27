/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collections } from "@/constants/constants";
import { getCollection, getDocument, buildQuery, updateDocument } from "./firebaseUtils";
import { Class, Teacher } from "./interfaces/user.interface";
import { getDocs } from "firebase/firestore";
import { signup } from "./firebaseUtils";

export const getTeacherById = async (teacherId: string): Promise<Teacher | null> => {
  const teacherDoc = await getDocument(Collections.TEACHERS, teacherId);
  return teacherDoc.data() as Teacher | null;
}

export const getAllTeachers = async (): Promise<Teacher[]> => {
  const teachersCollection = await getCollection(Collections.TEACHERS);
  return teachersCollection.docs.map(doc => doc.data() as Teacher);
}

export const getTeacherClasses = async (teacherId: string, classes: Teacher['classes']): Promise<Class[]> => {
  try {
    if (!classes || classes.length === 0) {
      return [];
    }
    // Extract class IDs from the teacher's classes array
    const classIds = classes.map(c => c.id);

    // Query only for classes that are in the teacher's classes array using 'in' operator
    const classesQuery = buildQuery(Collections.CLASSES, [
      { field: 'id', op: 'in', value: classIds }
    ]);
    
    const snapshot = await getDocs(classesQuery);    
    return snapshot.docs.map(doc => doc.data() as Class);
  } catch (error) {
    console.error(`Error fetching classes for teacher ${teacherId}:`, error);
    return [];
  }
}

export const getTeacherStudents = async (teacherId: string) => {
  const allStudents = await getCollection(Collections.STUDENTS);
  return allStudents.docs
    .map(doc => doc.data())
    .filter((s) => s.teacherId === teacherId);
}

export const getTeacherData = async (teacherId: string) => {
  const teacher = await getTeacherById(teacherId);
  const classes = await getTeacherClasses(teacherId, teacher?.classes || []);
  const students = await getTeacherStudents(teacherId);
  return { teacher, classes, students };
}

export const getClassById = async (classId: string): Promise<Class | null> => {
  const classDoc = await getDocument(Collections.CLASSES, classId);
  return classDoc.data() as Class | null;
}

// Add a new teacher with Firebase Authentication
export const addTeacher = async (teacherData: Partial<Teacher> & { password: string }): Promise<string> => {
  try {
    // Validate required fields for auth
    if (!teacherData.email || !teacherData.password) {
      throw new Error("Email and password are required to create a teacher account");
    }

    // Step 1: Create Firebase Authentication user
    const userCredential = await signup(teacherData.email, teacherData.password);
    const uid = userCredential.user.uid;

    // Step 2: Prepare teacher data with the UID as the document ID
    const { ...teacherDataWithoutPassword } = teacherData;
    const newTeacher = {
      ...teacherDataWithoutPassword,
      id: uid, // Use Firebase Auth UID as the teacher ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      role: 'teacher' as const,
    };

    // Step 3: Create Firestore document with the same ID as the Auth UID
    const { setDocument } = await import('./firebaseUtils');
    await setDocument(Collections.TEACHERS, uid, newTeacher);

    console.log(`✅ Teacher created successfully with ID: ${uid}`);
    return uid;
  } catch (error: any) {
    console.error("Error adding teacher:", error);

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

export const updateTeacherProfile = async (
  teacherId: string,
  updateData: Partial<Teacher>
) => {
  try {
    await updateDocument(Collections.TEACHERS, teacherId, updateData);
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    throw error;
  }
};

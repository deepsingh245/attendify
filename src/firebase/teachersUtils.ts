import { Collections } from "@/constants/constants";
import { getCollection, getDocument, buildQuery, updateDocument } from "./firebaseUtils";
import { Class, Teacher } from "./interfaces/user.interface";
import { getDoc, getDocs } from "firebase/firestore";

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

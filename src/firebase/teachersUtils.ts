import { Collections } from "@/constants/constants";
import { getCollection, getDocument, queryCollection } from "./firebaseUtils";
import { Class, Teacher } from "./interfaces/user.interface";

export const getTeacherById = async (teacherId: string): Promise<Teacher | null> => {
  const teacherDoc = await getDocument(Collections.TEACHERS, teacherId);
  return teacherDoc.data() as Teacher | null;
}

export const getAllTeachers = async (): Promise<Teacher[]> => {
  const teachersCollection = await getCollection(Collections.TEACHERS);
  return teachersCollection.docs.map(doc => doc.data() as Teacher);
}

export const getTeacherClasses = async (teacherId: string): Promise<Class[]> => {
  const teacherData = await getTeacherById(teacherId);
    const allClasses = await queryCollection(Collections.CLASSES, 'id', teacherData?.classes, 'array-contains');
  return allClasses.docs
    .map(doc => doc.data() as Class)
    .filter((c) => c.teacherId === teacherId);
}

export const getTeacherStudents = async (teacherId: string) => {
  const allStudents = await getCollection(Collections.STUDENTS);
  return allStudents.docs
    .map(doc => doc.data())
    .filter((s) => s.teacherId === teacherId);
}

export const getTeacherData = async (teacherId: string) => {
  const teacher = await getTeacherById(teacherId);
  const classes = await getTeacherClasses(teacherId);
  const students = await getTeacherStudents(teacherId);
  return { teacher, classes, students };
}

export const getClassById = async (classId: string): Promise<Class | null> => {
  const classDoc = await getDocument(Collections.CLASSES, classId);
  return classDoc.data() as Class | null;
}

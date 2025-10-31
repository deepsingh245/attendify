import { Collections } from "@/constants/constants";
import { getCollection, getDocument, queryCollection, updateDocument } from "./firebaseUtils";



export const getStudentById = async (studentId: string) => {
  const studentDoc = await getDocument(Collections.STUDENTS, studentId);
  return studentDoc.data();
}

export const getAllStudents = async () => {
  const studentsCollection = await getCollection(Collections.STUDENTS);
  return studentsCollection.docs.map(doc => doc.data());
}

export const getStudentsInClass = async (classId: string) => {
  const allStudents = await queryCollection(Collections.STUDENTS, 'classId', classId);
  return allStudents.docs.map(doc => doc.data());
}

export const getAttendanceForStudent = async (studentId: string) => {
  const studentDoc = await getDocument(Collections.ATTENDANCE, studentId);
  const studentData = studentDoc.data();
  return studentData || [];
}

export const getAttendanceForClassOnDate = async (classId: string, date: string) => {
  const studentsInClass = await getStudentsInClass(classId);
  return Promise.all(studentsInClass.map(student => getAttendanceForStudentOnDate(student.id, date)));
}

export const getAttendanceForStudentOnDate = async (studentId: string, date: string) => {
  const attendanceRecords = await getAttendanceForStudent(studentId);
  return attendanceRecords.find((record: { date: string }) => record.date === date);
}

export const markAttendanceForStudent = async (studentId: string, date: string, status: 'Present' | 'Absent') => {
  const studentDoc = await getDocument(Collections.STUDENTS, studentId);
  const studentData = studentDoc.data();
    const updatedAttendance = [...(studentData?.attendance || [])];
    const recordIndex = updatedAttendance.findIndex((record: { date: string }) => record.date === date);
    if (recordIndex >= 0) {
      updatedAttendance[recordIndex].status = status;
    } else {
      updatedAttendance.push({ date, status });
    }
    await updateDocument(Collections.STUDENTS, studentId, { ...studentData, attendance: updatedAttendance });
}

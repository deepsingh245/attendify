import { Collections } from "@/constants/constants";
import { addDocument, batchWrite, buildQuery, updateDocument } from "./firebaseUtils";
import { AttendanceRecord } from "./interfaces/user.interface";
import { getDocs } from "firebase/firestore";

// Get all attendance records (no filters)
export const getAllAttendance = async () => {
  const attendanceQuery = buildQuery(Collections.ATTENDANCE, []);
  const snapshot = await getDocs(attendanceQuery);
  return snapshot.docs.map((d) => d.data()) as AttendanceRecord[];
};

// Get attendance for a specific student
export const getAllAttendanceForStudent = async (studentId: string) => {
  const attendanceData = buildQuery(Collections.ATTENDANCE, [
    { field: 'studentId', op: '==', value: studentId }
  ]);
  return (await getDocs(attendanceData)).docs.map(doc => doc.data()) as AttendanceRecord[]; // Default to empty array if no attendance records exist
};

// Get attendance for all students in a class on a specific date
export const getAttendanceForClassOnDate = async (classId: string, date: number) => {
  // Normalize the start and end of the day in milliseconds
  const dateModified = new Date(date).toLocaleDateString('en-CA');
  const attendanceRecords = buildQuery(Collections.ATTENDANCE, [
    { field: "classId", op: "==", value: classId },
    { field: "date", op: "==", value: dateModified },
  ]);

  const snapshot = await getDocs(attendanceRecords);
  return snapshot.docs.map((doc) => doc.data());
};
// Get a student's attendance record for a specific date
export const getAttendanceForStudentOnDate = async (studentId: string, date: string) => {
    const dateModified = new Date(date).toLocaleDateString('en-CA');
  const attendanceRecords = buildQuery(Collections.ATTENDANCE, [
    { field: 'studentId', op: '==', value: studentId },
    { field: 'date', op: '==', value: dateModified },
  ]);
  return getDocs(attendanceRecords);
};

// Mark attendance for a student on a specific date
export const markAttendanceForStudent = async (studentId: string, date: string, status: 'Present' | 'Absent' | 'Leave') => {
  try {
    const dateModified = new Date(date).toLocaleDateString('en-CA');
    const attendanceRecords = buildQuery(Collections.ATTENDANCE, [
      { field: 'studentId', op: '==', value: studentId },
      { field: 'date', op: '==', value: dateModified }
    ]);
    const attendanceData = await getDocs(attendanceRecords);
    const attendanceDoc = attendanceData.docs[0];

    if (attendanceDoc) {
      // Update existing attendance record
      await updateDocument(Collections.ATTENDANCE, attendanceDoc.id, { status });
    } else {
      // Create new attendance record
      await addDocument(Collections.ATTENDANCE, { studentId, date, status });
    }
  } catch (error) {
    console.error(`Error marking attendance for student ${studentId}:`, error);
    throw new Error(`Failed to mark attendance for student ${studentId}`);
  }
};


export const markAttendanceForMultipleStudents = async (
  attendanceList: AttendanceRecord[]
) => {
  try {
    const operations: {
      id?: string;
      data: Partial<AttendanceRecord>;
      type: "set" | "update";
    }[] = [];

    for (const { studentId, date, status, classId } of attendanceList) {
      // Check if attendance record already exists
      const existingQuery = buildQuery(Collections.ATTENDANCE, [
        { field: "studentId", op: "==", value: studentId },
        { field: "date", op: "==", value: date },
      ]);

      const existingDocs = await getDocs(existingQuery);
      const existingDoc = existingDocs.docs[0];

      if (existingDoc) {
        // Update existing record
        operations.push({
          id: existingDoc.id,
          data: { status },
          type: "update",
        });
      } else {
        // Create new record
        operations.push({
          data: { studentId, date, status, classId },
          type: "set",
        });
      }
    }

    // Perform all operations in one batch
    await batchWrite(Collections.ATTENDANCE, operations);
    console.log(`✅ Attendance marked for ${attendanceList.length} students.`);
  } catch (error) {
    console.error("Error marking attendance for multiple students:", error);
    throw new Error("Failed to mark attendance for multiple students.");
  }
};
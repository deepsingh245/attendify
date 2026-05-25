import { getAllStudents, updateStudent } from './studentUtils';
import { getAllTeachers } from './teachersUtils';
import { getAllClasses, updateClass } from './adminUtils';
import { getAllAttendance } from './AttendanceUtils';
import { Collections } from '@/constants/constants';
import { updateDocument } from './firebaseUtils';
import { Student, Teacher, Class } from './interfaces/user.interface';

export type IntegrityReport = {
  checked: { students: number; teachers: number; classes: number; attendance: number };
  issues: string[];
  fixes: string[];
  counts: { studentsPatched: number; teachersPatched: number; classesPatched: number };
};

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

export async function runDataIntegrityFix(): Promise<IntegrityReport> {
  const issues: string[] = [];
  const fixes: string[] = [];
  let studentsPatched = 0;
  let teachersPatched = 0;
  let classesPatched = 0;

  // ── 1. Fetch all data in parallel ─────────────────────────────────────────
  const [allStudents, allTeachers, allClasses, allAttendance] = await Promise.all([
    getAllStudents(),
    getAllTeachers(),
    getAllClasses(),
    getAllAttendance(),
  ]);

  const studentMap = new Map<string, Student>(allStudents.map(s => [s.id, s]));
  const teacherMap = new Map<string, Teacher>(allTeachers.map(t => [t.id, t]));
  const classMap = new Map<string, Class>(allClasses.map(c => [c.id, c]));

  const studentIds = new Set(allStudents.map(s => s.id));
  const classIds = new Set(allClasses.map(c => c.id));

  // ── 2. Audit + Fix: Class subject (from teacher) ──────────────────────────
  for (const cls of allClasses) {
    const patches: Partial<Class> = {};

    if (!cls.teacherId) {
      issues.push(`Class "${cls.className}" (${cls.id}) has no teacherId.`);
      continue;
    }

    const teacher = teacherMap.get(cls.teacherId);
    if (!teacher) {
      issues.push(`Class "${cls.className}" (${cls.id}) references non-existent teacher ${cls.teacherId}.`);
      continue;
    }

    if (teacher.subject && cls.subject !== teacher.subject) {
      issues.push(`Class "${cls.className}" subject missing or outdated (was "${cls.subject ?? 'none'}", teacher has "${teacher.subject}").`);
      patches.subject = teacher.subject;
    }

    if (Object.keys(patches).length > 0) {
      await updateClass(cls.id, patches);
      fixes.push(`Set class "${cls.className}" subject → "${patches.subject}".`);
      classesPatched++;
      // Update local map for downstream checks
      classMap.set(cls.id, { ...cls, ...patches });
    }
  }

  // ── 3. Audit + Fix: Class.students ↔ Student.classId ─────────────────────
  // Source of truth: Student.classId
  // Build expected students per class
  const expectedStudentsForClass = new Map<string, string[]>();
  for (const student of allStudents) {
    if (!student.classId) continue;
    const list = expectedStudentsForClass.get(student.classId) ?? [];
    list.push(student.id);
    expectedStudentsForClass.set(student.classId, list);
  }

  for (const cls of allClasses) {
    const expected = (expectedStudentsForClass.get(cls.id) ?? []).sort();
    const actual = [...(cls.students ?? [])].sort();

    if (!arraysEqual(expected, actual)) {
      issues.push(`Class "${cls.className}" students list is out of sync (has ${actual.length}, should have ${expected.length}).`);
      await updateClass(cls.id, { students: expected });
      fixes.push(`Rebuilt students list for class "${cls.className}" (${expected.length} students).`);
      classesPatched++;
    }

    // Stale student IDs in class.students that don't exist
    for (const sid of cls.students ?? []) {
      if (!studentIds.has(sid)) {
        issues.push(`Class "${cls.className}" references non-existent student ID ${sid}.`);
      }
    }
  }

  // ── 4. Audit + Fix: Student.classes[] includes Student.classId ───────────
  for (const student of allStudents) {
    const patches: Partial<Student> = {};

    if (!student.classId) {
      issues.push(`Student "${student.userName}" (${student.id}) has no classId.`);
      continue;
    }

    if (!classIds.has(student.classId)) {
      issues.push(`Student "${student.userName}" classId "${student.classId}" does not exist in Classes collection.`);
      continue;
    }

    const currentClasses = student.classes ?? [];
    if (!currentClasses.includes(student.classId)) {
      issues.push(`Student "${student.userName}" classId "${student.classId}" not in their classes[] array.`);
      patches.classes = Array.from(new Set([...currentClasses, student.classId]));
    }

    if (Object.keys(patches).length > 0) {
      await updateStudent(student.id, patches);
      fixes.push(`Added classId to classes[] for student "${student.userName}".`);
      studentsPatched++;
    }
  }

  // ── 5. Audit + Fix: Teacher.classes[] ↔ Classes where teacherId === teacher.id ──
  for (const teacher of allTeachers) {
    // Find all classes that reference this teacher
    const actualClassIds = allClasses
      .filter(c => c.teacherId === teacher.id)
      .map(c => c.id);

    const currentTeacherClassIds = (teacher.classes ?? []).map(c => c.id);

    const missingFromTeacher = actualClassIds.filter(id => !currentTeacherClassIds.includes(id));
    const staleInTeacher = currentTeacherClassIds.filter(id => !classIds.has(id));

    if (missingFromTeacher.length > 0 || staleInTeacher.length > 0) {
      if (missingFromTeacher.length > 0) {
        issues.push(`Teacher "${teacher.userName}" is missing ${missingFromTeacher.length} class(es) from their classes[] array.`);
      }
      if (staleInTeacher.length > 0) {
        issues.push(`Teacher "${teacher.userName}" has ${staleInTeacher.length} stale/non-existent class ID(s) in their classes[] array.`);
      }

      // Rebuild the classes array preserving completed state for classes that already exist
      const existingMap = new Map(teacher.classes.map(c => [c.id, c]));
      const rebuilt = actualClassIds.map(id => ({
        id,
        isAttendanceMarkedForToday: existingMap.get(id)?.isAttendanceMarkedForToday ?? false,
        completed: existingMap.get(id)?.completed ?? false,
      }));

      await updateDocument(Collections.TEACHERS, teacher.id, { classes: rebuilt });
      fixes.push(`Rebuilt classes[] for teacher "${teacher.userName}" (${rebuilt.length} class(es)).`);
      teachersPatched++;
    }
  }

  // ── 6. Attendance orphan report (no auto-delete — report only) ────────────
  let orphanedAttendance = 0;
  for (const rec of allAttendance) {
    if (!studentIds.has(rec.studentId) || !classIds.has(rec.classId)) {
      orphanedAttendance++;
    }
  }
  if (orphanedAttendance > 0) {
    issues.push(`${orphanedAttendance} attendance record(s) reference non-existent students or classes (not auto-fixed — review manually).`);
  }

  return {
    checked: {
      students: allStudents.length,
      teachers: allTeachers.length,
      classes: allClasses.length,
      attendance: allAttendance.length,
    },
    issues,
    fixes,
    counts: { studentsPatched, teachersPatched, classesPatched },
  };
}

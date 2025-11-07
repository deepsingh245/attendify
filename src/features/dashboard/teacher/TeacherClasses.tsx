import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { AttendanceRecord, Class as ClassInterface, Student, Teacher } from "@/firebase/interfaces/user.interface";
import GenericTable from '@/components/shared/GenericTable';
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

import FaceRecognition from "./faceDetection";
import { getClassById, getTeacherById } from "@/firebase/teachersUtils";
import { getStudentsInClass } from "@/firebase/studentUtils";
import {getAttendanceForClassOnDate, markAttendanceForMultipleStudents } from "@/firebase/AttendanceUtils";
import GlobalLoader from "@/components/ui/global-loader";
import SelectAttendanceMethodModal from "@/components/modals/selectAttendanceMethodModal";
import { Edit } from "lucide-react";

// table row shape for precomputed rows
type ClassTableRow = {
  id: string
  rollNo?: string | number
  name?: string | unknown
  profilePictureUrl?: string
  attendanceToday?: string
  leaveToday?: string
  monthPresents?: number
}


const TeacherClasses = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classData, setClassData] = useState<ClassInterface>(
    {} as ClassInterface
  );
  const { id } = useParams<{ id: string }>();
  const [manualAttendanceOpen, setManualAttendanceOpen] = useState<boolean | null>(true);

  // students and derived state
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [todayKey, setTodayKey] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [tableRows, setTableRows] = useState<ClassTableRow[]>([]);

  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [presentToday, setPresentToday] = useState<number>(0);
  const [absentToday, setAbsentToday] = useState<number>(0);
  const [onLeaveToday, setOnLeaveToday] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceRecord[]>([]);

  const teacherId = "T001";
  const classId = id;

  useEffect(() => {
    // load teacher data
    const fetchTeacherData = async () => {
      const teachersData = await getTeacherById(teacherId);
      if (teachersData) {
        setTeacher(teachersData);
      }
      // load class data
      const classInfo = await getClassById(classId!);
      if (classInfo) {
        setClassData(classInfo);
      }

      const studentsInClass = await getStudentsInClass(classId!);
      // fetch students
      setStudentsInClass(studentsInClass ? studentsInClass : []);

      // update date-derived values (in case classData changed on a new day)
      const today = new Date();
      setTodayKey(today.toISOString().slice(0, 10));
      setTotalStudents(studentsInClass.length);
    };
    fetchTeacherData();
  }, [classId]);


  // derive totals when studentsInClass or date changes
  useEffect(() => {
    // compute totals in single pass for performance
    let present = 0;
    let onLeave = 0;

    const attendaceStats = async () => {
      const date = Date.now();
  const stats = (await getAttendanceForClassOnDate(classId!, date)) as AttendanceRecord[];
  setAttendanceStats(stats);

      present = stats.filter((rec) => rec.status === "Present").length;
      onLeave = stats.filter((rec) => rec.status === "Leave").length;
      const absent = totalStudents - present - onLeave;
      setPresentToday(present);
      setOnLeaveToday(onLeave);
      setAbsentToday(absent >= 0 ? absent : 0);
    };

    attendaceStats();
  }, [classId, todayKey, studentsInClass, totalStudents]);
  
  const onRecognize = (ids: string[]) => {
    // Update attendanceRecords state: set Present for each recognized student for today
    setAttendanceRecords((prev) => {
      // build a map from existing records so we can upsert
      const map: Record<string, AttendanceRecord> = {};
      for (const r of prev) {
        map[`${r.studentId}|${r.date}`] = r;
      }
      // also include existing persisted stats so we don't lose them when toggling
      for (const r of (attendanceStats as AttendanceRecord[] ?? [])) {
        map[`${r.studentId}|${r.date}`] = r;
      }

      for (const id of ids) {
        const key = `${id}|${todayKey}`;
        map[key] = {
          studentId: id,
          date: todayKey,
          status: 'Present',
          classId: classId!,
        } as AttendanceRecord;
      }

      const result = Object.values(map);
      setShowSaveButton(true);
      return result;
    });
  };

    // Prepare table rows (computed values) before return for clarity and reuse
  useEffect(() => {
  const Rows = studentsInClass.map((s) => {
    const recordToday = (attendanceRecords ?? []).find((a) => a.studentId === s.id && a.date === todayKey) as AttendanceRecord
      || (attendanceStats ?? []).find((a) => a.studentId === s.id && a.date === todayKey) as AttendanceRecord
      || null;
    const attendanceToday = recordToday ? recordToday.status : 'Not marked';
    const leaveToday = recordToday && recordToday.status === 'Leave' ? 'Yes' : '-';

    return {
      id: s.id,
      rollNo: s.rollNo,
      name: s.name,
      profilePictureUrl: s.profilePictureUrl,
      attendanceToday,
      leaveToday,    };
    });
    setTableRows(Rows);
  }, [studentsInClass, attendanceRecords, attendanceStats, todayKey, showSaveButton]);


  // saveAttendance hook should be declared before any early returns so hooks order is stable
  const saveAttendance = useCallback(async () => {
    try {
      setSaving(true);
      // Deduplicate by studentId+date so the last status wins
      const map = attendanceRecords.reduce(
        (acc: Record<string, AttendanceRecord>, r) => {
          const key = `${r.studentId}|${r.date}`;
          acc[key] = r;
          return acc;
        },
        {} as Record<string, AttendanceRecord>
      );
      const deduped = Object.values(map);
      await markAttendanceForMultipleStudents(deduped);
      // clear saved records (only remove saved ones)
      setAttendanceRecords((prev) => {
        // keep only records that were not part of deduped (should be none normally)
        const savedKeys = new Set(
          deduped.map((r) => `${r.studentId}|${r.date}`)
        );
        return prev.filter((r) => !savedKeys.has(`${r.studentId}|${r.date}`));
      });
      setShowSaveButton(false);
      setManualAttendanceOpen(true);
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setSaving(false);
    }
  }, [attendanceRecords]);

  // If teacher data hasn't loaded yet, show placeholder (hooks have already run)
  if (!teacher) {
    return <div className="p-6">Loading teacher data...</div>;
  }


  const stats = [
  { label: "Total Students", value: totalStudents },
  { label: "Present Today", value: presentToday, color: "text-green-600" },
  { label: "Absent Today", value: absentToday, color: "text-rose-600" },
  { label: "On Leave", value: onLeaveToday, color: "text-amber-600" },
];

  return (
    <div className="p-6 flex flex-col">
      <GlobalLoader show={saving} message="Saving attendance..." />
      <h1 className="text-2xl font-bold mb-4">
        Class {classData.className} Overview
      </h1>
      <div className="mb-4">Subject: {teacher.subject}</div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      {stats.map(({ label, value, color }, i) => (
        <Card key={i} className="w-full">
          <CardHeader>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className={`text-2xl font-bold ${color ?? ""}`}>{value}</div>
          </CardHeader>
        </Card>
      ))}
    </div>

      {/* Mark Attendance Dialog */}
     <SelectAttendanceMethodModal saving={saving} setManualAttendanceOpen={setManualAttendanceOpen} />

      {/* Students Table */}
      <div className="flex flex-col gap-3">
        {!manualAttendanceOpen && (
          <FaceRecognition
            studentsList={studentsInClass.map((s) => ({
              id: s.id,
              name: s.name,
            }))}
            onRecognize={onRecognize}
          />
        )}
        <GenericTable
          caption={"Today's Attendance Overview"}
          pageSize={10}
          data={tableRows}
          columns={[
            { key: 'rollNo', header: 'Roll No', width: '80px', render: (r: ClassTableRow) => <div className="font-medium">{r.rollNo}</div> },
            { key: 'name', header: 'Name', render: (r: ClassTableRow) => String(r.name ?? '') },
            { key: 'profilePictureUrl', header: 'Picture', render: (r: ClassTableRow) => (
                r.profilePictureUrl ? (
                  <img src={r.profilePictureUrl} alt={String(r.name ?? '')} className="h-12 w-12 rounded-full" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-center text-[9px]"><span className="text-gray-500">No Image</span></div>
                )
              ) },
            { key: 'attendanceToday', header: 'Attendance (Today)', render: (r: ClassTableRow) => {
                const attendanceVal = r.attendanceToday;
                const cls =
                  attendanceVal === 'Present'
                    ? 'text-green-600 dark:text-green-400'
                    : attendanceVal === 'Absent'
                    ? 'text-rose-600 dark:text-rose-400'
                    : attendanceVal === 'Leave'
                    ? 'text-amber-600'
                    : 'text-muted-foreground';
                return <div className={cls}>{attendanceVal}</div>
              } },
            { key: 'leaveToday', header: 'Leave', render: (r: ClassTableRow) => r.leaveToday, align: 'center' },
            { key: 'edit', header: 'Edit', render: () => <Edit className="cursor-pointer h-5 w-5 text-center" />, align: 'center' },
          ]}
        />

        {showSaveButton && (
          <>
            <Button className="mb-4 self-end" onClick={() => { saveAttendance(); setShowSaveButton(false); }}>
              Save Attendance
            </Button>
            <div className="">
              <div className="text-sm text-muted-foreground">
                Note: Attendance data is saved locally until you click "Save Attendance".
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;

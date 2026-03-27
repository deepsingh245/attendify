import { useCallback, useEffect, useState, useRef } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { AttendanceRecord, Class as ClassInterface, Student, Teacher } from "@/firebase/interfaces/user.interface";
import GenericTable, { Column } from '@/components/shared/GenericTable';
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import FaceRecognition from "./faceDetection";
import { FaceRecognitionRef } from "./faceDetection";
import { getClassById, getTeacherById } from "@/firebase/teachersUtils";
import { getStudentsInClass } from "@/firebase/studentUtils";
import {getAttendanceForClassOnDate, markAttendanceForMultipleStudents } from "@/firebase/AttendanceUtils";
import GlobalLoader from "@/components/ui/global-loader";

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


const ClassDetail = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [, setClassData] = useState<ClassInterface>(
    {} as ClassInterface
  );
  const { id } = useParams<{ id: string }>();
  const [manualAttendanceOpen, setManualAttendanceOpen] = useState<boolean | null>(true);

  // students and derived state
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [todayKey, setTodayKey] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [tableRows, setTableRows] = useState<ClassTableRow[]>([]);

  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [, setPresentToday] = useState<number>(0);
  const [, setAbsentToday] = useState<number>(0);
  const [, setOnLeaveToday] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceRecord[]>([]);
  // const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

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

  // Update totals when attendance records change (local changes)
  useEffect(() => {
    // Combine both Firebase stats and local records, with local records taking precedence
    const map: Record<string, AttendanceRecord> = {};
    
    for (const r of (attendanceStats ?? [])) {
      map[`${r.studentId}`] = r;
    }
    for (const r of attendanceRecords) {
      map[`${r.studentId}`] = r;
    }

    const allRecords = Object.values(map);
    const present = allRecords.filter((rec) => rec.status === "Present").length;
    const onLeave = allRecords.filter((rec) => rec.status === "Leave").length;
    const absent = totalStudents - present - onLeave;

    setPresentToday(present);
    setOnLeaveToday(onLeave);
    setAbsentToday(absent >= 0 ? absent : 0);
  }, [attendanceRecords, attendanceStats, totalStudents]);
  
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

  const handleAttendanceChange = useCallback((studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendanceRecords((prev) => {
      const map: Record<string, AttendanceRecord> = {};
      for (const r of prev) {
        map[`${r.studentId}|${r.date}`] = r;
      }
      for (const r of (attendanceStats as AttendanceRecord[] ?? [])) {
        map[`${r.studentId}|${r.date}`] = r;
      }

      const key = `${studentId}|${todayKey}`;
      map[key] = {
        studentId,
        date: todayKey,
        status,
        classId: classId!,
      } as AttendanceRecord;

      setShowSaveButton(true);
      // setEditingStudentId(null);
      return Object.values(map);
    });
  }, [attendanceStats, classId, todayKey]);

  const handleRecognizedStudents = useCallback((ids: string[], detectedCount: number, undetectedCount: number) => {
    setRecognizedStudentIds(ids);
    setDetectedFacesCount(detectedCount);
    setUndetectedFacesCount(undetectedCount);
  }, []);

  const onRecognize = useCallback((ids: string[], detectedCount: number, undetectedCount: number) => {
    handleRecognizedStudents(ids, detectedCount, undetectedCount);
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
  }, [attendanceStats, classId, handleRecognizedStudents, todayKey]);

  const faceRecognitionRef = useRef<FaceRecognitionRef>(null);

  const [detectedFacesCount, setDetectedFacesCount] = useState<number>(0);
  const [undetectedFacesCount, setUndetectedFacesCount] = useState<number>(0);
  const [recognizedStudentIds, setRecognizedStudentIds] = useState<string[]>([]);




  // const stats = [
  //   { label: "Total Students", value: totalStudents },
  //   { label: "Present Today", value: presentToday, color: "text-green-600" },
  //   { label: "Absent Today", value: absentToday, color: "text-rose-600" },
  //   { label: "On Leave", value: onLeaveToday, color: "text-amber-600" },
  // ];

  // const getAttendanceClass = (val?: string) => {
  //   switch (val) {
  //     case "Present":
  //       return "text-green-600 dark:text-green-400";
  //     case "Absent":
  //       return "text-rose-600 dark:text-rose-400";
  //     case "Leave":
  //       return "text-amber-600";
  //     default:
  //       return "text-muted-foreground";
  //   }
  // };

const getTodayStatus = (id: string) =>
  attendanceRecords.find(a => a.studentId === id && a.date === todayKey)?.status ||
  attendanceStats.find(a => a.studentId === id && a.date === todayKey)?.status;

const AttendanceButton = ({
  id,
  type,
}: { id: string; type: "Present" | "Absent" | "Leave" }) => {
  const active = getTodayStatus(id) === type;
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={() => handleAttendanceChange(id, type)}
      className="w-8 h-8 p-0"
    >
      {type[0]}
    </Button>
  );
};

const columns: Column<ClassTableRow>[] = [
  {
    key: "rollNo",
    header: "Roll No",
  },
  {
    key: "name",   
    header: "Name",
  },
  {
    key: "profilePictureUrl",
    header: "Profile Picture",
    render: (row) => (
      <img src={row.profilePictureUrl} alt={row.name as string} className="h-8 w-8 rounded-full" />
    ),
  },
  {
    key: "attendanceToday",
    header: "Attendance Today",
    render: (row) => (
      <div className={`font-medium ${row.attendanceToday === 'Present' ? 'text-green-500' : row.attendanceToday === 'Absent' ? 'text-red-500' : 'text-gray-500'}`}>
        {row.attendanceToday}
      </div>
    ),
  },
  {
    key: "leaveToday",
    header: "Leave Today",
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <div className="flex items-center gap-2">
        <AttendanceButton id={row.id} type="Present" />
        <AttendanceButton id={row.id} type="Absent" />
        <AttendanceButton id={row.id} type="Leave" />
      </div>
    ),
  },
];

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
        name: s.userName || "Unknown",
        profilePictureUrl: s.profilePictureUrl,
        attendanceToday,
        leaveToday,    
      };
    });
    setTableRows(Rows);
  }, [studentsInClass, attendanceRecords, attendanceStats, todayKey, showSaveButton]);

  if (!teacher) {
    return <GlobalLoader show={!teacher} message="Fetching class details..." />;
  }

  return (
    <>
      <div className="flex flex-col flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <Card className="p-4 flex flex-col items-center justify-center min-h-[300px]">
              <CardHeader className="w-full flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Upload Classroom Image</h3>
                  <p className="text-sm text-gray-500">Upload a photo of the class. AI will detect and mark attendance</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setManualAttendanceOpen(true)}>Use Manual Instead</Button>
                  <Button onClick={() => faceRecognitionRef.current?.detectFaces()}>Detect Faces</Button>
                </div>
              </CardHeader>
              <div className="relative w-full h-[400px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                {!manualAttendanceOpen ? (
                  <FaceRecognition ref={faceRecognitionRef} studentsList={studentsInClass.map(s => ({ id: s.id, name: s.userName || "Unknown" }))} onRecognize={onRecognize} />
                ) : (
                  <div className="text-gray-500">Switch to facial recognition to upload an image</div>
                )}
              </div>
            </Card>
          </div>
          <div className="md:col-span-1 flex flex-col gap-4">
            <Card className="p-4 flex-1">
              <h3 className="text-lg font-semibold mb-2">Detection Results</h3>
              <p className="text-sm text-gray-500 mb-4">Review and confirm</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-500">{detectedFacesCount}</div>
                  <div className="text-sm text-gray-500">Detected</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-red-500">{undetectedFacesCount}</div>
                  <div className="text-sm text-gray-500">Undetected</div>
                </Card>
              </div>
              <Button className="w-full" onClick={() => {
                const toMark = recognizedStudentIds.map(id => ({ studentId: id, date: todayKey, status: 'Present' as const, classId: classId! }));
                markAttendanceForMultipleStudents(toMark);
                setShowSaveButton(false);
              }}
              disabled={recognizedStudentIds.length === 0 || saving}
              >
                Confirm & Submit Attendance
              </Button>
            </Card>
            <Card className="p-4 flex-1">
              <h3 className="text-lg font-semibold mb-2">Detection Preview</h3>
              <div className="relative w-full h-[200px] border border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-gray-500">No image uploaded yet</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Manual Attendance Table */}
        {manualAttendanceOpen && (
          <Card className="p-4">
            <CardHeader className="flex-row flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Manual Attendance</h3>
                <p className="text-sm text-gray-500">Mark attendance manually</p>
              </div>
            </CardHeader>
            <GenericTable
              columns={columns}
              data={tableRows}
              showPagination={false}
              className="max-h-[400px]"
            />
            {showSaveButton && (
              <Button onClick={saveAttendance} disabled={saving} className="mt-4">
                {saving ? <Spinner /> : "Save Attendance"}
              </Button>
            )}
          </Card>
        )}
      </div>
    </>
  );
};

export default ClassDetail;


import { useCallback, useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AttendanceRecord, Class as ClassInterface, Student, Teacher } from "@/firebase/interfaces/user.interface";
import GenericTable, { Column } from '@/components/shared/GenericTable';
import { useParams, useBlocker } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, CheckCircle2, XCircle, Clock, ScanFace, BookCheck } from "lucide-react";
import FaceRecognition, { FaceRecognitionRef } from "./faceDetection";
import { getClassById, getTeacherById } from "@/firebase/teachersUtils";
import { getStudentsInClass } from "@/firebase/studentUtils";
import { getAttendanceForClassOnDate, markAttendanceForMultipleStudents } from "@/firebase/AttendanceUtils";
import GlobalLoader from "@/components/ui/global-loader";
import StatCard from "@/components/shared/StatCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ClassTableRow = {
  id: string;
  rollNo?: string | number;
  name?: string | unknown;
  profilePictureUrl?: string;
  attendanceToday?: string;
  leaveToday?: string;
};

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const classId = id;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [, setClassData] = useState<ClassInterface>({} as ClassInterface);
  const [manualAttendanceOpen, setManualAttendanceOpen] = useState<boolean>(true);

  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [todayKey] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [tableRows, setTableRows] = useState<ClassTableRow[]>([]);

  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [presentToday, setPresentToday] = useState<number>(0);
  const [absentToday, setAbsentToday] = useState<number>(0);
  const [onLeaveToday, setOnLeaveToday] = useState<number>(0);

  const [saving, setSaving] = useState<boolean>(false);
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceRecord[]>([]);

  const [detectedFacesCount, setDetectedFacesCount] = useState<number>(0);
  const [undetectedFacesCount, setUndetectedFacesCount] = useState<number>(0);
  const [recognizedStudentIds, setRecognizedStudentIds] = useState<string[]>([]);

  const faceRecognitionRef = useRef<FaceRecognitionRef>(null);

  // Hardcoded teacher ID kept as-is from original
  const teacherId = "T001";

  // ─── Data fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchTeacherData = async () => {
      const teachersData = await getTeacherById(teacherId);
      if (teachersData) setTeacher(teachersData);

      const classInfo = await getClassById(classId!);
      if (classInfo) setClassData(classInfo);

      const students = await getStudentsInClass(classId!);
      setStudentsInClass(students ?? []);
      setTotalStudents(students?.length ?? 0);
    };
    fetchTeacherData();
  }, [classId]);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = (await getAttendanceForClassOnDate(classId!, Date.now())) as AttendanceRecord[];
      setAttendanceStats(stats);
    };
    fetchStats();
  }, [classId, todayKey, studentsInClass]);

  // ─── Derived totals (local + Firebase merged) ─────────────────────────────

  useEffect(() => {
    const map: Record<string, AttendanceRecord> = {};
    for (const r of attendanceStats ?? []) map[r.studentId] = r;
    for (const r of attendanceRecords) map[r.studentId] = r;

    const all = Object.values(map);
    const present = all.filter(r => r.status === 'Present').length;
    const leave = all.filter(r => r.status === 'Leave').length;
    const absent = totalStudents - present - leave;

    setPresentToday(present);
    setOnLeaveToday(leave);
    setAbsentToday(absent >= 0 ? absent : 0);
  }, [attendanceRecords, attendanceStats, totalStudents]);

  // ─── Table rows ───────────────────────────────────────────────────────────

  useEffect(() => {
    const rows = studentsInClass.map(s => {
      const record =
        attendanceRecords.find(a => a.studentId === s.id && a.date === todayKey) ??
        attendanceStats.find(a => a.studentId === s.id && a.date === todayKey) ??
        null;
      return {
        id: s.id,
        rollNo: s.rollNo,
        name: s.userName || 'Unknown',
        profilePictureUrl: s.profilePictureUrl,
        attendanceToday: record ? record.status : 'Not marked',
        leaveToday: record?.status === 'Leave' ? 'Yes' : '-',
      };
    });
    setTableRows(rows);
  }, [studentsInClass, attendanceRecords, attendanceStats, todayKey]);

  // ─── Unsaved data guards ──────────────────────────────────────────────────

  // Browser close / refresh guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (showSaveButton) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [showSaveButton]);

  // In-app navigation guard
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      showSaveButton && currentLocation.pathname !== nextLocation.pathname
  );

  // ─── Attendance handlers ──────────────────────────────────────────────────

  const saveAttendance = useCallback(async () => {
    try {
      setSaving(true);
      const map = attendanceRecords.reduce(
        (acc: Record<string, AttendanceRecord>, r) => {
          acc[`${r.studentId}|${r.date}`] = r;
          return acc;
        },
        {}
      );
      await markAttendanceForMultipleStudents(Object.values(map));
      setAttendanceRecords([]);
      setShowSaveButton(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setSaving(false);
    }
  }, [attendanceRecords]);

  const handleAttendanceChange = useCallback(
    (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
      setAttendanceRecords(prev => {
        const map: Record<string, AttendanceRecord> = {};
        for (const r of prev) map[`${r.studentId}|${r.date}`] = r;
        for (const r of (attendanceStats ?? [])) map[`${r.studentId}|${r.date}`] = r;
        map[`${studentId}|${todayKey}`] = { studentId, date: todayKey, status, classId: classId! };
        setShowSaveButton(true);
        return Object.values(map);
      });
    },
    [attendanceStats, classId, todayKey]
  );

  const onRecognize = useCallback(
    (ids: string[], detectedCount: number, undetectedCount: number) => {
      setRecognizedStudentIds(ids);
      setDetectedFacesCount(detectedCount);
      setUndetectedFacesCount(undetectedCount);
      setAttendanceRecords(prev => {
        const map: Record<string, AttendanceRecord> = {};
        for (const r of prev) map[`${r.studentId}|${r.date}`] = r;
        for (const r of (attendanceStats ?? [])) map[`${r.studentId}|${r.date}`] = r;
        for (const id of ids) {
          map[`${id}|${todayKey}`] = { studentId: id, date: todayKey, status: 'Present', classId: classId! };
        }
        setShowSaveButton(true);
        return Object.values(map);
      });
    },
    [attendanceStats, classId, todayKey]
  );

  // ─── Table helpers ────────────────────────────────────────────────────────

  const getTodayStatus = (studentId: string) =>
    attendanceRecords.find(a => a.studentId === studentId && a.date === todayKey)?.status ??
    attendanceStats.find(a => a.studentId === studentId && a.date === todayKey)?.status;

  const AttendanceButton = ({ id: sid, type }: { id: string; type: 'Present' | 'Absent' | 'Leave' }) => {
    const active = getTodayStatus(sid) === type;
    return (
      <Button
        size="sm"
        variant={active ? 'default' : 'outline'}
        onClick={() => handleAttendanceChange(sid, type)}
        className="w-8 h-8 p-0"
      >
        {type[0]}
      </Button>
    );
  };

  const columns: Column<ClassTableRow>[] = [
    { key: 'rollNo', header: 'Roll No' },
    { key: 'name', header: 'Name' },
    {
      key: 'profilePictureUrl',
      header: 'Profile Picture',
      render: row => (
        <img src={row.profilePictureUrl} alt={row.name as string} className="h-8 w-8 rounded-full object-cover" />
      ),
    },
    {
      key: 'attendanceToday',
      header: 'Attendance Today',
      render: row => (
        <div
          className={`font-medium ${
            row.attendanceToday === 'Present'
              ? 'text-green-500'
              : row.attendanceToday === 'Absent'
              ? 'text-red-500'
              : row.attendanceToday === 'Leave'
              ? 'text-amber-500'
              : 'text-muted-foreground'
          }`}
        >
          {row.attendanceToday}
        </div>
      ),
    },
    { key: 'leaveToday', header: 'Leave Today' },
    {
      key: 'actions',
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-2">
          <AttendanceButton id={row.id} type="Present" />
          <AttendanceButton id={row.id} type="Absent" />
          <AttendanceButton id={row.id} type="Leave" />
        </div>
      ),
    },
  ];

  // ─── Early return ─────────────────────────────────────────────────────────

  if (!teacher) {
    return <GlobalLoader show message="Fetching class details..." />;
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col flex-1 p-4 overflow-auto space-y-4">

        {/* Mode toggle — top left */}
        <div>
          <Button variant="outline" onClick={() => setManualAttendanceOpen(prev => !prev)}>
            {manualAttendanceOpen ? (
              <>
                <ScanFace className="w-4 h-4 mr-2" />
                Switch to Face Recognition
              </>
            ) : (
              <>
                <BookCheck className="w-4 h-4 mr-2" />
                Use Manual Instead
              </>
            )}
          </Button>
        </div>

        {manualAttendanceOpen ? (
          /* ── MANUAL MODE ── */
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Students"
                value={totalStudents}
                gradient="from-blue-500 to-indigo-600"
                icon={<Users className="w-5 h-5 text-white" />}
                colorText="text-blue-100"
              />
              <StatCard
                title="Present Today"
                value={presentToday}
                gradient="from-green-500 to-emerald-600"
                icon={<CheckCircle2 className="w-5 h-5 text-white" />}
                colorText="text-green-100"
              />
              <StatCard
                title="Absent Today"
                value={absentToday}
                gradient="from-red-500 to-rose-600"
                icon={<XCircle className="w-5 h-5 text-white" />}
                colorText="text-red-100"
              />
              <StatCard
                title="On Leave"
                value={onLeaveToday}
                gradient="from-amber-500 to-orange-600"
                icon={<Clock className="w-5 h-5 text-white" />}
                colorText="text-amber-100"
              />
            </div>

            {/* Student table */}
            <Card className="p-4">
              <CardHeader className="flex-row flex items-center justify-between px-0 pt-0">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Manual Attendance</h3>
                  <p className="text-sm text-muted-foreground">Mark attendance manually</p>
                </div>
              </CardHeader>
              <GenericTable
                columns={columns}
                data={tableRows}
                showPagination={false}
                className="max-h-[400px]"
              />
              <div className="mt-4">
                <Button
                  onClick={saveAttendance}
                  disabled={saving || attendanceRecords.length === 0}
                  className="w-full sm:w-auto"
                >
                  {saving ? <Spinner /> : 'Save Attendance'}
                </Button>
              </div>
            </Card>
          </>
        ) : (
          /* ── FACE RECOGNITION MODE ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Left — Upload + Image */}
            <div className="lg:col-span-2">
              <Card className="flex flex-col">
                <CardHeader className="flex-row flex items-center justify-between pb-2 pt-4 px-4">
                  <div>
                    <h3 className="text-lg font-semibold">Upload Classroom Image</h3>
                    <p className="text-sm text-muted-foreground">AI detects faces and marks attendance</p>
                  </div>
                  <Button size="sm" onClick={() => faceRecognitionRef.current?.detectFaces()}>
                    <ScanFace className="w-4 h-4 mr-2" />
                    Detect Faces
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <FaceRecognition
                    ref={faceRecognitionRef}
                    studentsList={studentsInClass.map(s => ({ id: s.id, name: s.userName || 'Unknown', profilePictureUrl: s.profilePictureUrl }))}
                    onRecognize={onRecognize}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right — Results + Student list */}
            <div className="lg:col-span-1 flex flex-col gap-4">

              {/* Stats + Submit */}
              <Card className="p-4">
                <h3 className="text-base font-semibold mb-3">Detection Results</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <div className="text-2xl font-bold text-green-500">{detectedFacesCount}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Recognised</div>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <div className="text-2xl font-bold text-red-500">{undetectedFacesCount}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Unknown</div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={recognizedStudentIds.length === 0 || saving}
                  onClick={() => {
                    const toMark = recognizedStudentIds.map(sid => ({
                      studentId: sid,
                      date: todayKey,
                      status: 'Present' as const,
                      classId: classId!,
                    }));
                    markAttendanceForMultipleStudents(toMark);
                  }}
                >
                  {saving ? <Spinner /> : `Confirm & Submit (${recognizedStudentIds.length})`}
                </Button>
              </Card>

              {/* Recognised students list */}
              <Card className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">Recognised Students</h3>
                  {recognizedStudentIds.length > 0 && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {recognizedStudentIds.length} present
                    </Badge>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[340px]">
                  {recognizedStudentIds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                      <ScanFace className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">Upload a photo to see results</p>
                    </div>
                  ) : (
                    studentsInClass
                      .filter(s => recognizedStudentIds.includes(s.id))
                      .map(student => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20"
                        >
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={student.profilePictureUrl} alt={student.userName} />
                            <AvatarFallback className="bg-green-900/40 text-green-300 text-xs">
                              {student.userName?.substring(0, 2).toUpperCase() ?? 'ST'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{student.userName}</p>
                            <p className="text-xs text-muted-foreground">Roll #{student.rollNo}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs shrink-0">
                            Present
                          </Badge>
                        </div>
                      ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* In-app navigation unsaved-data guard */}
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Attendance</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved attendance changes. If you leave now, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Stay on page</AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>Leave anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClassDetail;

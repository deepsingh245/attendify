import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { teachersData } from "./teachersData";
import { Class as ClassInterface, Student } from "@/firebase/interfaces/user.interface";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookCheck, ScanFace } from "lucide-react";
import FaceRecognition from "./faceDetection";
import { DialogClose } from "@radix-ui/react-dialog";
import { getAllStudents } from "@/firebase/studentUtils";

// Local fixtures
type LocalTeacher = {
  id: string;
  name: string;
  subject: string;
  classesAssigned: string[];
  classesCompleted: string[];
  classesPending: string[];
};
type AttendanceRecord = { date: string; status: 'Present' | 'Absent' | 'Leave' };

const TeacherClasses = () => {
  const [teacher, setTeacher] = useState<LocalTeacher | null>(null);
  const [classData, setClassData] = useState<ClassInterface>(
    {} as ClassInterface
  );
  const { id } = useParams<{ id: string }>();
  const [manualAttendanceOpen, setManualAttendanceOpen] = useState<boolean | null>(true);

  // students and derived state
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [todayKey, setTodayKey] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());

  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [presentToday, setPresentToday] = useState<number>(0);
  const [absentToday, setAbsentToday] = useState<number>(0);

  const teacherId = "T001";
  const classId = id;

  useEffect( () => {
    // Find teacher
    const allTeachers = (teachersData.teachers ??
      []) as unknown as LocalTeacher[];
    const t = allTeachers.find((tt) => tt.id === teacherId);
    setTeacher(t ?? null);

    // Find classes assigned
    const allClasses = (teachersData.classes ??
      []) as unknown as ClassInterface[];
    const myClass =
      allClasses.find((c) => c.id === classId) ?? ({} as ClassInterface);
    setClassData(myClass);
  }, [classId]);



  // Compute student and attendance summary
  useEffect(() => {
    // async fetch inside effect
    let mounted = true;
    const fetchStudents = async () => {
      try {
        const allStudents = (await getAllStudents()) as unknown as Student[];
        console.log("🚀 ~ fetchStudents ~ allStudents:", allStudents)
        if (!mounted) return;
        const inClass = (allStudents ?? []).filter((s) => classData.id === s.classId);
        setStudentsInClass(inClass);

        // update date-derived values (in case classData changed on a new day)
        const today = new Date();
        setTodayKey(today.toISOString().slice(0, 10));
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
      } catch (err) {
        console.error('Failed to fetch students', err);
        setStudentsInClass([]);
      }
    };

    fetchStudents();
    return () => { mounted = false; };
  }, [classData]);

  // derive totals when studentsInClass or date changes
  useEffect(() => {
    const total = studentsInClass.length;
    const present = studentsInClass.filter((s) =>
      ((s.attendance ?? []) as AttendanceRecord[]).some((a) => a.date === todayKey && a.status === 'Present')
    ).length;
    const absent = total - present;
    setTotalStudents(total);
    setPresentToday(present);
    setAbsentToday(absent);
  }, [studentsInClass, todayKey, currentMonth, currentYear]);
  
  // If teacher data hasn't loaded yet, show placeholder (hooks have already run)
  if (!teacher) {
    return <div className="p-6">Loading teacher data...</div>;
  }
  return (
    <div className="p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">
        Class {classData.className} Overview
      </h1>
      <div className="mb-4">Subject: {teacher.subject}</div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="w-full">
          <CardHeader>
            <div className="text-sm text-muted-foreground">Total Students</div>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardHeader>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <div className="text-sm text-muted-foreground">Present Today</div>
            <div className="text-2xl font-bold text-green-600">
              {presentToday}
            </div>
          </CardHeader>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <div className="text-sm text-muted-foreground">Absent Today</div>
            <div className="text-2xl font-bold text-rose-600">
              {absentToday}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Mark Attendance Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          {/* <Button variant="outline">Open Dialog</Button> */}
          <Button className="mb-4 self-end">Mark Attendance</Button>
        </DialogTrigger>
        <form>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Choose Attendance Method</DialogTitle>
            </DialogHeader>
            <DialogDescription className="flex gap-4 py-4">
              <DialogClose
                onClick={() => setManualAttendanceOpen(false)}
                className="w-full h-full flex items-center flex-col border border-gray-600 rounded-md p-4 hover:bg-gray-900"
              >
                <ScanFace className="mr-2 h-12 w-12" />
                Use Face Recognition
              </DialogClose>
              <DialogClose
                onClick={() => setManualAttendanceOpen(true)}
                className="w-full h-full flex items-center justify-between flex-col border border-gray-600 rounded-md p-4 hover:bg-gray-900"
              >
                <BookCheck className="mr-2 h-12 w-12" />
                Manual Entry
              </DialogClose>
            </DialogDescription>
          </DialogContent>
        </form>
      </Dialog>

      {/* Students Table */}
      <div className="flex flex-col gap-3">
      {!manualAttendanceOpen && (
        <FaceRecognition
          studentsList={studentsInClass.map((s) => ({ id: s.id, name: s.name }))}
          onRecognize={(ids: string[]) => {
            setStudentsInClass((prev) =>
              prev.map((stu) => {
                if (!ids.includes(stu.id)) return stu;
                const todayRecIndex = ((stu.attendance ?? []) as AttendanceRecord[]).findIndex((a) => a.date === todayKey);
                const attendanceCopy = [...(stu.attendance ?? [])];
                if (todayRecIndex !== -1) {
                  attendanceCopy[todayRecIndex] = { ...attendanceCopy[todayRecIndex], status: 'Present' };
                } else {
                  attendanceCopy.push({ date: todayKey, status: 'Present' });
                }
                return { ...stu, attendance: attendanceCopy };
              })
            );
          }}
        />
      )}
        <div className="overflow-auto  rounded-md shadow-sm">
          <Table>
            <TableCaption>Today's Attendance Overview</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Picture</TableHead>
                <TableHead>Attendance (Today)</TableHead>
                <TableHead>Leave</TableHead>
                <TableHead>Current Month Presents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsInClass.map((s) => {
                const recordToday = ((s.attendance ?? []) as AttendanceRecord[]).find((a) => a.date === todayKey);
                const attendanceToday = recordToday ? recordToday.status : "Not marked";
                const leaveToday = recordToday && recordToday.status === "Leave" ? "Yes" : "-";
                const monthPresents = ((s.attendance ?? []) as AttendanceRecord[]).filter((a) => {
                  const d = new Date(a.date);
                  return a.status === "Present" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                }).length;

                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.rollNo}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      {s.profilePictureUrl ? (
                        <img src={s.profilePictureUrl} alt={s.name} className="h-12 w-12 rounded-full" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-center text-[9px]">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={
                      attendanceToday === "Present"
                        ? "text-green-600 dark:text-green-400"
                        : attendanceToday === "Absent"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                    }>
                      {attendanceToday}
                    </TableCell>
                    <TableCell>{leaveToday}</TableCell>
                    <TableCell>{monthPresents}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TeacherClasses;

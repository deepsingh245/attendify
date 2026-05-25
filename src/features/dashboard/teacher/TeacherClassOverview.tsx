import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Class, Student, Teacher } from '@/firebase/interfaces/user.interface';
import { getClassById, getTeacherById } from '@/firebase/teachersUtils';
import { getStudentsInClass } from '@/firebase/studentUtils';
import { getAttendanceForClassOnDate } from '@/firebase/AttendanceUtils';
import { AttendanceRecord } from '@/firebase/interfaces/user.interface';
import StatCard from '@/components/shared/StatCard';
import GlobalLoader from '@/components/ui/global-loader';
import { TeacherEditStudentModal } from './TeacherEditStudentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  CalendarCheck,
  UserCheck,
  Search,
  ArrowLeft,
  ClipboardList,
  Pencil,
} from 'lucide-react';

export default function TeacherClassOverview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cls, setCls] = useState<Class | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const classData = await getClassById(id);
        setCls(classData);

        const [studs, attendance] = await Promise.all([
          getStudentsInClass(id),
          getAttendanceForClassOnDate(id, Date.now()),
        ]);
        setStudents(studs);

        // avg attendance for today
        const records = attendance as AttendanceRecord[];
        const present = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
        setAvgAttendance(studs.length > 0 ? Math.round((present / studs.length) * 100) : 0);

        if (classData?.teacherId) {
          const t = await getTeacherById(classData.teacherId);
          setTeacher(t);
        }
      } catch (err) {
        console.error('Failed to load class overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleStudentUpdated = (updated: Student) => {
    setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    setEditingStudent(null);
  };

  const getInitials = (name?: string) =>
    name ? name.substring(0, 2).toUpperCase() : 'ST';

  const filtered = students.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.userName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    );
  });

  if (loading) return <GlobalLoader show message="Loading class…" />;
  if (!cls) return <div className="p-8 text-center text-muted-foreground">Class not found.</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {cls.className}
            </h1>
            {teacher?.subject && (
              <Badge variant="secondary" className="mt-1 text-xs bg-slate-800">
                {teacher.subject}
              </Badge>
            )}
          </div>
        </div>
        <Button
          onClick={() => navigate(`/teacher/class/${id}/attendance`)}
          className="sm:shrink-0 gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Mark Attendance
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Students"
          value={students.length}
          gradient="from-blue-500 to-indigo-600"
          icon={<Users className="w-5 h-5 text-foreground" />}
          colorText="text-blue-100"
          subtitle="Enrolled"
        />
        <StatCard
          title="Today's Attendance"
          value={`${avgAttendance}%`}
          gradient="from-green-500 to-emerald-600"
          icon={<CalendarCheck className="w-5 h-5 text-foreground" />}
          colorText="text-green-100"
          subtitle={avgAttendance >= 75 ? 'Good standing' : 'Needs attention'}
        />
        <StatCard
          title="Teacher"
          value={teacher?.userName ?? 'Unassigned'}
          gradient="from-purple-500 to-fuchsia-600"
          icon={<UserCheck className="w-5 h-5 text-foreground" />}
          colorText="text-purple-100"
          subtitle={teacher?.subject ?? '—'}
        />
      </div>

      {/* Class Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white text-base">Class Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Class Name</p>
            <p className="font-medium text-foreground">{cls.className}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Teacher</p>
            <p className="font-medium text-foreground">{teacher?.userName ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Subject</p>
            <p className="font-medium text-foreground">{teacher?.subject ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Student Roster */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-base">Student Roster</CardTitle>
            <CardDescription className="text-muted-foreground">
              {students.length} students enrolled
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-slate-700 w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-16">Roll</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map(student => (
                    <TableRow
                      key={student.id}
                      className="border-border/50 hover:bg-muted/30"
                    >
                      <TableCell className="text-slate-300 font-medium">
                        {student.rollNo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={student.profilePictureUrl} alt={student.userName} />
                            <AvatarFallback className="bg-purple-900/50 text-purple-200 text-xs">
                              {getInitials(student.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{student.userName}</p>
                            <p className="text-xs text-muted-foreground truncate sm:hidden">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                        {student.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                        {student.phone ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingStudent(student)}
                          className="gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit student modal */}
      <TeacherEditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={handleStudentUpdated}
      />
    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClassById, getTeacherById, getAllTeachers } from '@/firebase/teachersUtils';
import { getStudentsInClass } from '@/firebase/studentUtils';
import { updateClass } from '@/firebase/adminUtils';
import { Class, Student, Teacher } from '@/firebase/interfaces/user.interface';
import { getAllAttendance } from '@/firebase/AttendanceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlobalLoader from '@/components/ui/global-loader';
import StatCard from '@/components/shared/StatCard';
import { Users, User, Calendar, BookOpen, Search, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddUserModal, { Field } from '@/components/modals/addUserModal';
import { AddStudentModal } from '@/features/dashboard/admin/students/AddStudentModal';
import { successToast } from '@/lib/utils';


export default function AdminClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cls, setCls] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [avgAttendance, setAvgAttendance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditClass, setShowEditClass] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [c, teachers] = await Promise.all([getClassById(id), getAllTeachers()]);
        setCls(c);
        setAllTeachers(teachers);

        let fetchedTeacher: Teacher | null = null;
        if (c?.teacherId) {
          fetchedTeacher = await getTeacherById(c.teacherId);
          setTeacher(fetchedTeacher);
        }

        const [studs, allAttendance] = await Promise.all([
          getStudentsInClass(id),
          getAllAttendance(),
        ]);
        setStudents(studs);

        const classAttendance = allAttendance.filter(a => a.classId === id);
        const present = classAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const total = classAttendance.length;
        setAvgAttendance(total > 0 ? Math.round((present / total) * 100) : 100);
      } catch (err) {
        console.error('Failed to load class data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStudentAdded = async (studentId: string) => {
    if (!id || !cls) return;
    await updateClass(id, { students: [...(cls.students || []), studentId] });
    const updatedStudents = await getStudentsInClass(id);
    setStudents(updatedStudents);
    setCls(prev => prev ? { ...prev, students: [...(prev.students || []), studentId] } : prev);
    successToast('Student added successfully!');
  };

  const handleEditClass = async (values: Record<string, string>) => {
    if (!id) return;
    await updateClass(id, { className: values.className, teacherId: values.teacherId });
    const [updatedClass, teachers] = await Promise.all([getClassById(id), getAllTeachers()]);
    setCls(updatedClass);
    setAllTeachers(teachers);
    if (updatedClass?.teacherId) {
      const updatedTeacher = await getTeacherById(updatedClass.teacherId);
      setTeacher(updatedTeacher);
    }
    successToast('Class updated successfully!');
  };

  if (loading) return <GlobalLoader show={true} />;
  if (!cls) return <div className="p-6 text-center text-muted-foreground">Class not found.</div>;

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (
      (s.userName || '').toLowerCase().includes(lowerQ) ||
      (s.email || '').toLowerCase().includes(lowerQ) ||
      String(s.rollNo || '').includes(lowerQ)
    );
  });

  const getInitials = (name?: string) => (name ? name.substring(0, 2).toUpperCase() : 'ST');

  const editClassFields: Field[] = [
    { name: 'className', label: 'Class Name', type: 'text', placeholder: 'e.g. Grade 10-A', required: true },
    {
      name: 'teacherId',
      label: 'Assigned Teacher',
      type: 'select',
      required: true,
      options: allTeachers.map(t => ({ label: t.userName, value: t.id })),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/classes')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
              <span className="truncate">{cls.className}</span>
              <Badge variant="secondary" className="text-xs bg-muted shrink-0">
                {cls.id}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Academic Year 2025–26</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Button variant="outline" onClick={() => setShowEditClass(true)}>
            Edit Class
          </Button>
          <Button onClick={() => setShowAddStudent(true)}>Add Student</Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={students.length}
          icon={<Users className="w-5 h-5 text-white" />}
          subtitle="Current Roster"
          gradient="from-blue-500 to-indigo-600"
          colorText="text-blue-100"
        />
        <StatCard
          title="Avg. Attendance"
          value={`${avgAttendance}%`}
          icon={<Calendar className="w-5 h-5 text-white" />}
          subtitle={avgAttendance >= 85 ? 'Good Standing' : 'Needs Attention'}
          gradient="from-green-500 to-emerald-600"
          colorText="text-green-100"
        />
        <StatCard
          title="Assigned Teacher"
          value={teacher ? teacher.userName : 'Unassigned'}
          icon={<User className="w-5 h-5 text-white" />}
          subtitle={teacher ? 'Primary' : 'Action Required'}
          gradient="from-purple-500 to-fuchsia-600"
          colorText="text-purple-100"
        />
        <StatCard
          title="Subjects"
          value={1}
          icon={<BookOpen className="w-5 h-5 text-white" />}
          subtitle="Core Curriculum"
          gradient="from-amber-500 to-orange-600"
          colorText="text-amber-100"
        />
      </div>

      {/* Class Details & Roster */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Class Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Class Name</div>
                <div className="font-medium text-foreground">{cls.className}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Teacher</div>
                {teacher ? (
                  <div
                    className="flex items-center gap-3 mt-2 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                  >
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarFallback>{getInitials(teacher.userName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{teacher.userName}</div>
                      <div className="text-xs text-muted-foreground truncate">{teacher.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-yellow-500 font-medium bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    No teacher assigned
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Schedule</div>
                <div className="font-medium text-foreground">Mon – Fri, 8:00 AM – 2:00 PM</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Student Roster */}
        <div className="xl:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg text-foreground">Student Roster</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {students.length} students enrolled in {cls.className}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50 border-border w-full"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-16">Roll No</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden sm:table-cell">Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <TableRow
                          key={student.id}
                          className="border-border/50 hover:bg-muted/30"
                        >
                          <TableCell className="font-medium text-foreground/80">
                            {student.rollNo}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="bg-purple-900/50 text-purple-200 text-xs">
                                  {getInitials(student.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {student.userName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate sm:hidden">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                            {student.email}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-400 border-green-500/20"
                            >
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-card border-border"
                              >
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/admin/students/${student.id}`)}
                                >
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>View Attendance</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem className="text-red-400">
                                  Remove from Class
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        open={showAddStudent}
        onOpenChange={setShowAddStudent}
        classId={id ?? ''}
        className={cls.className}
        onSuccess={handleStudentAdded}
      />

      {/* Edit Class Modal */}
      <AddUserModal
        title="Edit Class"
        description="Update the class name or assigned teacher."
        fields={editClassFields}
        initialValues={{ className: cls.className, teacherId: cls.teacherId || '' }}
        open={showEditClass}
        onOpenChange={setShowEditClass}
        onSubmit={handleEditClass}
        submitLabel="Save Changes"
      />
    </div>
  );
}

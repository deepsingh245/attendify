import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClassById, getTeacherById } from '@/firebase/teachersUtils';
import { getStudentsInClass } from '@/firebase/studentUtils';
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

export default function AdminClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [cls, setCls] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [avgAttendance, setAvgAttendance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const c = await getClassById(id);
        setCls(c);
        
        let fetchedTeacher: Teacher | null = null;
        if (c?.teacherId) {
          fetchedTeacher = await getTeacherById(c.teacherId);
          setTeacher(fetchedTeacher);
        }
        
        const [studs, allAttendance] = await Promise.all([
          getStudentsInClass(id),
          getAllAttendance()
        ]);
        
        setStudents(studs);
        
        // Calculate attendance
        const classAttendance = allAttendance.filter(a => a.classId === id);
        const present = classAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const total = classAttendance.length;
        setAvgAttendance(total > 0 ? Math.round((present / total) * 100) : 100);
        
      } catch (err) {
        console.error("Failed to load class data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <GlobalLoader show={true} />;
  if (!cls) return <div className="p-6 text-center text-slate-400">Class not found.</div>;

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (s.userName || '').toLowerCase().includes(lowerQ) || 
           (s.email || '').toLowerCase().includes(lowerQ) || 
           String(s.rollNo || '').toLowerCase().includes(lowerQ);
  });

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/classes')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {cls.className}
              <Badge variant="secondary" className="text-xs bg-slate-800">
                {cls.id}
              </Badge>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Academic Year 2025–26
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit Class</Button>
          <Button>Add Student</Button>
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
          subtitle={avgAttendance >= 85 ? "Good Standing" : "Needs Attention"}
          gradient="from-green-500 to-emerald-600"
          colorText="text-green-100"
        />
        <StatCard 
          title="Assigned Teacher" 
          value={teacher ? teacher.userName : "Unassigned"} 
          icon={<User className="w-5 h-5 text-white" />} 
          subtitle={teacher ? "Primary" : "Action Required"}
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
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Class Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-slate-400 mb-1">Class Name</div>
                <div className="font-medium text-white">{cls.className}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Teacher</div>
                {teacher ? (
                  <div 
                    className="flex items-center gap-3 mt-2 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                    onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                  >
                    <Avatar className="w-10 h-10 border border-slate-700">
                      <AvatarFallback>{getInitials(teacher.userName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">{teacher.userName}</div>
                      <div className="text-xs text-slate-400">{teacher.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-yellow-500 font-medium bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    No teacher assigned
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Room Assignment</div>
                <div className="font-medium text-white">Room {Math.floor(Math.random() * 20) + 1}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Schedule</div>
                <div className="font-medium text-white">Mon - Fri, 8:00 AM - 2:00 PM</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Student List */}
        <div className="xl:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">Student Roster</CardTitle>
                <CardDescription className="text-slate-400">
                  {students.length} students enrolled in {cls.className}
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-slate-700"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-800/50">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="w-16">Roll No</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} className="border-slate-800/50 hover:bg-slate-800/30">
                          <TableCell className="font-medium text-slate-300">
                            {student.rollNo}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-purple-900/50 text-purple-200 text-xs">
                                  {getInitials(student.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium text-white">{student.userName}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-400">
                            {student.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
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
                              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigate(`/admin/students/${student.id}`)}>
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>View Attendance</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem className="text-red-400">Remove from Class</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-400">
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
    </div>
  );
}

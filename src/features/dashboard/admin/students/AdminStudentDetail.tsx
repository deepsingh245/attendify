import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { getStudentById } from '@/firebase/studentUtils';
import { getAllAttendanceForStudent } from '@/firebase/AttendanceUtils';
import { Student, AttendanceRecord } from '@/firebase/interfaces/user.interface';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import GenericTable from '@/components/shared/GenericTable';
import { ChartBar } from '@/components/charts/BarChart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Hash, School, Calendar, CheckCircle, XCircle, ArrowLeft, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlobalLoader from '@/components/ui/global-loader';
import StatCard from '@/components/shared/StatCard';
import { EditStudentModal } from './EditStudentModal';

export default function AdminStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('Jan');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const [studentData, attendanceData] = await Promise.all([
          getStudentById(id),
          getAllAttendanceForStudent(id),
        ]);
        setStudent(studentData);
        setAttendance(attendanceData || []);
        
        // Default select current month
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        setSelectedMonth(currentMonth);
      } catch (err) {
        console.error('Failed to load student data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [id]);

  const year = new Date().getFullYear();
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(year, i).toLocaleString('default', { month: 'short' }),
      present: 0,
      total: 0,
    }));

    attendance.forEach((record) => {
      const date = new Date(record.date);
      if (date.getFullYear() !== year) return;
      const monthIndex = date.getMonth();
      months[monthIndex].total += 1;
      if (record.status === 'Present' || record.status === 'Late') months[monthIndex].present += 1;
    });

    return months.map((m) => ({
      month: m.month,
      value: m.total ? Math.round((m.present / m.total) * 100) : 0,
      present: m.present,
      total: m.total,
    }));
  }, [attendance, year]);

  const attendanceColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (r: AttendanceRecord) => {
        const d = new Date(Number(r.date) || r.date);
        return `${d.getDate()} (${d.toLocaleString('default', { weekday: 'short' })})`;
      }
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (r: AttendanceRecord) => (
        <Badge 
          variant="outline" 
          className={
            r.status === 'Present' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
            r.status === 'Late' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
            'bg-red-500/10 text-red-400 border-red-500/20'
          }
        >
          {r.status}
        </Badge>
      )
    },
  ];

  if (loading) return <GlobalLoader show={true} />;
  if (!student) return <div className="p-6 text-center text-slate-400">Student not found.</div>;

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const avgAttendance = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  
  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name.substring(0, 2).toUpperCase();
  };

  const filteredAttendance = attendance.filter((r) => {
    try {
      const d = new Date(r.date);
      return d.toLocaleString('default', { month: 'short' }) === selectedMonth;
    } catch {
      return false;
    }
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/students')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Student Profile
              <Badge variant="secondary" className="text-xs bg-slate-800">
                {student.id}
              </Badge>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Academic Year 2025–26
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditStudentModal
            student={student}
            onSuccess={(updatedStudent) => setStudent(updatedStudent)}
          >
            <Button variant="outline">Edit Student</Button>
          </EditStudentModal>
          <Button variant={student.isActive ? "destructive" : "default"}>
            {student.isActive ? "Suspend" : "Activate"}
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Overall Attendance" 
          value={`${avgAttendance}%`} 
          icon={<BarChart2 className="w-5 h-5 text-white" />} 
          subtitle={avgAttendance >= 85 ? "Excellent Standing" : "Needs Improvement"}
          gradient="from-blue-500 to-indigo-600"
          colorText="text-blue-100"
        />
        <StatCard 
          title="Classes Attended" 
          value={presentClasses} 
          icon={<CheckCircle className="w-5 h-5 text-white" />} 
          subtitle={`Out of ${totalClasses} total classes`}
          gradient="from-green-500 to-emerald-600"
          colorText="text-green-100"
        />
        <StatCard 
          title="Roll Number" 
          value={String(student.rollNo).padStart(2, '0')} 
          icon={<Hash className="w-5 h-5 text-white" />} 
          subtitle="Registered Student"
          gradient="from-purple-500 to-fuchsia-600"
          colorText="text-purple-100"
        />
        <StatCard 
          title="Status" 
          value={student.isActive ? "Active" : "Suspended"} 
          icon={student.isActive ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />} 
          subtitle={student.isActive ? "Enrolled & Active" : "Action Required"}
          gradient={student.isActive ? "from-amber-500 to-orange-600" : "from-red-500 to-rose-600"}
          colorText={student.isActive ? "text-amber-100" : "text-red-100"}
        />
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Details */}
        <Card className="flex-shrink-0 w-full sm:w-80 bg-slate-900/50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 text-3xl mb-4 border-4 border-slate-700">
                <AvatarImage src={student.profilePictureUrl} alt={student.userName} />
                <AvatarFallback>{getInitials(student.userName)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white">{student.userName}</h2>
            </div>

            <div className="space-y-4 mt-6 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 truncate" title={student.email}>{student.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{student.rollNo}</span>
              </div>
              <div className="flex items-center gap-3">
                <School className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{student.classId || "Not Assigned"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">
                  Joined {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Unknown"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Charts and Tables */}
        <div className="flex-1 space-y-6">
          <ChartBar
            title={`Attendance Overview (${year})`}
            description="Monthly attendance performance. Click a bar to view records."
            chartData={monthlyData.map((m) => ({ month: m.month, desktop: m.value }))}
            onBarClick={(month) => setSelectedMonth(month)}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedMonth} Records</CardTitle>
                <CardDescription>
                  Detailed daily attendance logs
                </CardDescription>
              </div>
              <Badge variant="outline">
                {filteredAttendance.length} records
              </Badge>
            </CardHeader>
            <CardContent>
              {filteredAttendance.length > 0 ? (
                <div className="overflow-hidden">
                  <GenericTable
                    columns={attendanceColumns}
                    data={filteredAttendance}
                    pageSize={10}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                  <Calendar className="w-10 h-10 mb-3 opacity-20" />
                  <p>No attendance records for {selectedMonth}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

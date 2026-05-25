import { useEffect, useState } from 'react';
import { getStudentById } from '@/firebase/studentUtils';
import { getAllAttendanceForStudent } from '@/firebase/AttendanceUtils';
import { getClassById, getTeacherById } from '@/firebase/teachersUtils';
import { Student, Class, Teacher, AttendanceRecord } from '@/firebase/interfaces/user.interface';
import { getCachedUser } from '@/lib/utils';
import StatCard from '@/components/shared/StatCard';
import GlobalLoader from '@/components/ui/global-loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PercentIcon, BookOpen, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Present: 'bg-green-500/10 text-green-400 border-green-500/20',
  Late: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Absent: 'bg-red-500/10 text-red-400 border-red-500/20',
  Leave: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function StudentOverview() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [cls, setCls] = useState<Class | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const init = async () => {
      const cached = getCachedUser();
      if (!cached?.id) return;
      setLoading(true);
      try {
        const [stud, recs] = await Promise.all([
          getStudentById(cached.id),
          getAllAttendanceForStudent(cached.id),
        ]);
        setStudent(stud);
        setAttendance(recs);
        if (stud?.classId) {
          const classData = await getClassById(stud.classId);
          setCls(classData);
          if (classData?.teacherId) {
            const teacherData = await getTeacherById(classData.teacherId);
            setTeacher(teacherData);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <GlobalLoader show />;

  const total = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentCount = attendance.filter(r => r.status === 'Absent').length;
  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

  const recent = [...attendance]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {student?.userName?.split(' ')[0] ?? 'Student'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your attendance summary</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={<PercentIcon className="w-5 h-5 text-white" />}
          subtitle={attendanceRate >= 85 ? 'Good Standing' : 'Needs Improvement'}
          gradient="from-blue-500 to-indigo-600"
          colorText="text-blue-100"
        />
        <StatCard
          title="Classes Enrolled"
          value={student?.classes?.length ?? 1}
          icon={<BookOpen className="w-5 h-5 text-white" />}
          subtitle="Active enrolments"
          gradient="from-purple-500 to-fuchsia-600"
          colorText="text-purple-100"
        />
        <StatCard
          title="Days Present"
          value={presentCount}
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          subtitle={`Out of ${total} sessions`}
          gradient="from-green-500 to-emerald-600"
          colorText="text-green-100"
        />
        <StatCard
          title="Days Absent"
          value={absentCount}
          icon={<XCircle className="w-5 h-5 text-white" />}
          subtitle={absentCount === 0 ? 'Perfect record!' : 'Sessions missed'}
          gradient="from-rose-500 to-red-600"
          colorText="text-rose-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((r, i) => {
                  const d = new Date(r.date);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <li key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-sm text-foreground/80">
                        <span className="font-medium">{dayName}</span>
                        <span className="text-muted-foreground ml-2">{dateStr}</span>
                      </span>
                      <Badge variant="outline" className={`text-xs ${STATUS_COLORS[r.status] ?? ''}`}>
                        {r.status}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              My Class
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cls ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Class</p>
                  <p className="font-semibold text-foreground">{cls.className}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Roll Number</p>
                  <p className="font-semibold text-foreground">{student?.rollNo ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Teacher</p>
                  <p className="font-semibold text-foreground">{teacher?.userName ?? 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Class Size</p>
                  <p className="font-semibold text-foreground">{cls.students?.length ?? 0} students</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No class assigned yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

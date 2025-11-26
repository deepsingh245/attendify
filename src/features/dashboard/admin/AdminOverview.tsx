import { Card } from '@/components/ui/card';
import { getAllClasses } from '@/firebase/adminUtils';
import { Class, Student, Teacher } from '@/firebase/interfaces/user.interface';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTeachers } from '@/firebase/teachersUtils';
import { getAllStudents } from '@/firebase/studentUtils';
import { Users, BookOpen, UserCheck } from 'lucide-react';
import { getAllAttendance } from '@/firebase/AttendanceUtils';
import { AttendanceRecord } from '@/firebase/interfaces/user.interface';
import { ChartBar } from '@/components/charts/BarChart';
import GlobalLoader from '@/components/ui/global-loader';
// import { ChartBar } from '@/components/charts/BarChart';
import { ChartArea } from '@/components/charts/AreaChart';

const AdminOverview = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const getAllData = async () => {
    const classes = await getAllClasses();
    const teachers = await getAllTeachers();
    const students = await getAllStudents();
    const attendance = await getAllAttendance();
    return { classes, teachers, students, attendance };
  };


  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const { classes: cls, teachers: t, students: s, attendance } = await getAllData();
      setClasses(cls);
      setTeachers(t);
      setStudents(s);
      setLoading(false);

      // compute charts data and set local vars (we'll compute on render from attendance)
      setAttendanceRecords(attendance || []);
    };
    fetchData();
  }, []);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const cards = [
    {
      title: 'Total Classes',
      value: classes.length,
      icon: BookOpen,
      route: '/admin/classes',
    },
    {
      title: 'Total Students',
      value: students.length,
      icon: Users,
      route: '/admin/students',
    },
    {
      title: 'Total Teachers',
      value: teachers.length,
      icon: UserCheck,
      route: '/admin/teachers',
    },
  ]

  // derive monthly attendance percentage from attendanceRecords
  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }).map((_, i) => new Date(year, i).toLocaleString('default', { month: 'short' }));

  const parseAttendanceDate = (raw: unknown): Date | null => {
    if (!raw) return null;
    if (typeof raw === 'number') return new Date(raw);
    // try native parse
  const d = new Date(String(raw));
    if (!isNaN(d.getTime())) return d;
    // fallback parse for formats like DD-MM-YY or DD-MM-YY HH:MM
    const first = String(raw).split(' ')[0];
    const parts = first.split('-');
    if (parts.length === 3) {
      const [dd, mm, yy] = parts;
      const fullYear = yy.length === 2 ? '20' + yy : yy;
      const parsed = new Date(Number(fullYear), Number(mm) - 1, Number(dd));
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  };

  const monthlyCounts = months.map(() => ({ present: 0, total: 0 }));
  for (const rec of attendanceRecords) {
    const d = parseAttendanceDate((rec as AttendanceRecord).date);
    if (!d) continue;
    const mi = d.getMonth();
    monthlyCounts[mi].total += 1;
    if (rec.status === 'Present') monthlyCounts[mi].present += 1;
  }

  // const monthlyData = months.map((m, i) => ({
  //   month: m,
  //   desktop: monthlyCounts[i].total ? Math.round((monthlyCounts[i].present / monthlyCounts[i].total) * 100) : 0,
  // }));

  // class-wise overall attendance percent
  const classData = classes.map((c) => {
    const recs = attendanceRecords.filter((r) => (r as AttendanceRecord).classId === c.id);
    const total = recs.length;
    const present = recs.filter((r) => r.status === 'Present').length;
    const pct = total ? Math.round((present / total) * 100) : 0;
    return { month: c.className, desktop: pct };
  });

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <GlobalLoader show={loading} message="Loading data..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => navigate(card.route)}
              className="text-left transition hover:scale-105"
            >
              <Card className="w-full h-full p-6 bg-gradient-to-br hover:shadow-lg transition">
                <div className="flex justify-between gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>

                  {/* Value and Title */}
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-3xl font-bold text-slate-200">{card.value}</p>
                    <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="mt-4 sm:mt-6">
        <h2 className="text-base sm:text-lg font-medium mb-2">Attendance Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
          <ChartBar chartData={classData} />
          <ChartArea chartData={classData} />
        </div>
      </div>
    </div>
  )
};

export default AdminOverview;

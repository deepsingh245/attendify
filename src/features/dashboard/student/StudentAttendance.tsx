import { useEffect, useState } from 'react';
import { getStudentById } from '@/firebase/studentUtils';
import { getAllAttendanceForStudent } from '@/firebase/AttendanceUtils';
import { AttendanceRecord } from '@/firebase/interfaces/user.interface';
import { getCachedUser } from '@/lib/utils';
import GlobalLoader from '@/components/ui/global-loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartBar } from '@/components/charts/BarChart';
import { CheckCircle2, XCircle, Clock, CalendarOff } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Present: 'bg-green-500/10 text-green-400 border-green-500/20',
  Late: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Absent: 'bg-red-500/10 text-red-400 border-red-500/20',
  Leave: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function StudentAttendance() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [studentName, setStudentName] = useState('');

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
        setStudentName(stud?.userName ?? '');
        setAttendance(recs);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <GlobalLoader show />;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonth = attendance.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const countByStatus = (recs: AttendanceRecord[], status: string) =>
    recs.filter(r => r.status === status).length;

  // Build last-6-months chart data
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - 5 + i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthRecs = attendance.filter(r => {
      const rd = new Date(r.date);
      return rd.getMonth() === m && rd.getFullYear() === y;
    });
    const present = monthRecs.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const rate = monthRecs.length > 0 ? Math.round((present / monthRecs.length) * 100) : 0;
    return { month: MONTH_NAMES[m], desktop: rate };
  });

  // Days in current month sorted descending
  const currentMonthDays = [...thisMonth].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">{studentName} — {MONTH_NAMES[currentMonth]} {currentYear}</p>
      </div>

      {/* This month stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present', status: 'Present', icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, color: 'border-green-500/20 bg-green-500/5' },
          { label: 'Late', status: 'Late', icon: <Clock className="w-5 h-5 text-amber-400" />, color: 'border-amber-500/20 bg-amber-500/5' },
          { label: 'Absent', status: 'Absent', icon: <XCircle className="w-5 h-5 text-red-400" />, color: 'border-red-500/20 bg-red-500/5' },
          { label: 'Leave', status: 'Leave', icon: <CalendarOff className="w-5 h-5 text-slate-400" />, color: 'border-slate-500/20 bg-slate-500/5' },
        ].map(({ label, status, icon, color }) => (
          <Card key={status} className={`border ${color}`}>
            <CardContent className="p-4 flex items-center gap-3">
              {icon}
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">{countByStatus(thisMonth, status)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 6-month chart */}
      <ChartBar
        chartData={chartData}
        title="Monthly Attendance Rate"
        description="Attendance % over the last 6 months"
        xKey="month"
        yKey="desktop"
      />

      {/* Day-by-day list for current month */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">
            {MONTH_NAMES[currentMonth]} {currentYear} — Day by Day
          </CardTitle>
          <CardDescription>{thisMonth.length} sessions recorded this month</CardDescription>
        </CardHeader>
        <CardContent>
          {currentMonthDays.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records for this month yet.</p>
          ) : (
            <ul className="space-y-1">
              {currentMonthDays.map((r, i) => {
                const d = new Date(r.date);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <li key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-foreground/80">
                      <span className="font-medium w-24 inline-block">{dayName}</span>
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
    </div>
  );
}

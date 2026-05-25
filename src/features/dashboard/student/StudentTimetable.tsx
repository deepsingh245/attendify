import { useEffect, useState } from 'react';
import { getStudentById } from '@/firebase/studentUtils';
import { getClassById, getTeacherById } from '@/firebase/teachersUtils';
import { Class, Teacher } from '@/firebase/interfaces/user.interface';
import { getCachedUser } from '@/lib/utils';
import GlobalLoader from '@/components/ui/global-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Info } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_START = '8:00 AM';
const TIME_END = '2:00 PM';

export default function StudentTimetable() {
  const [loading, setLoading] = useState(true);
  const [cls, setCls] = useState<Class | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    const init = async () => {
      const cached = getCachedUser();
      if (!cached?.id) return;
      setLoading(true);
      try {
        const stud = await getStudentById(cached.id);
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
        <p className="text-sm text-muted-foreground mt-1">Your weekly class schedule</p>
      </div>

      {cls ? (
        <>
          {/* Info banner */}
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Schedule is managed by your teacher. Contact <strong>{teacher?.userName ?? 'your teacher'}</strong> for any changes.</span>
          </div>

          {/* Weekly schedule card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Weekly Schedule — {cls.className}
              </CardTitle>
              <CardDescription>
                {TIME_START} – {TIME_END} &nbsp;·&nbsp; Teacher: {teacher?.userName ?? 'Not assigned'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/40 border border-border hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-28 shrink-0 font-medium text-foreground">{day}</span>
                      <span className="text-sm text-muted-foreground">{cls.className}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{TIME_START} – {TIME_END}</span>
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Teacher info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Teacher</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                {teacher?.userName?.charAt(0).toUpperCase() ?? 'T'}
              </div>
              <div>
                <p className="font-semibold text-foreground">{teacher?.userName ?? 'Not assigned'}</p>
                <p className="text-xs text-muted-foreground">{teacher?.email ?? ''}</p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            You are not assigned to any class yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

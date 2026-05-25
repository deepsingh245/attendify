import { useEffect, useState } from 'react';
import { getStudentById } from '@/firebase/studentUtils';
import { getAllAttendanceForStudent } from '@/firebase/AttendanceUtils';
import { getClassById, getTeacherById } from '@/firebase/teachersUtils';
import { Class, Teacher, AttendanceRecord } from '@/firebase/interfaces/user.interface';
import { getCachedUser } from '@/lib/utils';
import GlobalLoader from '@/components/ui/global-loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, User, PercentIcon } from 'lucide-react';

type ClassCard = {
  cls: Class;
  teacher: Teacher | null;
  attendanceRate: number;
  totalSessions: number;
};

function AttendanceRing({ rate }: { rate: number }) {
  const color = rate >= 85 ? 'text-green-400 border-green-400/40' : rate >= 75 ? 'text-amber-400 border-amber-400/40' : 'text-red-400 border-red-400/40';
  return (
    <div className={`w-14 h-14 rounded-full border-4 ${color} flex items-center justify-center shrink-0`}>
      <span className="text-xs font-bold">{rate}%</span>
    </div>
  );
}

export default function StudentClasses() {
  const [loading, setLoading] = useState(true);
  const [classCards, setClassCards] = useState<ClassCard[]>([]);

  useEffect(() => {
    const init = async () => {
      const cached = getCachedUser();
      if (!cached?.id) return;
      setLoading(true);
      try {
        const [stud, allRecs] = await Promise.all([
          getStudentById(cached.id),
          getAllAttendanceForStudent(cached.id),
        ]);

        const classIds: string[] = stud?.classes ?? (stud?.classId ? [stud.classId] : []);

        const cards = await Promise.all(
          classIds.map(async (classId) => {
            const cls = await getClassById(classId);
            if (!cls) return null;
            const teacher = cls.teacherId ? await getTeacherById(cls.teacherId) : null;
            const classRecs: AttendanceRecord[] = allRecs.filter((r) => r.classId === classId);
            const present = classRecs.filter(r => r.status === 'Present' || r.status === 'Late').length;
            const rate = classRecs.length > 0 ? Math.round((present / classRecs.length) * 100) : 100;
            return { cls, teacher, attendanceRate: rate, totalSessions: classRecs.length } as ClassCard;
          })
        );

        setClassCards(cards.filter(Boolean) as ClassCard[]);
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
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-sm text-muted-foreground mt-1">{classCards.length} class{classCards.length !== 1 ? 'es' : ''} enrolled</p>
      </div>

      {classCards.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            You are not enrolled in any classes yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {classCards.map(({ cls, teacher, attendanceRate, totalSessions }) => (
            <Card key={cls.id} className="bg-card border-border hover:border-border/80 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base text-foreground truncate">{cls.className}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="text-xs mt-1">{cls.id}</Badge>
                    </CardDescription>
                  </div>
                  <AttendanceRing rate={attendanceRate} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="truncate">{teacher?.userName ?? 'Not assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>{cls.students?.length ?? 0} students in class</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>{totalSessions} sessions recorded</span>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Your attendance</span>
                    <span className="flex items-center gap-1">
                      <PercentIcon className="w-3 h-3" />
                      {attendanceRate}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        attendanceRate >= 85 ? 'bg-green-500' : attendanceRate >= 75 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${attendanceRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { getAllAttendanceForStudent } from '@/firebase/AttendanceUtils';
import { AttendanceRecord } from '@/firebase/interfaces/user.interface';
import { getCachedUser } from '@/lib/utils';
import GlobalLoader from '@/components/ui/global-loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Present: 'bg-green-500/10 text-green-400 border-green-500/20',
  Late: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Absent: 'bg-red-500/10 text-red-400 border-red-500/20',
  Leave: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const PAGE_SIZE = 20;

export default function StudentAttendanceHistory() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const init = async () => {
      const cached = getCachedUser();
      if (!cached?.id) return;
      setLoading(true);
      try {
        const recs = await getAllAttendanceForStudent(cached.id);
        setAttendance(recs.sort((a, b) => b.date.localeCompare(a.date)));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Available month options derived from records
  const monthOptions = useMemo(() => {
    const seen = new Set<string>();
    attendance.forEach(r => {
      const d = new Date(r.date);
      seen.add(`${d.getFullYear()}-${d.getMonth()}`);
    });
    return Array.from(seen)
      .map(s => {
        const [y, m] = s.split('-').map(Number);
        return { key: s, label: `${MONTH_NAMES[m]} ${y}`, year: y, month: m };
      })
      .sort((a, b) => b.year - a.year || b.month - a.month);
  }, [attendance]);

  const filtered = useMemo(() => {
    return attendance.filter(r => {
      const d = new Date(r.date);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthFilter !== 'all' && monthKey !== monthFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [attendance, monthFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const countStatus = (s: string) => filtered.filter(r => r.status === s).length;

  const handleMonthChange = (v: string) => { setMonthFilter(v); setPage(1); };
  const handleStatusChange = (v: string) => { setStatusFilter(v); setPage(1); };

  if (loading) return <GlobalLoader show />;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance History</h1>
        <p className="text-sm text-muted-foreground mt-1">{attendance.length} total records</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={monthFilter}
          onChange={e => handleMonthChange(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All months</option>
          {monthOptions.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All statuses</option>
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
        </select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Records</CardTitle>
          <CardDescription>{filtered.length} records match your filters</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length > 0 ? (
                  paginated.map((r, i) => {
                    const d = new Date(r.date);
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                    const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    return (
                      <TableRow key={i} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="pl-6 font-medium text-foreground">{dateStr}</TableCell>
                        <TableCell className="text-muted-foreground">{dayName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${STATUS_COLORS[r.status] ?? ''}`}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                      No records match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination + summary footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Present: <span className="text-green-400 font-medium">{countStatus('Present')}</span>
              &nbsp;&nbsp;Late: <span className="text-amber-400 font-medium">{countStatus('Late')}</span>
              &nbsp;&nbsp;Absent: <span className="text-red-400 font-medium">{countStatus('Absent')}</span>
              &nbsp;&nbsp;Leave: <span className="text-muted-foreground font-medium">{countStatus('Leave')}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

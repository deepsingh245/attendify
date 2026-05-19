// src/features/dashboard/admin/attendance/ClassAttendanceTable.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export interface ClassAttendanceData {
    name: string;
    teacher: string;
    rate: number;
    trend: number[];
    status: 'Excellent' | 'Good' | 'Watch' | 'Warning' | 'Critical';
}

const statusStyles: Record<ClassAttendanceData['status'], string> = {
    Excellent: "bg-green-500/10 text-green-400 border-green-500/20",
    Good: "bg-green-500/10 text-green-400 border-green-500/20",
    Watch: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TrendSparkline = ({ data }: { data: number[] }) => (
    <div className="h-8 w-24">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.map(val => ({ val }))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(124, 110, 240, 0.5)" />
                        <stop offset="100%" stopColor="rgba(124, 110, 240, 0)" />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="val"
                    stroke="rgba(124, 110, 240, 0.8)"
                    fill="url(#sparkline-gradient)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

interface ClassAttendanceTableProps {
    data: ClassAttendanceData[];
}

export const ClassAttendanceTable: React.FC<ClassAttendanceTableProps> = ({ data }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Class Attendance</CardTitle>
                    <CardDescription>Sorted by attendance rate</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View all</Button>
            </CardHeader>
            <CardContent>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-slate-400 uppercase border-b border-slate-800">
                            <th className="py-3 px-4">Class</th>
                            <th className="py-3 px-4">Teacher</th>
                            <th className="py-3 px-4">Rate</th>
                            <th className="py-3 px-4">Trend</th>
                            <th className="py-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.name} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                <td className="py-3 px-4 font-medium">{row.name}</td>
                                <td className="py-3 px-4 text-slate-300">{row.teacher}</td>
                                <td className="py-3 px-4 font-semibold">{row.rate}%</td>
                                <td className="py-3 px-4"><TrendSparkline data={row.trend} /></td>
                                <td className="py-3 px-4">
                                    <Badge variant="outline" className={cn(statusStyles[row.status])}>
                                        {row.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}

// src/features/dashboard/admin/attendance/MonthlyAttendanceChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartData {
    name: string;
    present: number;
    absent: number;
}

interface MonthlyAttendanceChartProps {
    data: ChartData[];
}

export const MonthlyAttendanceChart: React.FC<MonthlyAttendanceChartProps> = ({ data }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Attendance</CardTitle>
                <CardDescription>Present vs Absent per grade this month</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                contentStyle={{
                                    background: 'rgba(5, 5, 15, 0.9)',
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: '0.5rem',
                                }}
                                labelStyle={{ color: '#ffffff' }}
                            />
                            <Bar dataKey="present" fill="#7c6ef0" name="Present" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="absent" fill="#f87171" name="Absent" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

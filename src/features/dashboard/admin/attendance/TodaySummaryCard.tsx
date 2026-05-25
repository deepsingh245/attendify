// src/features/dashboard/admin/attendance/TodaySummaryCard.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SummaryData {
    name: string;
    value: number;
    color: string;
}

interface TodaySummaryCardProps {
    data: SummaryData[];
    teachersPresent: number;
    totalTeachers: number;
}

export const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({ data, teachersPresent, totalTeachers }) => {
    const presentData = data.find(d => d.name === 'Present') || { value: 0 };
    
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
                <CardDescription>Real-time attendance split</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                    contentStyle={{
                                        background: 'rgba(5, 5, 15, 0.8)',
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    dataKey="value"
                                    stroke="none"
                                    paddingAngle={5}
                                >
                                    {data.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="text-3xl font-bold">
                                {presentData.value.toFixed(1)}%
                            </div>
                            <div className="text-sm text-slate-400">Rate</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        {data.map(item => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-300">{item.name}</span>
                                </div>
                                <div className="font-semibold">{item.value.toFixed(1)}%</div>
                            </div>
                        ))}
                         <div className="border-t border-slate-800 pt-4 mt-2">
                            <div className="text-sm text-slate-400">Teachers Present</div>
                            <div className="text-2xl font-bold mt-1">{teachersPresent} <span className="text-base text-slate-500 font-normal">/ {totalTeachers}</span></div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

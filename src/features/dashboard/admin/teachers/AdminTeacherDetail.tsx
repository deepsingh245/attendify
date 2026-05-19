import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTeacherData } from '@/firebase/teachersUtils';
import { Teacher, Class, Student, AttendanceRecord } from '@/firebase/interfaces/user.interface';
import GlobalLoader from '@/components/ui/global-loader';
import { TeacherProfileCard } from './TeacherProfileCard';
import { PerformanceMetrics } from './PerformanceMetrics';
import { WeeklySchedule } from './WeeklySchedule';
import { RecentActivity } from './RecentActivity';
import StatCard from '@/components/shared/StatCard';
import { BookOpen, Users, BarChart, DollarSign } from 'lucide-react';
import { getAllAttendance } from '@/firebase/AttendanceUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart as ReBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

type TeacherDetailData = {
    teacher: Teacher;
    classes: Class[];
    students: Student[];
    attendance: AttendanceRecord[];
}

export default function AdminTeacherDetail() {
    const { id } = useParams<{ id: string }>();
    const [teacherData, setTeacherData] = useState<TeacherDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [teacherDetails, attendance] = await Promise.all([
                    getTeacherData(id),
                    getAllAttendance() // This could be optimized to fetch only relevant attendance
                ]);
                
                if (teacherDetails.teacher) {
                    setTeacherData({
                        teacher: teacherDetails.teacher,
                        classes: teacherDetails.classes,
                        students: teacherDetails.students,
                        attendance: attendance.filter(a => teacherDetails.classes.some(c => c.id === a.classId))
                    });
                }
            } catch (err) {
                console.error('Failed to load teacher detail data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading || !teacherData) {
        return <GlobalLoader show={true} message="Loading teacher data..." />;
    }

    const { teacher, classes, students, attendance } = teacherData;

    // Calculations for stats
    const totalStudents = students.length;
    const totalClasses = classes.length;
    const avgAttendance = classes.length > 0 ? Math.round(
        classes.reduce((acc, c) => {
            const classAttendance = attendance.filter(a => a.classId === c.id);
            const present = classAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
            return acc + (classAttendance.length > 0 ? (present / classAttendance.length) * 100 : 0);
        }, 0) / classes.length
    ) : 0;
    
    // Placeholder for earnings
    const monthlyEarnings = 4400; 

    // Data for Class Attendance Trend Chart
    const monthlyTrendData = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2025, i).toLocaleString('default', { month: 'short' });
        const monthAttendance = attendance.filter(a => new Date(a.date).getMonth() === i);
        const present = monthAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const total = monthAttendance.length;
        return {
            month,
            attendance: total > 0 ? (present / total) * 100 : 0,
        };
    });


    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Profile */}
                <TeacherProfileCard teacher={teacher} />

                {/* Right Column: Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Students" value={totalStudents} icon={<Users />} trendValue="+4 this term" />
                        <StatCard title="Classes Assigned" value={totalClasses} icon={<BookOpen />} trendValue="same as last term" />
                        <StatCard title="Class Avg. Attendance" value={`${avgAttendance}%`} icon={<BarChart />} trendValue="+2% vs last month" />
                        <StatCard title="Monthly Earnings" value={`$${monthlyEarnings.toLocaleString()}`} icon={<DollarSign />} trendValue="+$230 vs last month" />
                    </div>
                    
                    {/* Middle Row Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Class Attendance Trend</CardTitle>
                                <CardDescription>Monthly avg. across assigned classes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-60">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ReBarChart data={monthlyTrendData}>
                                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                            <Tooltip cursor={{ fill: 'rgba(124, 110, 240, 0.1)'}} contentStyle={{ background: 'rgba(5, 5, 15, 0.9)', borderColor: 'rgba(255,255,255,0.2)' }}/>
                                            <Bar dataKey="attendance" fill="#7c6ef0" radius={[4, 4, 0, 0]} />
                                        </ReBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <PerformanceMetrics />
                    </div>

                    {/* Bottom Row Info */}
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Assigned Classes</CardTitle>
                                <CardDescription>Current term</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Implement a table or list for assigned classes */}
                            </CardContent>
                        </Card>
                        <WeeklySchedule />
                    </div>

                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}

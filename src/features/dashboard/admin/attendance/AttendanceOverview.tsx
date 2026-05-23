// src/features/dashboard/admin/attendance/AttendanceOverview.tsx
import { useEffect, useState } from "react";
import { BookOpen, CalendarCheck, Clock, Download, Plus, Users, AlertTriangle, MessageSquareWarning } from "lucide-react";
import { AttendanceStatCard } from "./AttendanceStatCard";
import { TodaySummaryCard } from "./TodaySummaryCard";
import { ClassAttendanceTable, ClassAttendanceData } from "./ClassAttendanceTable";
import { AlertsAndFlags, AlertItem } from "./AlertsAndFlags";
import { Button } from "@/components/ui/button";
import { MonthlyAttendanceChart } from "./MonthlyAttendanceChart";
import GlobalLoader from "@/components/ui/global-loader";

// Firebase
import { getAllClasses } from "@/firebase/adminUtils";
import { getAllStudents } from "@/firebase/studentUtils";
import { getAllTeachers } from "@/firebase/teachersUtils";
import { getAllAttendance } from "@/firebase/AttendanceUtils";
import { Class, Student, Teacher, AttendanceRecord } from "@/firebase/interfaces/user.interface";

const AttendanceOverview = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalStudents: 0,
        totalTeachers: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
    });
    const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
    const [todaySummaryData, setTodaySummaryData] = useState<any[]>([]);
    const [classTableData, setClassTableData] = useState<ClassAttendanceData[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [classes, students, teachers, attendance] = await Promise.all([
                    getAllClasses(),
                    getAllStudents(),
                    getAllTeachers(),
                    getAllAttendance(),
                ]);
                
                processDashboardData(classes, students, teachers, attendance);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const processDashboardData = (
        classes: Class[],
        students: Student[],
        teachers: Teacher[],
        attendance: AttendanceRecord[]
    ) => {
        const today = new Date().toISOString().split('T')[0];

        // Today's attendance records
        const todayAttendance = attendance.filter(rec => rec.date === today);
        const presentToday = todayAttendance.filter(r => r.status === 'Present').length;
        const absentToday = todayAttendance.filter(r => r.status === 'Absent').length;
        const lateToday = todayAttendance.filter(r => r.status === 'Late').length;

        // Set stats
        setStats({
            totalClasses: classes.length,
            totalStudents: students.length,
            totalTeachers: teachers.length,
            presentToday,
            absentToday,
            lateToday,
        });

        // Set Today's Summary Chart Data
        const totalToday = presentToday + absentToday + lateToday;
        setTodaySummaryData([
            { name: 'Present', value: totalToday > 0 ? (presentToday / totalToday) * 100 : 0, color: '#7c6ef0' },
            { name: 'Absent', value: totalToday > 0 ? (absentToday / totalToday) * 100 : 0, color: '#f87171' },
            { name: 'Late', value: totalToday > 0 ? (lateToday / totalToday) * 100 : 0, color: '#fbbf24' },
        ]);

        // Set Monthly Attendance Chart Data
        const monthlyData = classes.map(c => {
            const classAttendance = attendance.filter(a => a.classId === c.id);
            const present = classAttendance.filter(a => a.status === 'Present').length;
            const absent = classAttendance.filter(a => a.status === 'Absent').length;
            const total = present + absent;
            return {
                name: c.className,
                present: total > 0 ? (present / total) * 100 : 0,
                absent: total > 0 ? (absent / total) * 100 : 0,
            };
        });
        setMonthlyChartData(monthlyData);
        
        // Process Class Table Data
        const classTable = classes.map(c => {
             const teacher = teachers.find(t => t.id === c.teacherId);
             const classAttendance = attendance.filter(a => a.classId === c.id);
             const present = classAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
             const total = classAttendance.length;
             const rate = total > 0 ? Math.round((present / total) * 100) : 0;
             
             let status: ClassAttendanceData['status'] = 'Excellent';
             if (rate < 75) status = 'Critical';
             else if (rate < 85) status = 'Warning';
             else if (rate < 95) status = 'Good';

             // Dummy trend data for now
             const trend = Array.from({ length: 7 }, () => Math.random() * (100 - 70) + 70);

             return {
                 name: c.className,
                 teacher: teacher?.userName || 'N/A',
                 rate,
                 trend,
                 status,
             }
        }).sort((a,b) => b.rate - a.rate);
        setClassTableData(classTable);

        // Process Alerts
        const newAlerts: AlertItem[] = [];
        // Example Alert: Low attendance rate
        classTable.forEach(c => {
            if (c.status === 'Warning' || c.status === 'Critical') {
                newAlerts.push({
                    icon: <MessageSquareWarning className="w-4 h-4 text-yellow-400" />,
                    iconBg: 'bg-yellow-500/10',
                    title: `${c.name} — Low Rate`,
                    desc: `Attendance dropped to ${c.rate}%`,
                    time: '1h ago',
                });
            }
        });
        setAlerts(newAlerts);
    };


    return (
        <div className="p-4 sm:p-6 space-y-6">
            <GlobalLoader show={loading} />
            {/* Page Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Attendance Overview</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tracking all {stats.totalStudents} students across {stats.totalClasses} classes · Academic Year 2025–26
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Mark Today
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AttendanceStatCard
                    title="Total Classes"
                    value={stats.totalClasses}
                    icon={<BookOpen className="w-5 h-5 text-purple-400" />}
                    barWidth={100}
                    barColor="bg-purple-500"
                />
                <AttendanceStatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={<Users className="w-5 h-5 text-blue-400" />}
                    barWidth={100}
                    barColor="bg-blue-500"
                />
                <AttendanceStatCard
                    title="Present Today"
                    value={stats.presentToday}
                    icon={<CalendarCheck className="w-5 h-5 text-green-400" />}
                    barWidth={(stats.presentToday / stats.totalStudents) * 100}
                    barColor="bg-green-500"
                />
                <AttendanceStatCard
                    title="Absent Today"
                    value={stats.absentToday}
                    icon={<Clock className="w-5 h-5 text-red-400" />}
                    barWidth={(stats.absentToday / stats.totalStudents) * 100}
                    barColor="bg-red-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
                <div className="lg:col-span-3 h-full">
                   <MonthlyAttendanceChart data={monthlyChartData} />
                </div>
                <div className="lg:col-span-2 h-full">
                    <TodaySummaryCard data={todaySummaryData} teachersPresent={22} totalTeachers={stats.totalTeachers} />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClassAttendanceTable data={classTableData} />
                <AlertsAndFlags alerts={alerts} />
            </div>
        </div>
    );
};

export default AttendanceOverview;

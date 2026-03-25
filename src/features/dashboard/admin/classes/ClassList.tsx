import { useEffect, useState, useMemo } from "react";
import { getAllClasses, addClass } from "@/firebase/adminUtils";
import { Class, Teacher, AttendanceRecord } from "@/firebase/interfaces/user.interface";
import GlobalLoader from "@/components/ui/global-loader";
import { dangerToast, successToast } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClassCard } from "./ClassCard";
import AddClassModal from "./AddClassModal";
import { getAllTeachers } from "@/firebase/teachersUtils";
import { getAllAttendance } from "@/firebase/AttendanceUtils";

const grades = ['All Grades', 'Grade 1', 'Grade 2', 'Grade 4', 'Grade 5', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

type AugmentedClass = Class & {
    teacher: Teacher | null;
    attRate: number;
    status: 'Excellent' | 'Good' | 'Watch' | 'Warning' | 'Critical';
    room: string;
};

export const ClassList: React.FC = () => {
    const [allClasses, setAllClasses] = useState<AugmentedClass[]>([]);
    const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Grades');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [classes, teachers, attendance] = await Promise.all([
                getAllClasses(),
                getAllTeachers(),
                getAllAttendance(),
            ]);
            
            setAllTeachers(teachers);

            const augmentedClasses = classes.map(c => {
                const teacher = teachers.find(t => t.id === c.teacherId) || null;
                const classAttendance = attendance.filter(a => a.classId === c.id);
                const present = classAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
                const total = classAttendance.length;
                const attRate = total > 0 ? Math.round((present / total) * 100) : 100;

                let status: AugmentedClass['status'] = 'Excellent';
                if (attRate < 75) status = 'Critical';
                else if (attRate < 85) status = 'Warning';
                else if (attRate < 95) status = 'Good';
                
                return {
                    ...c,
                    teacher,
                    attRate,
                    status,
                    room: `Room ${Math.floor(Math.random() * 20) + 1}`, // Dummy room data
                }
            });
            setAllClasses(augmentedClasses);
        } catch (error) {
            console.error("Error fetching class data:", error);
            dangerToast("Failed to load class data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const addClassHandler = async (values: { className: string, teacherId: string, room: string }) => {
        setLoading(true);
        try {
            await addClass({
                className: values.className,
                teacherId: values.teacherId,
                students: [], // Initially no students
            });
            successToast('Class added successfully!');
            fetchData(); // Refetch all data
        } catch (error) {
            if (error instanceof Error) {
                dangerToast(`Failed to add class: ${error.message}`);
            } else {
                dangerToast('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const filteredClasses = useMemo(() => {
        let classes = allClasses;

        if (activeFilter !== 'All Grades') {
            classes = classes.filter(c => c.className.startsWith(activeFilter));
        }

        if (searchQuery) {
            classes = classes.filter(c =>
                c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.teacher?.userName || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return classes;
    }, [searchQuery, activeFilter, allClasses]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <GlobalLoader show={loading} />
            {/* Page Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Classes</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {allClasses.length} active classes · {allClasses.reduce((sum, c) => sum + c.students.length, 0)} students enrolled · Academic Year 2025–26
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Class
                    </Button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search classes or teachers..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {grades.map(grade => (
                        <Button 
                            key={grade}
                            variant={activeFilter === grade ? "default" : "secondary"}
                            onClick={() => setActiveFilter(grade)}
                            className="shrink-0"
                        >
                            {grade}
                        </Button>
                    ))}
                </div>
            </div>
            
            {/* Classes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map(classData => (
                    <ClassCard key={classData.id} classData={classData} />
                ))}
            </div>

            <AddClassModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSubmit={addClassHandler}
                teachers={allTeachers}
            />
        </div>
    );
};
export default ClassList;

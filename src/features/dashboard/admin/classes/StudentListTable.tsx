// src/features/dashboard/admin/classes/StudentListTable.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/firebase/interfaces/user.interface";
import { cn } from "@/lib/utils";

export type AugmentedStudent = Student & {
    attRate: number;
    todayStatus: 'Present' | 'Absent' | 'Late' | 'Leave' | 'N/A';
};

interface StudentListTableProps {
    students: AugmentedStudent[];
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const statusStyles = {
    Present: "bg-green-500/10 text-green-400 border-green-500/20",
    Late: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Absent: "bg-red-500/10 text-red-400 border-red-500/20",
    Leave: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    'N/A': "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

export const StudentListTable: React.FC<StudentListTableProps> = ({ students }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-slate-400 uppercase border-b border-slate-800">
                            <th className="py-3 px-4">Roll No.</th>
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4 text-center">Today's Status</th>
                            <th className="py-3 px-4">Overall Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                <td className="py-3 px-4 font-mono text-center">{String(student.rollNo).padStart(2, '0')}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-9 h-9 text-xs">
                                            <AvatarFallback>{getInitials(student.userName)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{student.userName}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-slate-400">{student.email}</td>
                                <td className="py-3 px-4 text-center">
                                    <Badge variant="outline" className={cn(statusStyles[student.todayStatus])}>
                                        {student.todayStatus}
                                    </Badge>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{student.attRate}%</span>
                                        <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                            <div 
                                                className={cn("h-full rounded-full", student.attRate > 90 ? "bg-green-500" : student.attRate > 80 ? "bg-yellow-500" : "bg-red-500")}
                                                style={{width: `${student.attRate}%`}}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}

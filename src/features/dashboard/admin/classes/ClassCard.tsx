// src/features/dashboard/admin/classes/ClassCard.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Class, Teacher } from "@/firebase/interfaces/user.interface";
import { cn } from "@/lib/utils";
import { Users, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AugmentedClass = Class & {
    teacher: Teacher | null;
    attRate: number;
    status: 'Excellent' | 'Good' | 'Watch' | 'Warning' | 'Critical';
    room: string;
}

interface ClassCardProps {
  classData: AugmentedClass;
}

const getInitials = (name: string) => {
    return name.replace('Grade', '').trim().split(' ').map(n => n[0]).join('').toUpperCase();
}

const statusStyles: Record<AugmentedClass['status'], string> = {
    Excellent: "bg-green-500/10 text-green-400 border-green-500/20",
    Good: "bg-green-500/10 text-green-400 border-green-500/20",
    Watch: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Critical: "bg-red-500/10 text-red-400 border-red-500/20",
}

export const ClassCard: React.FC<ClassCardProps> = ({ classData }) => {
  const navigate = useNavigate();
  return (
    <Card className="p-5 flex flex-col gap-4 transition-transform hover:-translate-y-1">
        {/* Card Header */}
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 text-lg bg-purple-600/20 text-purple-300 rounded-lg flex items-center justify-center font-bold">
                    {getInitials(classData.className)}
                </div>
                <div>
                    <h3 className="font-semibold text-base text-white">{classData.className}</h3>
                    <Badge variant="outline" className="text-xs mt-1 bg-slate-800/60 border-slate-700/60">{classData.id}</Badge>
                </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="w-3 h-3"/> {classData.students.length} Students
            </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <div className="text-xs text-slate-400">Assigned Teacher</div>
                <div className="font-medium">{classData.teacher?.userName || 'Unassigned'}</div>
            </div>
             <div>
                <div className="text-xs text-slate-400">Room</div>
                <div className="font-medium">{classData.room}</div>
            </div>
        </div>
        
        {/* Attendance Rate */}
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div className="text-xs text-slate-400">Attendance Rate</div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{classData.attRate}%</span>
                    <Badge variant="outline" className={cn("text-xs", statusStyles[classData.status])}>
                        {classData.status}
                    </Badge>
                </div>
            </div>
            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                    className={cn("h-full rounded-full", classData.attRate > 90 ? "bg-green-500" : classData.attRate > 80 ? "bg-yellow-500" : "bg-red-500")} 
                    style={{width: `${classData.attRate}%`}}
                />
            </div>
        </div>
      
        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
            <Button variant="outline" className="flex-grow" onClick={() => navigate(`/admin/classes/${classData.id}`)}>View Details</Button>
            <Button variant="ghost" size="icon" className="w-10 h-10 ml-2">
                <Edit className="w-4 h-4"/>
            </Button>
        </div>
    </Card>
  );
};

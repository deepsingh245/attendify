// src/features/dashboard/admin/teachers/TeacherProfileCard.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Teacher } from "@/firebase/interfaces/user.interface";
import { Mail, Phone, Building, Calendar, GraduationCap, Briefcase, MessageSquare, BookOpen } from "lucide-react";

interface TeacherProfileCardProps {
  teacher: Teacher;
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({ teacher }) => {
    return (
        <Card className="flex-shrink-0 w-full sm:w-80 bg-slate-900/50">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                    <div className="relative">
                        <Avatar className="w-24 h-24 text-3xl mb-4 border-4 border-slate-700">
                            <AvatarFallback>{getInitials(teacher.userName)}</AvatarFallback>
                        </Avatar>
                        <Badge className="absolute bottom-4 right-0 bg-purple-600">History</Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{teacher.userName}</h2>
                </div>

                <div className="space-y-4 mt-6 text-sm">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400"/>
                        <span className="text-slate-300">{teacher.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400"/>
                        <span className="text-slate-300">{teacher.phone || '+92 300 100 0000'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-slate-400"/>
                        <span className="text-slate-300">{teacher.department || 'Humanities'}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400"/>
                        <span className="text-slate-300">Joined {new Date(teacher.createdAt!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-slate-400"/>
                        <span className="text-slate-300">{teacher.qualification || 'M.A. History, University of Punjab'}</span>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Employment Status</span>
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500"></span>
                           <span className="text-green-400 font-medium">Active</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                    <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2"/> Message
                    </Button>
                    <Button variant="outline" className="w-full">
                        <BookOpen className="w-4 h-4 mr-2"/> Schedule
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

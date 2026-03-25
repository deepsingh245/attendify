// src/features/dashboard/admin/teachers/TeacherCard.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Teacher } from "@/firebase/interfaces/user.interface";
import { cn } from "@/lib/utils";
import { Bookmark, Mail, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TeacherCardProps {
  teacher: Teacher & { attRate: number; experience?: number }; // Make experience optional
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const subjectColors: Record<string, string> = {
    History: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    English: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Mathematics: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Science: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    "Computer Science": "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Geography: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Physical Education": "bg-green-500/10 text-green-400 border-green-500/20",
};

export const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-5 flex flex-col gap-4 transition-transform hover:-translate-y-1">
      {/* Card Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 text-lg">
            <AvatarFallback>{getInitials(teacher.userName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-base text-white">{teacher.userName}</h3>
            <Badge variant="outline" className={cn("text-xs mt-1", subjectColors[teacher.subject] || "bg-slate-500/10 text-slate-400 border-slate-500/20")}>
              {teacher.subject}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8">
            <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 text-sm text-slate-400 border-t border-slate-800/50 pt-4">
        <Mail className="w-4 h-4"/>
        <span>{teacher.email}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center border-t border-b border-slate-800/50 py-4">
          <div>
              <div className="text-xl font-bold">{teacher.classes.length}</div>
              <div className="text-xs text-slate-400">Classes</div>
          </div>
          <div>
              <div className="text-xl font-bold">{teacher.experience || 'N/A'}</div>
              <div className="text-xs text-slate-400">Experience</div>
          </div>
           <div>
              <div className="text-xl font-bold text-green-400">{teacher.attRate}%</div>
              <div className="text-xs text-slate-400">Att. Rate</div>
          </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
          <Button variant="outline" className="flex-grow" onClick={() => navigate(`/admin/teachers/${teacher.id}`)}>View Profile</Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 ml-2">
              <Bookmark className="w-4 h-4"/>
          </Button>
      </div>
    </Card>
  );
};

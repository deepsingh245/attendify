// src/features/dashboard/admin/teachers/WeeklySchedule.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schedule = {
    MON: ["9A", "Free", "11C"],
    TUE: ["Free", "10B", "Free"],
    WED: ["9A", "Free", "11C"],
    THU: ["Free", "10B", "Free"],
    FRI: ["9A", "Free", "11C"],
};

const days = ["MON", "TUE", "WED", "THU", "FRI"];

export const WeeklySchedule = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Current timetable</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-5 gap-2 text-center">
                    {days.map(day => (
                        <div key={day} className="text-xs font-bold text-slate-400">{day}</div>
                    ))}
                    {/* Flatten schedule for grid layout */}
                    {days.flatMap(day => schedule[day as keyof typeof schedule]).map((slot, index) => (
                        <div 
                            key={index}
                            className={`p-3 rounded-md text-sm ${slot !== 'Free' ? 'bg-purple-600/20 text-purple-300 font-semibold' : 'bg-slate-800/40 text-slate-500'}`}
                        >
                            {slot}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// src/features/dashboard/admin/teachers/RecentActivity.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
    { text: "Marked attendance for Grade 6A", time: "Today, 08:32 AM" },
    { text: "Uploaded materials for Grade 6B", time: "Yesterday, 02:45 PM" },
    { text: "Sent a notification to Grade 3A parents", time: "2 days ago, 11:10 AM" },
];

export const RecentActivity = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and events</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"/>
                            <div>
                                <p className="text-sm text-slate-200">{activity.text}</p>
                                <p className="text-xs text-slate-500">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

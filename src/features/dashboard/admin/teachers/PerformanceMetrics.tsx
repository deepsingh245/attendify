// src/features/dashboard/admin/teachers/PerformanceMetrics.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Metric {
    label: string;
    value: number;
    target: number;
}

const metrics: Metric[] = [
    { label: "Class Management", value: 88, target: 100 },
    { label: "Punctuality", value: 95, target: 100 },
    { label: "Lesson Planning", value: 82, target: 100 },
    { label: "Student Feedback", value: 90, target: 100 },
    { label: "Admin Compliance", value: 93, target: 100 },
];

export const PerformanceMetrics = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Admin evaluation scores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {metrics.map(metric => (
                    <div key={metric.label}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-slate-300">{metric.label}</span>
                            <span className="text-sm font-semibold">{metric.value}/{metric.target}</span>
                        </div>
                        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-purple-600 rounded-full"
                                style={{ width: `${(metric.value / metric.target) * 100}%`}}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

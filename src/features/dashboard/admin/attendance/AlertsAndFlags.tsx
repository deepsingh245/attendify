// src/features/dashboard/admin/attendance/AlertsAndFlags.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

export interface AlertItem {
    icon: ReactNode;
    iconBg: string;
    title: string;
    desc: string;
    time: string;
}

interface AlertsAndFlagsProps {
    alerts: AlertItem[];
}

export const AlertsAndFlags: React.FC<AlertsAndFlagsProps> = ({ alerts }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Alerts & Flags</CardTitle>
                    <CardDescription>Students needing attention</CardDescription>
                </div>
                {alerts.length > 0 && <Badge variant="destructive">{alerts.length} new</Badge>}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    {alerts.length > 0 ? alerts.map((alert, index) => (
                        <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer">
                            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${alert.iconBg}`}>
                                {alert.icon}
                            </div>
                            <div className="flex-grow">
                                <div className="font-semibold text-sm">{alert.title}</div>
                                <div className="text-xs text-slate-400">{alert.desc}</div>
                            </div>
                            <div className="text-xs text-slate-500 flex-shrink-0">{alert.time}</div>
                        </div>
                    )) : (
                        <div className="text-center text-slate-500 py-8">
                            No alerts to show.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

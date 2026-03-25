// src/features/dashboard/admin/attendance/AttendanceStatCard.tsx
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

type Trend = 'up' | 'down' | 'neutral';

interface AttendanceStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trendValue?: string | number;
  trend?: Trend;
  barWidth: number; // Percentage from 0 to 100
  barColor: string; // e.g., 'bg-accent' or 'bg-green-500'
}

export const AttendanceStatCard: React.FC<AttendanceStatCardProps> = ({
  title,
  value,
  icon,
  trendValue,
  trend = 'neutral',
  barWidth,
  barColor,
}) => {
  const trendClasses = {
    up: "bg-green-500/10 text-green-500",
    down: "bg-red-500/10 text-red-500",
    neutral: "bg-slate-500/10 text-slate-500",
  };

  return (
    <Card className="p-5 flex flex-col gap-3 relative overflow-hidden transition-transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="p-2.5 bg-slate-800/50 rounded-lg">{icon}</div>
        {trendValue && (
          <div className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md", trendClasses[trend])}>
            {trend === 'up' && <ArrowUp className="w-3 h-3" />}
            {trend === 'down' && <ArrowDown className="w-3 h-3" />}
            <span>{trendValue}{trend !== 'neutral' ? '%' : ''}</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-sm text-slate-400">{title}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-1">
        <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-1000", barColor)}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

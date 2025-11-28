import { Card, CardContent } from "../ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string; // e.g. "from-blue-500 to-indigo-600"
  icon: React.ReactNode;
  colorText?: string; // e.g. "text-white" or "text-gray-200"
}

const StatCard = ({ title, value, subtitle, gradient, icon, colorText }: StatCardProps) => (
  <Card className={`bg-gradient-to-br ${gradient} text-white`}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className={`${colorText} text-sm font-medium`}>{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>

        <div className="bg-white/20 p-3 rounded-lg">{icon}</div>
      </div>

      {subtitle && (
        <p className={`${colorText} text-xs mt-4`}>{subtitle}</p>
      )}
    </CardContent>
  </Card>
);
export default StatCard;
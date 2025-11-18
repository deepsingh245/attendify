// Summary cards for admin dashboard
import { Card, CardHeader } from '@/components/ui/card'

type Stat = { label: string; value: number; color?: string }

export default function AdminSummaryCards({ stats, orgName }: { stats: Stat[]; orgName: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">{orgName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="p-4">
            <CardHeader>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color ?? ''}`}>{s.value}</div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

import { Bar, BarChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart"


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartBar({
  chartData, 
  onBarClick, 
  title = "Attendance Overview", 
  description = "Monthly attendance performance. Click a bar to view records."
}: {
  chartData?: { month: string; desktop: number }[], 
  onBarClick?: (month: string, index: number) => void,
  title?: string,
  description?: string
}) {
  const data = chartData ?? []

  // Compute barSize to keep bars slim: cap at 48px, reduce as more bars appear
  const barSize = 40

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-60">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart 
              accessibilityLayer 
              data={data} 
              margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={16}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(value) => String(value).slice(0, 3)}
              />
              <ChartTooltip
                cursor={{ fill: '#1E293B', opacity: 0.4 }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar 
                dataKey="desktop" 
                fill="#34D399" 
                radius={[4, 4, 4, 4]} 
                barSize={barSize} 
                className="cursor-pointer"
                background={{ fill: '#1E1E24', radius: [4, 4, 4, 4] }}
                onClick={(payload: unknown, index: number) => {
                  const p = payload as { payload?: { month?: string }; month?: string } | undefined
                  const month = p?.payload?.month ?? p?.month
                  if (onBarClick && month) onBarClick(month, index)
                }}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

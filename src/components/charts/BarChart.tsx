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
  description = "Monthly attendance performance. Click a bar to view records.",
  xKey = "month",
  yKey = "desktop",
}: {
  chartData?: Array<Record<string, string | number>>,
  onBarClick?: (xValue: string, index: number) => void,
  title?: string,
  description?: string,
  xKey?: string,
  yKey?: string,
}) {
  const data = chartData ?? []
  const xDataKey = xKey || "month"
  const yDataKey = yKey || "desktop"

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
                dataKey={xDataKey}
                tickLine={false}
                tickMargin={16}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(value) => String(value).slice(0, 8)}
              />
              <ChartTooltip
                cursor={{ fill: '#1E293B', opacity: 0.4 }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar 
                dataKey={yDataKey} 
                fill="#34D399" 
                radius={[4, 4, 4, 4]} 
                barSize={barSize} 
                className="cursor-pointer"
                background={{ fill: '#1E1E24', radius: [4, 4, 4, 4] }}
                onClick={(payload: unknown, index: number) => {
                  const p = payload as { payload?: Record<string, unknown>; [key: string]: unknown } | undefined
                  const xValue = p?.payload?.[xDataKey] as string | undefined ?? (p?.[xDataKey] as string | undefined)
                  if (onBarClick && xValue) onBarClick(xValue, index)
                }}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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

export function ChartBar({chartData, onBarClick}: {chartData?: { month: string; desktop: number }[], onBarClick?: (month: string, index: number) => void}) {
  const data = chartData ?? []

  // Determine a sensible minimum width so bars stay slim and we can scroll horizontally when needed.
  const BAR_BASE_WIDTH = 48 // px per bar base
  const minWidth = Math.max(600, (data.length || 6) * BAR_BASE_WIDTH)
  // Compute barSize to keep bars slim: cap at 48px, reduce as more bars appear
  const barSize = Math.max(8, Math.min(48, Math.floor(BAR_BASE_WIDTH * 0.8)))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>Monthly overview</CardDescription>
      </CardHeader>
      <CardContent>
        {/* horizontal scroll wrapper: inner div provides minWidth to allow scrolling when many bars */}
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth }}>
            <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
              {/* BarChart will be placed inside ResponsiveContainer by ChartContainer */}
              <BarChart accessibilityLayer data={data} barCategoryGap={"20%"} barGap={6}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => String(value).slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="desktop" fill="hsl(var(--primary))" radius={4} barSize={barSize} className="cursor-pointer"
                  // Recharts onClick handler: payload contains row under payload.payload
                  onClick={(payload: unknown, index: number) => {
                    // use a lightweight cast to access Recharts payload fields
                    const p = payload as { payload?: { month?: string }; month?: string } | undefined
                    const month = p?.payload?.month ?? p?.month
                    if (onBarClick && month) onBarClick(month, index)
                  }}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing attendance percentage per month
        </div>
      </CardFooter> */}
    </Card>
  )
}

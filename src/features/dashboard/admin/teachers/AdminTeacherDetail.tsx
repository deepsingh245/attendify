import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { getTeacherData } from '@/firebase/teachersUtils'
import { Teacher, Class, Student } from '@/firebase/interfaces/user.interface'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import GlobalLoader from '@/components/ui/global-loader'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function AdminTeacherDetail(){
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [teacherData, setTeacherData] = useState<{ teacher: Teacher | null; classes: Class[]; students: Student[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let mounted = true
    const fetch = async () => {
      setLoading(true)
      try {
  const d = await getTeacherData(id)
  if (!mounted) return
  // getTeacherData returns raw Firestore DocumentData arrays for students;
  // cast to our expected shape for UI consumption.
  setTeacherData(d as unknown as { teacher: Teacher | null; classes: Class[]; students: Student[] })
      } catch (err) {
        console.error('Failed to load teacher data', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetch()
    return () => { mounted = false }
  }, [id])

  const classesCount = teacherData?.classes?.length ?? 0
  const studentsCount = teacherData?.students?.length ?? 0

  const monthlyChart = useMemo(() => {
    const year = new Date().getFullYear()
    return Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(year, i).toLocaleString('default', { month: 'short' }),
      desktop: Math.round((studentsCount / Math.max(1, 12)) * (0.5 + Math.random())),
    }))
  }, [studentsCount])

  
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

  return (
    <div className="p-6">
      <GlobalLoader show={loading} message="Loading teacher data..." />
      <div className="flex items-start gap-6">
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>${(4179).toLocaleString()}</CardTitle>
                <CardDescription>Earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Monthly earnings
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{studentsCount}</CardTitle>
                <CardDescription>Students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Total assigned
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{classesCount}</CardTitle>
                <CardDescription>Classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Active classes
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Classes Activity</CardTitle>
                <CardDescription>Students activity over months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={monthlyChart}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="desktop"
                      fill="var(--color-desktop)"
                      radius={8}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        <aside className="w-80">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg text-muted-foreground">
                    Teacher Profile
                  </div>
                  <div className="text-lg font-semibold">
                    {teacherData?.teacher?.name ?? "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {teacherData?.teacher?.email ?? ""}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Subjects:</strong>{" "}
                  {teacherData?.teacher?.subject ?? "N/A"}
                </div>
                <div>
                  <strong>Phone:</strong> {teacherData?.teacher?.phone ?? "N/A"}
                </div>
                <div>
                  <strong>Classes Assigned:</strong>{" "}
                  {teacherData?.teacher?.classes.join(',') ?? "N/A"}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate(`/admin/classes`)}>
                View Classes
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}

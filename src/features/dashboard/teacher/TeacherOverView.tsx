
import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Clock, Edit2, Save, X, CheckCircle2 } from 'lucide-react'
import { getTeacherClasses } from '@/firebase/teachersUtils'
import { getStudentsInClass } from '@/firebase/studentUtils'
import { getCachedUser } from '@/lib/utils'
import { getAttendanceForClassOnDate } from '@/firebase/AttendanceUtils'
import { Teacher, Class, AttendanceRecord } from '@/firebase/interfaces/user.interface'
import DropdownButton from '@/components/shared/DropdownButton'
import StatCard from '@/components/shared/StatCard'
import { ChartBar } from '@/components/charts/BarChart'

// Dashboard class shape
type TeacherDashboardClass = {
  id: string
  className: string
  attendance: number
  studentCount: number
  isCompleted: boolean
}

// Timetable slot
type TimeSlot = {
  day: string
  startTime: string
  endTime: string
  classId: string
  className: string
}

// Sample timetable data - moved outside component
const sampleTimetable: TimeSlot[] = [
  { day: 'Monday', startTime: '09:00', endTime: '10:00', classId: 'C101', className: 'Class 10-A' },
  { day: 'Monday', startTime: '10:15', endTime: '11:15', classId: 'C102', className: 'Class 10-B' },
  { day: 'Tuesday', startTime: '09:00', endTime: '10:00', classId: 'C101', className: 'Class 10-A' },
  { day: 'Wednesday', startTime: '09:00', endTime: '10:00', classId: 'C103', className: 'Class 9-A' },
  { day: 'Thursday', startTime: '14:00', endTime: '15:00', classId: 'C102', className: 'Class 10-B' },
  { day: 'Friday', startTime: '09:00', endTime: '10:00', classId: 'C103', className: 'Class 9-A' },
]

// const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TeacherOverView = () => {
  const [classes, setClasses] = useState<TeacherDashboardClass[]>([])
  const [timetable, setTimetable] = useState<TimeSlot[]>([])
  const [editingTimetable, setEditingTimetable] = useState(false)
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({})
  const navigate = useNavigate()

  // Memoize teacher data to prevent unnecessary re-fetches
  const cachedUserData = useMemo(() => {
    const cachedUser = getCachedUser();
    return cachedUser ? (cachedUser as unknown as Teacher) : null;
  }, []);

  // Fetch dashboard data only when teacher data changes
  useEffect(() => {
    async function compute() {
      if (!cachedUserData) return;

      try {
        const classStatusMap = Object.fromEntries(
          (cachedUserData.classes || []).map((c) => [c.id, c.completed])
        )

        const teacherClasses = await getTeacherClasses(cachedUserData.id, cachedUserData.classes);

        const dashboardClasses = await Promise.all(
          teacherClasses.map(async (classItem: Class) => {
            const studentsInClass = await getStudentsInClass(classItem.id);
            
            // Get today's attendance for this class
            const today = new Date();
            const attendanceRecords = await getAttendanceForClassOnDate(classItem.id, today.getTime());
            
            // Calculate attendance percentage
            let attendancePercent = 0;
            if (studentsInClass.length > 0 && attendanceRecords.length > 0) {
              const presentCount = (attendanceRecords as AttendanceRecord[]).filter(
                (record: AttendanceRecord) => record.status === 'Present'
              ).length;
              attendancePercent = Math.round((presentCount / studentsInClass.length) * 100);
            }

            return {
              id: classItem.id,
              className: classItem.className || 'Class',
              attendance: attendancePercent,
              studentCount: studentsInClass.length,
              isCompleted: classStatusMap[classItem.id] ?? false,
            };
          })
        );

        setClasses(dashboardClasses as TeacherDashboardClass[]);
        setTimetable(sampleTimetable);
      } catch (error) {
        console.error('Error loading teacher dashboard:', error);
      }
    }

    compute();
  }, [cachedUserData]);
  // Memoize handlers to prevent unnecessary re-renders
  const handleAddSlot = useCallback(() => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime && newSlot.classId && newSlot.className) {
      setTimetable([...timetable, newSlot as TimeSlot])
      setNewSlot({})
    }
  }, [newSlot, timetable]);

  const completedClasses = classes.filter((cls) => cls.isCompleted).length
  const inProgressClasses = classes.length - completedClasses
  const averageAttendance = classes.length
    ? Math.round(classes.reduce((sum, cls) => sum + cls.attendance, 0) / classes.length)
    : 0

  const classAttendanceData = useMemo(() => {
    return classes.map((cls) => ({
      label: cls.className,
      value: cls.attendance,
    }))
  }, [classes])

  const timetableByDay = useMemo(() => {
    const dayOrder: Record<string, number> = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    }

    return timetable
      .slice()
      .sort((a, b) => {
        const dayDifference = dayOrder[a.day] - dayOrder[b.day]
        if (dayDifference !== 0) return dayDifference

        return a.startTime.localeCompare(b.startTime)
      })
      .reduce((acc, slot) => {
        acc[slot.day] = acc[slot.day] || []
        acc[slot.day].push(slot)
        return acc
      }, {} as Record<string, TimeSlot[]>)
  }, [timetable])

  const now = useMemo(() => new Date(), [])
  const activeDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]

  const upcomingClass = useMemo(() => {
    const todaySlots = timetableByDay[activeDay] ?? []
    const upcoming = todaySlots
      .filter((slot) => slot.startTime >= now.toTimeString().slice(0, 5))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    return upcoming.length ? upcoming[0] : null
  }, [timetableByDay, activeDay, now])
  console.log("🚀 ~ TeacherOverView ~ upcomingClass:", upcomingClass)

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const markAsCompleted = (e: React.MouseEvent<HTMLDivElement>, classId: string) => {
  e.stopPropagation();
  setClasses(classes.map(cls => 
    cls.id === classId ? { ...cls, isCompleted: true } : cls
  ));
}

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-background min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            title="Total Classes"
            value={classes.length}
            subtitle={`Total Students: ${classes.reduce((sum, c) => sum + c.studentCount, 0)}`}
            gradient="from-blue-600 to-blue-400"
            icon={<Users className="h-6 w-6" />}
            colorText="text-blue-100"
          />

          <StatCard
            title="Avg Attendance"
            value={`${averageAttendance}%`}
            subtitle="Across all classes"
            gradient="from-indigo-600 to-indigo-400"
            icon={<Clock className="h-6 w-6" />}
            colorText="text-indigo-100"
          />

          <StatCard
            title="Completed Classes"
            value={completedClasses}
            subtitle="This term"
            gradient="from-green-600 to-green-400"
            icon={<CheckCircle2 className="h-6 w-6" />}
            colorText="text-green-100"
          />

          <StatCard
            title="In Progress"
            value={inProgressClasses}
            subtitle="Active classes"
            gradient="from-yellow-600 to-amber-400"
            icon={<Users className="h-6 w-6" />}
            colorText="text-yellow-100"
          />
        </div>

        {upcomingClass && (
          <div className="mb-4 sm:mb-6 flex gap-2 w-full">
            <Card className="border border-emerald-600 bg-emerald-950/20">
              <CardHeader>
                <CardTitle>Next Class</CardTitle>
                <CardDescription>
                  {activeDay}, {upcomingClass.startTime} -{" "}
                  {upcomingClass.endTime}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-foreground">
                  {upcomingClass.className}
                </p>
                <p className="text-sm text-muted-foreground">
                  Priority: Get attendance ready + share assignment
                </p>
              </CardContent>
            </Card>
           
          </div>
        )}
 {/* Classes Overview */}
            <div className="mb-4 sm:mb-6 w-full">
              <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">
                Your Classes
              </h2>
              {classes.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      data-class-name={cls.className}
                      onClick={() => navigate(`/teacher/class/${cls.id}`)}
                      className="text-left hover:scale-105 transition"
                    >
                      <Card className="w-full h-full hover:shadow-lg">
                        <CardContent className="p-4">
                          <div className="flex gap-1 justify-between items-start">
                            <h3 className="text-lg font-semibold mb-3">
                              {cls.className}
                            </h3>
                            <DropdownButton
                              options={[
                                {
                                  id: "mark-completed",
                                  label: "Mark as Completed",
                                  icon: <CheckCircle2 className="h-4 w-4" />,
                                  onClick: (
                                    e: React.MouseEvent<HTMLDivElement>,
                                  ) => markAsCompleted(e, cls.id),
                                },
                              ]}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Students
                              </span>
                              <span className="text-sm font-medium">
                                {cls.studentCount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Attendance
                              </span>
                              <span
                                className={`text-sm font-medium ${
                                  cls.attendance >= 80
                                    ? "text-green-600"
                                    : cls.attendance >= 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {cls.attendance}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span
                                className={`text-sm ${cls.isCompleted ? "text-green-600" : "text-yellow-600"}`}
                              >
                                {cls.isCompleted ? "Completed" : "In Progress"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              ) : (
                <Card className="flex justify-center items-center w-full">
                  <CardHeader>No classes assigned yet.</CardHeader>
                </Card>
              )}
            </div>
        {/* Class Attendance Chart */}
        <div className="mb-4 sm:mb-6">
          <ChartBar
            title="Class wise Attendance"
            description="Current attendance percentage for each class."
            chartData={classAttendanceData}
            xKey="label"
            yKey="value"
            onBarClick={(className: string) => {
              // optional: scroll to selected class card
              const element = document.querySelector(
                `[data-class-name="${className}"]`,
              );
              element?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        </div>

        {/* Timetable */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Timetable</CardTitle>
            <Button
              variant={editingTimetable ? "destructive" : "outline"}
              size="sm"
              onClick={() => setEditingTimetable(!editingTimetable)}
            >
              {editingTimetable ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-4">
              {days.map((day) => (
                <div
                  key={day}
                  className="bg-muted/50 border border-border rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold">{day}</h3>
                    <span className="text-xs text-muted-foreground">
                      {(timetableByDay[day] ?? []).length} slot(s)
                    </span>
                  </div>
                  {((timetableByDay[day] ?? []) as TimeSlot[]).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No class scheduled</p>
                  ) : (
                    <ul className="space-y-2">
                      {(timetableByDay[day] ?? []).map((slot, slotIdx) => (
                        <li
                          key={`${day}-${slotIdx}`}
                          className="border border-border rounded-md p-2 bg-background/50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-foreground/80 font-semibold">
                              {slot.className}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <div className="mt-1 text-xs flex items-center justify-between">
                            <span className="text-emerald-300">
                              {slot.classId}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const target = classes.find(
                                  (c) => c.id === slot.classId,
                                );
                                if (target)
                                  navigate(`/teacher/class/${target.id}`);
                              }}
                            >
                              Open
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {editingTimetable && (
              <div className="p-2 sm:p-4 bg-muted rounded-lg space-y-2 sm:space-y-3">
                <p className="font-semibold text-xs sm:text-sm">
                  Add New Class Slot
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
                  <select
                    value={newSlot.day || ""}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, day: e.target.value })
                    }
                    className="h-8 px-2 border rounded text-sm"
                  >
                    <option value="">Select Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  {["startTime", "endTime"].map((field) => (
                    <input
                      key={field}
                      type="time"
                      value={newSlot[field as keyof typeof newSlot] || ""}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, [field]: e.target.value })
                      }
                      className="h-8 px-2 border rounded text-sm"
                    />
                  ))}

                  <Input
                    value={newSlot.className || ""}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, className: e.target.value })
                    }
                    placeholder="Class name"
                    className="h-8"
                  />

                  <Input
                    value={newSlot.classId || ""}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, classId: e.target.value })
                    }
                    placeholder="Class ID"
                    className="h-8"
                  />

                  <Button size="sm" onClick={handleAddSlot}>
                    <Save className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            )}

            <datalist id="days">
              {days.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default memo(TeacherOverView);
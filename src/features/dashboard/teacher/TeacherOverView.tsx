
import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Clock, Edit2, Save, X, IndianRupee, CheckCircle2 } from 'lucide-react'
import { getTeacherClasses } from '@/firebase/teachersUtils'
import { getStudentsInClass } from '@/firebase/studentUtils'
import { getCachedUser } from '@/lib/utils'
import { getAttendanceForClassOnDate } from '@/firebase/AttendanceUtils'
import { Teacher, Class, AttendanceRecord } from '@/firebase/interfaces/user.interface'
import DropdownButton from '@/components/shared/DropdownButton'
import StatCard from '@/components/shared/StatCard'

// Dashboard class shape
type TeacherDashboardClass = {
  id: string
  name: string
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
              name: classItem.className || 'Class',
              attendance: attendancePercent,
              studentCount: studentsInClass.length,
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

  const handleDeleteSlot = useCallback((index: number) => {
    setTimetable(timetable.filter((_, i) => i !== index))
  }, [timetable]);

  const handleUpdateSlot = useCallback((index: number, field: string, value: string) => {
    const updated = [...timetable]
    updated[index] = { ...updated[index], [field]: value }
    setTimetable(updated)
  }, [timetable]);

  // Calculate hours completed (mock: 5 hours per class per week)
  const hoursCompleted = classes.length * 5

  // Calculate revenue (mock: $50 per hour)
  const revenueGenerated = hoursCompleted * 50

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const renderCell = (field: string, value: string, idx: number, type = "text") => (
  <td className="py-2 px-3">
    {editingTimetable ? (
      <Input
        type={type}
        list={field === "day" ? "days" : undefined}
        value={value}
        onChange={(e) =>
          handleUpdateSlot(idx, field, e.target.value)
        }
        className="h-8"
        placeholder={field === "className" ? "Class name" : undefined}
      />
    ) : (
      value
    )}
  </td>
);

const markAsCompleted = (e: React.MouseEvent<HTMLDivElement>, classId: string) => {
  e.stopPropagation();
  setClasses(classes.map(cls => 
    cls.id === classId ? { ...cls, isCompleted: true } : cls
  ));
}

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">

       {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            title="Total Classes"
            value={classes.length}
            subtitle={`Total Students: ${classes.reduce((sum, c) => sum + c.studentCount, 0)}`}
            gradient="from-blue-600 to-blue-400"
            icon={<Users className="h-6 w-6" />}
            colorText="text-blue-100"
          />

          <StatCard
            title="Hours Completed"
            value={`${hoursCompleted}h`}
            subtitle="This week"
            gradient="from-purple-600 to-purple-400"
            icon={<Clock className="h-6 w-6" />}
            colorText="text-purple-100"
          />

          <StatCard
            title="Compensation Generated"
            value={`₹${revenueGenerated}`}
            subtitle="This month"
            gradient="from-green-600 to-green-400"
            icon={<IndianRupee className="h-6 w-6" />}
            colorText="text-green-100"
          />
        </div>

        {/* Classes Overview */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">
            Your Classes
          </h2>
          {classes.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {classes.map((cls) => (
                <button
                  key={cls.id}
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
                              id: 'mark-completed',
                              label: 'Mark as Completed',
                              icon: <CheckCircle2 className="h-4 w-4" />,
                              onClick: (e: React.MouseEvent<HTMLDivElement>) => markAsCompleted(e, cls.id),
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
                          <span className={`text-sm ${cls.isCompleted ? "text-green-600" : "text-yellow-600"}`}>
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
                  Done
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
            {/* Timetable Display */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {["Day", "Start Time", "End Time", "Class"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 font-semibold">
                        {h}
                      </th>
                    ))}
                    {editingTimetable && (
                      <th className="text-left py-2 px-3 font-semibold">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {timetable.map((slot, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      {renderCell("day", slot.day, idx)}
                      {renderCell("startTime", slot.startTime, idx, "time")}
                      {renderCell("endTime", slot.endTime, idx, "time")}
                      {renderCell("className", slot.className, idx)}

                      {editingTimetable && (
                        <td className="py-2 px-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSlot(idx)}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Slot Form */}
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

                  <Button size="sm" onClick={handleAddSlot}>
                    <Save className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Datalist for days */}
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
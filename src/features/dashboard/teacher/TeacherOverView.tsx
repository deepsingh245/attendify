
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { teachersData } from './teachersData'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Clock, Edit2, Save, X, IndianRupee } from 'lucide-react'

// Dashboard class shape
type TeacherDashboardClass = {
  id: string
  name: string
  attendance: number
  studentCount: number
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

  useEffect(() => {
    function compute() {
      const teacherId = 'T001'
      const allClasses = teachersData.classes ?? []
      const allStudents = teachersData.students ?? []

      const teacherClasses = allClasses.filter((c) => c.teacherId === teacherId)

      const dashboardClasses = teacherClasses.map((c) => {
        const studentsInClass = allStudents.filter((s) => s.classId === c.id)
        let attendancePercent = 0
        const latestDate = studentsInClass
          .flatMap((s) => (s.attendance ?? []).map((a: { date: string }) => a.date))
          .sort()
          .pop()

        if (latestDate) {
          const presentCount = studentsInClass.reduce((acc, s) => {
            const rec = (s.attendance ?? []).find((a: { date: string; status: string }) => a.date === latestDate)
            return acc + (rec && rec.status === 'Present' ? 1 : 0)
          }, 0)
          attendancePercent = studentsInClass.length ? Math.round((presentCount / studentsInClass.length) * 100) : 0
        }

        return {
          id: c.id,
          name: c.className || 'Class',
          attendance: attendancePercent,
          studentCount: studentsInClass.length,
        }
      })

      setClasses(dashboardClasses as TeacherDashboardClass[])
      setTimetable(sampleTimetable)
    }

    compute()
  }, [])

  const handleAddSlot = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime && newSlot.classId && newSlot.className) {
      setTimetable([...timetable, newSlot as TimeSlot])
      setNewSlot({})
    }
  }

  const handleDeleteSlot = (index: number) => {
    setTimetable(timetable.filter((_, i) => i !== index))
  }

  const handleUpdateSlot = (index: number, field: string, value: string) => {
    const updated = [...timetable]
    updated[index] = { ...updated[index], [field]: value }
    setTimetable(updated)
  }

  // Calculate hours completed (mock: 5 hours per class per week)
  const hoursCompleted = classes.length * 5

  // Calculate revenue (mock: $50 per hour)
  const revenueGenerated = hoursCompleted * 50

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's your teaching overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {/* Classes Card */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-400 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Classes</p>
                  <p className="text-3xl font-bold mt-2">{classes.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <p className="text-blue-100 text-xs mt-4">
                Total Students: {classes.reduce((sum, c) => sum + c.studentCount, 0)}
              </p>
            </CardContent>
          </Card>

          {/* Hours Completed Card */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-400 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Hours Completed</p>
                  <p className="text-3xl font-bold mt-2">{hoursCompleted}h</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <p className="text-purple-100 text-xs mt-4">This week</p>
            </CardContent>
          </Card>

          {/* Revenue Generated Card */}
          <Card className="bg-gradient-to-br from-green-600 to-green-400 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm font-medium">Revenue Generated</p>
                  <p className="text-3xl font-bold mt-2">₹{revenueGenerated}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <IndianRupee className="h-6 w-6" />
                </div>
              </div>
              <p className="text-green-100 text-xs mt-4">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Classes Overview */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Your Classes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {classes.map((cls) => (
              <button key={cls.id} onClick={() => navigate(`/teacher/class/${cls.id}`)} className="text-left hover:scale-105 transition">
                <Card className="w-full h-full hover:shadow-lg">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3">{cls.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Students</span>
                        <span className="text-sm font-medium">{cls.studentCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Attendance</span>
                        <span className={`text-sm font-medium ${cls.attendance >= 80 ? 'text-green-600' : cls.attendance >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {cls.attendance}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>

        {/* Timetable */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Timetable</CardTitle>
            <Button
              variant={editingTimetable ? 'destructive' : 'outline'}
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
                    <th className="text-left py-2 px-3 font-semibold">Day</th>
                    <th className="text-left py-2 px-3 font-semibold">Start Time</th>
                    <th className="text-left py-2 px-3 font-semibold">End Time</th>
                    <th className="text-left py-2 px-3 font-semibold">Class</th>
                    {editingTimetable && <th className="text-left py-2 px-3 font-semibold">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((slot, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">
                        {editingTimetable ? (
                          <Input
                            list="days"
                            value={slot.day}
                            onChange={(e) => handleUpdateSlot(idx, 'day', e.target.value)}
                            className="h-8"
                          />
                        ) : (
                          slot.day
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {editingTimetable ? (
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleUpdateSlot(idx, 'startTime', e.target.value)}
                            className="h-8"
                          />
                        ) : (
                          slot.startTime
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {editingTimetable ? (
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleUpdateSlot(idx, 'endTime', e.target.value)}
                            className="h-8"
                          />
                        ) : (
                          slot.endTime
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {editingTimetable ? (
                          <Input
                            value={slot.className}
                            onChange={(e) => handleUpdateSlot(idx, 'className', e.target.value)}
                            placeholder="Class name"
                            className="h-8"
                          />
                        ) : (
                          slot.className
                        )}
                      </td>
                      {editingTimetable && (
                        <td className="py-2 px-3">
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteSlot(idx)}>
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
                <p className="font-semibold text-xs sm:text-sm">Add New Class Slot</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
                  <select
                    value={newSlot.day || ''}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                    className="h-8 px-2 border rounded text-sm"
                  >
                    <option value="">Select Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={newSlot.startTime || ''}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="h-8 px-2 border rounded text-sm"
                  />
                  <input
                    type="time"
                    value={newSlot.endTime || ''}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="h-8 px-2 border rounded text-sm"
                  />
                  <Input
                    value={newSlot.className || ''}
                    onChange={(e) => setNewSlot({ ...newSlot, className: e.target.value })}
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
  )
}

export default TeacherOverView
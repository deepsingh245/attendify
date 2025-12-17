// import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { getStudentById } from '@/firebase/studentUtils'
import { getAllAttendanceForStudent } from '@/firebase/AttendanceUtils'
// import { deleteDocument, updateDocument } from '@/firebase/firebaseUtils'
// import { Collections } from '@/constants/constants'
import { Student, AttendanceRecord } from '@/firebase/interfaces/user.interface'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
import GenericTable from '@/components/shared/GenericTable'
// Chart rendering is handled by ChartBarDefault; no direct recharts imports needed here
// import { BasicAlert } from '@/components/modals/basicAlert'
import { ChartBar } from '@/components/charts/BarChart'
import { useParams } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Hash, School, CheckCircle, XCircle, User } from 'lucide-react'

export default function AdminStudentDetail() {
  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('Jan');
  const [loading, setLoading] = useState(true);
  // const [saving, setSaving] = useState(false);
  // const [showAlert, setShowAlert] = useState(false);
  // const [alertMessage, setAlertMessage] = useState('');

  /** Fetch student and attendance data */
  useEffect(() => {
    if (!id) return
    const fetchStudentData = async () => {
      setLoading(true)
      try {
        const [studentData, attendanceData] = await Promise.all([
          getStudentById(id),
          getAllAttendanceForStudent(id),
        ])
        setStudent(studentData)
        setAttendance(attendanceData || [])
      } catch (err) {
        console.error('Failed to load student data:', err)
        alert('Failed to load student data.')
      } finally {
        setLoading(false)
      }
    }
    fetchStudentData();
  }, [id]);

  // update alert message when student changes
  // useEffect(() => {
  //   setAlertMessage(student?.isActive
  //     ? 'Suspend this student (remove from class)?'
  //     : 'Reinstate this student?')
  // }, [student])

  /** Attendance data grouped by month */
  const year = new Date().getFullYear()
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(year, i).toLocaleString('default', { month: 'short' }),
      present: 0,
      total: 0,
    }))

    attendance.forEach((record) => {
      const date = new Date(record.date)
      if (date.getFullYear() !== year) return
      const monthIndex = date.getMonth()
      months[monthIndex].total += 1
      if (record.status === 'Present') months[monthIndex].present += 1
    })

    return months.map((m) => ({
      month: m.month,
      value: m.total ? Math.round((m.present / m.total) * 100) : 0,
      present: m.present,
      total: m.total,
    }))
  }, [attendance, year])

  /** Delete student handler */
  // const handleDelete = async () => {
  //   if (!id) return
  //   if (!confirm('Delete this student permanently? This action cannot be undone.')) return
  //   setSaving(true)
  //   try {
  //     await deleteDocument(Collections.STUDENTS, id)
  //     navigate('/admin/students')
  //   } catch (err) {
  //     console.error(err)
  //     alert('Failed to delete student.')
  //   } finally {
  //     setSaving(false)
  //   }
  // }

  // const suspend = async () => {
  //   try {
  //     if (!id || !student) return
  //     setSaving(true)
  //     const updates: Record<string, unknown> = { isActive: !student.isActive }
  //     if (student.isActive && student.classId) {
  //       updates.classId = ''
  //       const classesArr = Array.isArray(student.classes)
  //         ? (student.classes as string[])
  //         : []
  //       updates.classes = classesArr.filter((c) => c !== student.classId)
  //     }

  //     await updateDocument(Collections.STUDENTS, id, updates)
  //     const refreshed = await getStudentById(id)
  //     setStudent(refreshed)
  //   } catch (err) {
  //     console.error(err)
  //     alert('Failed to update student.')
  //   } finally {
  //     setSaving(false)
  //   }
  // }

  /** Table columns */
  const attendanceColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (r: AttendanceRecord) => {
        const d = new Date(Number(r.date) || r.date)
        return `${d.getDate()} (${d.toLocaleString('default', { weekday: 'long' })})`
      }
    },
    { key: 'status', header: 'Status', render: (r: AttendanceRecord) => r.status },
  ]

  return (
    <div className="p-2 sm:p-4 md:p-6 flex flex-col gap-3 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold">Student Details</h1>
        {/* <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={saving || loading}
          >
            {saving ? "Deleting..." : "Delete"}
          </Button>
          <BasicAlert
            message={alertMessage}
            action={suspend}
            showAlert={showAlert}
            setShowAlert={setShowAlert}
            confirmButtonText={
              saving
                ? "Processing..."
                : student?.isActive
                ? "Suspend / Remove from Class"
                : "Reinstate"
            }
          />
        </div> */}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading student data...
        </div>
      )}

      {/* Student Details */}
      {!loading && student && (
        <div className="flex flex-col gap-6">
          {/* Student Info Card */}
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                  <AvatarImage src={student.profilePictureUrl} alt={student.name} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {student.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-2xl font-bold tracking-tight">{student.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${student.isActive
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                        }`}
                    >
                      {student.isActive ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {student.isActive ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{student.email}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Roll Number</p>
                  <p className="font-semibold mt-0.5">{student.rollNo}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</p>
                  <p className="font-semibold mt-0.5">{student.classId || "Not Assigned"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</p>
                  <p className="font-mono text-sm font-medium mt-0.5 truncate max-w-[150px]" title={student.id}>
                    {student.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-medium mb-2">
                Attendance Overview ({year})
              </h2>
              <div className="w-full">
                <ChartBar
                  chartData={monthlyData.map((m) => ({ month: m.month, desktop: m.value }))}
                  onBarClick={(month) => {
                    // set the selected month when user clicks a bar
                    setSelectedMonth(month)
                  }}
                />
              </div>
            </div>

            <div className='mt-6'>
              <h3 className="text-md font-medium mb-2">{selectedMonth} Attendance Records</h3>
              <GenericTable
                columns={attendanceColumns}
                data={attendance.filter((r) => {
                  try {
                    const d = new Date(r.date)
                    return d.toLocaleString('default', { month: 'short' }) === selectedMonth
                  } catch {
                    return false
                  }
                })}
                pageSize={12}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

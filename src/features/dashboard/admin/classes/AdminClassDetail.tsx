import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getClassById, getTeacherById } from '@/firebase/teachersUtils'
import { getStudentsInClass } from '@/firebase/studentUtils'
import { Class, Student, Teacher } from '@/firebase/interfaces/user.interface'
import GenericTable from '@/components/shared/GenericTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminClassDetail(){
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cls, setCls] = useState<Class | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!id) return
      setLoading(true)
      const c = await getClassById(id)
      setCls(c)
      if (c?.teacherId) {
        const t = await getTeacherById(c.teacherId)
        setTeacher(t)
      }
      const studs = await getStudentsInClass(id)
      setStudents(studs)
      setLoading(false)
    }
    fetch()
  }, [id])

  const columns = [
    { key: 'rollNo', header: 'Roll', render: (r: Student) => r.rollNo },
    { key: 'name', header: 'Name', render: (r: Student) => r.name },
    { key: 'email', header: 'Email', render: (r: Student) => r.email },
    { key: 'actions', header: 'Actions', render: (r: Student) => (
      <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/students/${r.id}`)}>View</Button>
    )}
  ]
  // simple client-side email filter
  const [emailFilter, setEmailFilter] = useState('')
  const filteredStudents = students.filter((s) => {
    if (!emailFilter) return true
    return (s.email ?? '').toLowerCase().includes(emailFilter.toLowerCase())
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Class detail</h1>
      </div>

      {loading && <div>Loading...</div>}

      {cls && (
        <div>
          <div className="mb-4">
            <strong>Class:</strong> {cls.className}
          </div>
          <div className="mb-4">
            <strong>Teacher:</strong>{" "}
            {teacher ? (
              <button
                className=" text-lg font-bold text-primary"
                onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
              >
                {teacher.name}
              </button>
            ) : (
              <span>Unassigned</span>
            )}
          </div>

          <div>
            <div className="flex items-center py-4 justify-between">
              <h2 className="text-lg font-medium mb-2">Students</h2>
              <Input
                placeholder="Filter emails..."
                value={emailFilter}
                onChange={(event) => setEmailFilter(event.target.value)}
                className="max-w-sm"
              />
            </div>
            <GenericTable columns={columns} data={filteredStudents} pageSize={10} />
          </div>
        </div>
      )}
    </div>
  );
}

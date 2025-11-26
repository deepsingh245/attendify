import { useEffect, useState } from 'react';
import { getAllStudents } from '@/firebase/studentUtils';
import { getAllAttendance } from '@/firebase/AttendanceUtils';
import { Student, AttendanceRecord } from '@/firebase/interfaces/user.interface';
import GenericTable from '@/components/shared/GenericTable';
import GlobalLoader from '@/components/ui/global-loader';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router';

type StudentStats = {
  id: string;
  name: string;
  email: string;
  absent: number;
  leave: number;
  present: number;
  feePaid: boolean;
};

const StudentList = () => {
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const allStudents = await getAllStudents();
        const allAttendance = await getAllAttendance();

        // Compute stats for each student
        const stats: StudentStats[] = allStudents.map((s: Student, index: number) => {
          const studentRecs = allAttendance.filter(
            (a: AttendanceRecord) => a.studentId === s.id
          );
          const absent = studentRecs.filter((a) => a.status === 'Absent').length;
          const leave = studentRecs.filter((a) => a.status === 'Leave').length;
          const present = studentRecs.filter((a) => a.status === 'Present').length;
          // Demo: fee paid is random; in production, fetch from a payments collection
          const feePaid = Math.random() > 0.3;

          return {
            index: index + 1,
            id: s.id,
            name: s.name || 'N/A',
            email: s.email,
            absent,
            leave,
            present,
            feePaid,
          };
        });

        setStudents(stats);
      } catch (error) {
        console.error('Error fetching student list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { key: 'index', header: 'S.No' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'present',
      header: 'Present',
      align: 'center' as const,
      render: (row: StudentStats) => (
        <span className=" text-green-400 text-md font-bold">
          {row.present}
        </span>
      ),
    },
    {
      key: 'absent',
      header: 'Absent',
      align: 'center' as const,
      render: (row: StudentStats) => (
        <span className="text-red-400 text-md font-bold">
          {row.absent}
        </span>
      ),
    },
    {
      key: 'leave',
      header: 'Leave',
      align: 'center' as const,
      render: (row: StudentStats) => (
        <span className="text-yellow-400 text-md font-bold">
          {row.leave}
        </span>
      ),
    },
    {
      key: 'feePaid',
      header: 'Fee Status',
      align: 'center' as const,
      render: (row: StudentStats) => (
        <span
          className={`px-2 py-1 rounded-md text-sm font-medium ${
            row.feePaid
              ? 'bg-blue-100 text-blue-700'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {row.feePaid ? 'Paid' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'center' as const,
      render: (row: StudentStats) => (
        <button
        onClick={()=>navigate(`admin/students/${row.id}`)}
          className={`rounded-md text-sm font-medium text-blue-200 cursor-pointer flex items-center justify-center`}
        >
          <Eye className="inline-block mr-1 h-4 w-4" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <GlobalLoader show={loading} message="Loading students..." />
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-2">Student List</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Overview of all students with attendance and fee payment status
        </p>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <GenericTable
          columns={columns}
          data={students}
          pageSize={10}
          showPagination={true}
          caption={`Showing ${students.length} students`}
        />
      </div>
    </div>
  );
};

export default StudentList;
import { useEffect, useState } from 'react';
import { getAllStudents, addStudent } from '@/firebase/studentUtils';
import { getAllAttendance } from '@/firebase/AttendanceUtils';
import { getAllClasses } from '@/firebase/adminUtils';
import { Student, AttendanceRecord, Class } from '@/firebase/interfaces/user.interface';
import GenericTable from '@/components/shared/GenericTable';
import GlobalLoader from '@/components/ui/global-loader';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import AddUserModal, { Field } from '@/components/modals/addUserModal';
import { dangerToast, successToast } from '@/lib/utils';

type StudentStats = {
  id: string;
  name: string;
  email: string;
  class: string;
  absent: number;
  leave: number;
  present: number;
  feePaid: boolean;
};

const StudentList = () => {
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allStudents, allAttendance, allClasses] = await Promise.all([
        getAllStudents(),
        getAllAttendance(),
        getAllClasses(),
      ]);

      setClasses(allClasses);

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
          name: s.userName || 'N/A',
          class: allClasses.find(c => c.id === s.classId)?.className || 'N/A',
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
      dangerToast('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async (values: Record<string, string>) => {
    try {
      // Validate required fields
      if (!values.userName || !values.email || !values.password || !values.rollNo || !values.classId) {
        dangerToast('Please fill in all required fields');
        return;
      }

      // Validate password length
      if (values.password.length < 6) {
        dangerToast('Password must be at least 6 characters long');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.email)) {
        dangerToast('Please enter a valid email address');
        return;
      }

      // Validate roll number is a positive number
      const rollNo = Number(values.rollNo);
      if (isNaN(rollNo) || rollNo <= 0) {
        dangerToast('Roll number must be a positive number');
        return;
      }

      // Create student object with all required fields from Student interface
      await addStudent({
        userName: values.userName,
        email: values.email,
        rollNo: rollNo,
        classId: values.classId,
        classes: [values.classId],
        profilePictureUrl: values.profilePictureUrl || undefined,
        password: values.password,
      });
      
      successToast('Student added successfully! They can now login with their credentials.');
      setIsAddModalOpen(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      console.error('Error adding student:', error);
      
      // Provide specific error messages based on the error type
      if (error?.code === 'auth/email-already-in-use') {
        dangerToast('This email is already registered');
      } else if (error?.code === 'auth/invalid-email') {
        dangerToast('Invalid email format');
      } else if (error?.message) {
        dangerToast(`Failed to add student: ${error.message}`);
      } else {
        dangerToast('Failed to add student. Please try again.');
      }
    }
  };

  const columns = [
    { key: 'index', header: 'S.No' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'class', header: 'Class' },
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
          className={` px-2 py-1 rounded-md text-sm font-medium ${
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
        onClick={()=>navigate(`/admin/students/${row.id}`)}
          className={`rounded-md text-sm font-medium text-blue-200 cursor-pointer flex items-center justify-center`}
        >
          <Eye className="inline-block mr-1 h-4 w-4" />
          View
        </button>
      ),
    },
  ];

  const addStudentFields: Field[] = [
    { name: 'userName', label: 'Name', placeholder: 'Enter student name', required: true },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter email address', required: true },
    { name: 'password', label: 'Password (Student will change it later)', type: 'password', placeholder: 'Enter default password (min 6 chars)', required: true },
    { name: 'rollNo', label: 'Roll No', type: 'number', placeholder: 'Enter roll number', required: true },
    { 
      name: 'classId', 
      label: 'Class', 
      type: 'select', 
      placeholder: 'Select a class',
      required: true,
      options: classes.map(c => ({ label: c.className, value: c.id }))
    },
    { name: 'profilePictureUrl', label: 'Profile Picture URL (Optional)', type: 'text', placeholder: 'Enter profile picture URL' },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <GlobalLoader show={loading} message="Loading students..." />
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-2">Student List</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Overview of all students with attendance and fee payment status
          </p>
        </div>
      <AddUserModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Student"
        description="Enter the details of the new student. They will be able to login with the provided email and password."
        fields={addStudentFields}
        onSubmit={handleAddStudent}
        submitLabel="Add Student"
      />
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
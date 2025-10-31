


import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { teachersData } from './teachersData';
// import { addCollection, setDocument } from '@/firebase/firebaseUtils';
// import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Dashboard class shape used by this component
type TeacherDashboardClass = {
  id: string;
  name: string;
  completed: boolean;
  status: string;
  attendance: number; // percentage (0-100) of students present on latest day
  studentCount: number;
};

const TeacherOverView = () => {
  const [classes, setClasses] = useState<TeacherDashboardClass[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    function compute() {
      const teacherId = 'T001'; // TODO: replace with auth/current teacher id

  const allClasses = (teachersData.classes ?? [])
  const allStudents = (teachersData.students ?? []);

      const teacherClasses = allClasses.filter((c) => c.teacherId === teacherId);

      const dashboardClasses: TeacherDashboardClass[] = teacherClasses.map((c) => {
        const studentsInClass = allStudents.filter((s) => s.classId === c.id);

        // compute attendance on the latest date available across these students
        let attendancePercent = 0;
        const latestDate = studentsInClass
          .flatMap((s) => (s.attendance ?? []).map((a: { date: string }) => a.date))
          .sort()
          .pop();

        if (latestDate) {
          const presentCount = studentsInClass.reduce((acc, s) => {
            const rec = (s.attendance ?? []).find((a: { date: string; status: string }) => a.date === latestDate);
            return acc + (rec && rec.status === 'Present' ? 1 : 0);
          }, 0);
          attendancePercent = studentsInClass.length ? Math.round((presentCount / studentsInClass.length) * 100) : 0;
        }

        return {
          id: c.id,
          name: c.className || 'Class',
          completed: c.status === 'Completed',
          status: c.status || 'Ongoing',
          attendance: attendancePercent,
          studentCount: studentsInClass.length,
        };
      });

      setClasses(dashboardClasses);
    }

    compute();
  }, []);

  // const setDocTeach = async() => {
  //   await setDocument('attendance', 'C102', teachersData.attendance[ 'C102' ]);
  //   // await addCollection('classes', teachersData.classes[0]);
  //   console.log('Document Set');
  // }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teacher Overview</h1>
      <div className="mb-6">Summary of your classes and today's attendance.</div>
      {/* <Button onClick={setDocTeach}>set Teacher Data</Button> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((cls) => (
          <button key={cls.id} onClick={() => navigate(`/teacher/class/${cls.id}`)}>
          <Card key={cls.id} className="w-full">
            <CardHeader className='items-start'>
              <h2 className="text-lg font-semibold">{cls.name}</h2>
              <div>Completed: {cls.completed ? 'Yes' : 'No'}</div>
              <div>Students: {cls.studentCount}</div>
              <div>
                <strong>Status:</strong> {cls.status}
              </div>
            </CardHeader>
          </Card>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeacherOverView;
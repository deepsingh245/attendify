import { Card, CardHeader } from '@/components/ui/card';
import { getAllClasses } from '@/firebase/adminUtils';
import { Class } from '@/firebase/interfaces/user.interface';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminOverview = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);

  React.useEffect(() => {
    // Fetch or compute admin dashboard data here
    const fetchAdminData = async () => {
      const data = await getAllClasses();
      setClasses(data);
    }
    fetchAdminData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Overview</h1>
      <div className="mb-6">List of all classes</div>
      {/* <Button onClick={setDocTeach}>set Teacher Data</Button> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((cls) => (
          <button key={cls.id} onClick={() => navigate(`/teacher/class/${cls.id}`)}>
          <Card key={cls.id} className="w-full">
            <CardHeader className='items-start'>
              <h2 className="text-lg font-semibold">{cls.className}</h2>
              <div>Students: {cls.students.length}</div>
              <div>
                <strong>Assigned teacher:</strong> {cls.teacherId || 'Unassigned'}
              </div>
            </CardHeader>
          </Card>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;

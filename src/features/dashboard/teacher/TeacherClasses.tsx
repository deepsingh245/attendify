import { Card, CardHeader } from "@/components/ui/card";
import { getAllClasses } from "@/firebase/adminUtils";
import { Class, Teacher } from "@/firebase/interfaces/user.interface";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherById } from "@/firebase/teachersUtils";
import { Button } from "@/components/ui/button";
import GlobalLoader from "@/components/ui/global-loader";

const TeacherClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [classMeta, setClassMeta] = useState<
    Record<string, { teacher?: Teacher | null }>
  >({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch or compute admin dashboard data here
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const data = await getAllClasses();
        setClasses(data);

        // For each class, fetch only the assigned teacher to display in the overview
        const metas = await Promise.all(
          data.map(async (c) => {
            const teacher = c.teacherId
              ? await getTeacherById(c.teacherId)
              : null;
            return { id: c.id, teacher };
          })
        );

        const metaMap: Record<string, { teacher?: Teacher | null }> = {};
        metas.forEach((m) => {
          metaMap[m.id] = { teacher: m.teacher };
        });

        setClassMeta(metaMap);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);
  return (
    <>
      {/* <Button onClick={setDocTeach}>set Teacher Data</Button> */}
      <GlobalLoader show={loading} message="Loading classes..." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((cls) => {
          const meta = classMeta[cls.id];
          return (
            <Card key={cls.id} className="w-full">
              <CardHeader className="items-start">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{cls.className}</h2>
                    <Button
                      className="h-7"
                      onClick={() => navigate(`/admin/classes/${cls.id}`)}
                    >
                      Open
                    </Button>
                  </div>

                  <div className="mt-2 text-sm">
                    Students: {cls.students.length}
                  </div>

                  <div className="mt-2">
                    <strong>Assigned teacher: </strong>
                    {meta?.teacher ? (
                      <button
                        className="text-lg text-blue-600"
                        onClick={() =>
                          navigate(`/admin/teachers/${meta.teacher?.id}`)
                        }
                      >
                        {meta.teacher.name}
                      </button>
                    ) : (
                      <span>Unassigned</span>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default TeacherClasses;

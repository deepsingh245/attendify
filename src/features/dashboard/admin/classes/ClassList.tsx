import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { getAllClasses } from "@/firebase/adminUtils";
import { Class, Teacher } from "@/firebase/interfaces/user.interface";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherById } from "@/firebase/teachersUtils";
import { Button } from "@/components/ui/button";
import GlobalLoader from "@/components/ui/global-loader";
import { Users, User } from "lucide-react";

const ClassList = () => {
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

  const renderClassCard = (cls: Class) => {
    const meta = classMeta[cls.id];
    const initials = cls.className
      .split(' ')
      .map((s) => s.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CL';

    return (
      <Card key={cls.id} className="p-2 flex flex-col justify-between">
        {/* Header */}
        <CardHeader className="flex items-start justify-between gap-3 p-3 flex-row">
          <div className="flex items-center justify-start gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {initials}
            </div>
            <div>
              <div className="font-medium text-lg">{cls.className}</div>
              {cls.id && (
                <div className="mt-1">
                  <span className="inline-block text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {cls.id}
                  </span>
                </div>
              )}
            </div>
          </div>
           <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{cls.students.length} Students</span>
            </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 pt-3">
          <div className="flex flex-col gap-3 text-sm">
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground mb-1">Assigned Teacher</div>
              {meta?.teacher ? (
                <button
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  onClick={() =>
                    navigate(`/admin/teachers/${meta.teacher?.id}`)
                  }
                >
                  <User className="h-4 w-4" />
                  {meta.teacher.name}
                </button>
              ) : (
                <span className="text-xs text-muted-foreground italic">Unassigned</span>
              )}
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/admin/classes/${cls.id}`)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <GlobalLoader show={loading} message="Loading Classes..." />
      <div className="flex flex-col gap-3">
        <div className="p-1 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Classes</h1>
          <Button variant="secondary" className="bg-primary" onClick={() => {}}>
            Add Class
          </Button>
        </div>
        {classes.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">No classes found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map(renderClassCard)}
          </div>
        )}
      </div>
    </>
  );
};

export default ClassList;

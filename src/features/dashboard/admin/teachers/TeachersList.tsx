import { useEffect, useState } from "react";
import EntityList from "../components/EntityList";
import { getAllTeachers } from "@/firebase/teachersUtils";
import { Teacher } from "@/firebase/interfaces/user.interface";
import AddUserModal, { Field } from "@/components/modals/addUserModal";
import GlobalLoader from "@/components/ui/global-loader";


export const TeachersList: React.FC = () => {
const [teachers, setTeachers] = useState<Teacher[]>([]);
const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
     const getteachersData = async () => {
      setLoading(true);
      const teachers = await getAllTeachers();
      setTeachers(teachers);
      setLoading(false);
    };
    getteachersData();
  }, []);

  const addTeacher = async () => {
    console.log("🚀 ~ TeachersList ~ values:");
  };

  const teacherFields: Field[] = [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "subject", label: "Subject", required: true, type: "select", options: [
      { label: "Mathematics", value: "mathematics" },
      { label: "Science", value: "science" },
      { label: "History", value: "history" },
      { label: "English", value: "english" },
      { label: "Art", value: "art" },
    ] },
  ];

  return (
    <>
    <GlobalLoader show={loading} />
      <div className="flex flex-col gap-3">
        <div className="p-1 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teachers List</h1>
          <AddUserModal
            title="Add Teacher"
            fields={teacherFields}
            onSubmit={addTeacher}
          />
        </div>
        <EntityList items={teachers} basePath="/admin/teachers" />
      </div>
    </>
  );
};
export default TeachersList;
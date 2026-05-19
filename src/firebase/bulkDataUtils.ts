import { addClass } from './adminUtils';
import { addTeacher } from './teachersUtils';
import { addStudent } from './studentUtils';
import { addDocument } from './firebaseUtils';
import { Collections } from '@/constants/constants';
import { Class, Teacher, Student, AttendanceRecord } from './interfaces/user.interface';

// Sample data generators
const firstNames = [
  'Ahmed', 'Fatima', 'Muhammad', 'Aisha', 'Omar', 'Zainab', 'Ali', 'Maryam',
  'Hassan', 'Khadija', 'Ibrahim', 'Sara', 'Yusuf', 'Amina', 'Abdullah', 'Huda',
  'Omar', 'Layla', 'Hamza', 'Noor', 'Bilal', 'Rania', 'Salman', 'Sana',
  'Tariq', 'Zara', 'Usman', 'Hira', 'Fahad', 'Ayesha', 'Saad', 'Maha',
  'Rayan', 'Laila', 'Arham', 'Sadia', 'Daniyal', 'Nadia', 'Haris', 'Saima'
];

const lastNames = [
  'Khan', 'Ahmed', 'Ali', 'Hassan', 'Malik', 'Shah', 'Qureshi', 'Javed',
  'Butt', 'Raza', 'Iqbal', 'Farooq', 'Nawaz', 'Akhtar', 'Bashir', 'Khalid',
  'Yousaf', 'Mahmood', 'Siddiqui', 'Zaidi', 'Kazmi', 'Jamil', 'Anwar', 'Fazal',
  'Gul', 'Hameed', 'Latif', 'Nasir', 'Rafiq', 'Saleem', 'Tariq', 'Umar',
  'Waseem', 'Yasin', 'Zafar', 'Abbas', 'Baig', 'Chaudhry', 'Dar', 'Ejaz'
];

const subjects = ['Mathematics', 'Science', 'English', 'History', 'Art', 'Physical Education', 'Computer Science', 'Geography'];

const generateRandomName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

const generateEmail = (name: string, role: string) => {
  return `${name.toLowerCase().replace(/\s+/g, '.')}@${role}.attendify.school`;
};

// Generate 10 classes
const generateClasses = (): Omit<Class, 'id'>[] => {
  const classes: Omit<Class, 'id'>[] = [];
  for (let grade = 1; grade <= 5; grade++) {
    for (let section = 0; section < 2; section++) {
      const sectionLetter = String.fromCharCode(65 + section); // A, B
      classes.push({
        className: `Grade ${grade}${sectionLetter}`,
        teacherId: '', // Will be assigned later
        students: [] // Will be populated later
      });
    }
  }
  return classes;
};

// Generate 20 teachers
const generateTeachers = (): (Omit<Teacher, 'id'> & { password: string })[] => {
  const teachers: (Omit<Teacher, 'id'> & { password: string })[] = [];

  for (let i = 0; i < 20; i++) {
    const name = generateRandomName();
    const subject = subjects[Math.floor(Math.random() * subjects.length)];

    teachers.push({
      userName: name,
      email: generateEmail(name, 'teacher'),
      password: 'teacher123',
      subject,
      classes: [], // Will be assigned later
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      role: 'teacher'
    });
  }

  return teachers;
};

// Generate students for each class (20 per class)
const generateStudents = (classes: Class[]): (Omit<Student, 'id'> & { password: string })[] => {
  const students: (Omit<Student, 'id'> & { password: string })[] = [];

  classes.forEach((classData) => {
    for (let i = 1; i <= 20; i++) {
      const name = generateRandomName();

      students.push({
        userName: name,
        email: generateEmail(name, 'student'),
        password: 'student123',
        rollNo: i,
        classId: classData.id,
        classes: [classData.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        role: 'student'
      });
    }
  });

  return students;
};

// Generate sample attendance data for the past 30 days
const generateAttendanceData = (students: Student[]): AttendanceRecord[] => {
  const attendanceRecords: AttendanceRecord[] = [];
  const today = new Date();

  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() - day);
    const dateString = date.toISOString().split('T')[0];

    students.forEach(student => {
      // Random attendance status with bias towards present
      const random = Math.random();
      let status: 'Present' | 'Absent' | 'Leave';
      if (random < 0.85) status = 'Present';
      else if (random < 0.95) status = 'Absent';
      else status = 'Leave';

      attendanceRecords.push({
        studentId: student.id,
        date: dateString,
        status,
        classId: student.classId
      });
    });
  }

  return attendanceRecords;
};

// Main bulk creation function
export const bulkCreateData = async () => {
  console.log('🚀 Starting bulk data creation...');

  try {
    // Step 1: Create classes
    console.log('📚 Creating classes...');
    const classTemplates = generateClasses();
    const createdClasses: Class[] = [];

    for (const classData of classTemplates) {
      const classId = await addClass(classData);
      createdClasses.push({ ...classData, id: classId });
    }
    console.log(`✅ Created ${createdClasses.length} classes`);

    // Step 2: Create teachers and assign to classes
    console.log('👨‍🏫 Creating teachers...');
    const teacherTemplates = generateTeachers();
    const createdTeachers: Teacher[] = [];

    // Assign teachers to classes (2 classes per teacher on average)
    const classesPerTeacher = Math.ceil(createdClasses.length / teacherTemplates.length);

    for (let i = 0; i < teacherTemplates.length; i++) {
      const teacherData = teacherTemplates[i];
      const assignedClasses = createdClasses.slice(
        i * classesPerTeacher,
        (i + 1) * classesPerTeacher
      );

      // Update teacher with assigned classes
      const teacherWithClasses = {
        ...teacherData,
        classes: assignedClasses.map(cls => ({
          id: cls.id,
          isAttendanceMarkedForToday: false,
          completed: false
        }))
      };

      const teacherId = await addTeacher(teacherWithClasses);
      createdTeachers.push({
        ...teacherWithClasses,
        id: teacherId
      });

      // Update classes with teacher assignment
      assignedClasses.forEach(cls => {
        cls.teacherId = teacherId;
      });
    }
    console.log(`✅ Created ${createdTeachers.length} teachers`);

    // Step 3: Create students
    console.log('👨‍🎓 Creating students...');
    const studentTemplates = generateStudents(createdClasses);
    const createdStudents: Student[] = [];

    for (const studentData of studentTemplates) {
      const studentId = await addStudent(studentData);
      createdStudents.push({
        ...studentData,
        id: studentId
      });
    }
    console.log(`✅ Created ${createdStudents.length} students`);

    // Step 4: Update classes with student IDs
    console.log('🔄 Updating classes with student assignments...');
    const studentsByClass = createdStudents.reduce((acc, student) => {
      if (!acc[student.classId]) acc[student.classId] = [];
      acc[student.classId].push(student.id);
      return acc;
    }, {} as Record<string, string[]>);

    for (const classData of createdClasses) {
      const studentIds = studentsByClass[classData.id] || [];
      await updateClassStudents(classData.id, studentIds);
    }
    console.log('✅ Updated class student assignments');

    // Step 5: Generate and add attendance data
    console.log('📊 Generating attendance data...');
    const attendanceData = generateAttendanceData(createdStudents);

    // Use individual addDocument calls instead of batch write for reliability
    console.log('📝 Adding attendance records...');
    for (const record of attendanceData) {
      await addDocument(Collections.ATTENDANCE, record);
    }
    console.log(`✅ Created ${attendanceData.length} attendance records`);

    console.log('🎉 Bulk data creation completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${createdClasses.length} classes`);
    console.log(`   - ${createdTeachers.length} teachers`);
    console.log(`   - ${createdStudents.length} students`);
    console.log(`   - ${attendanceData.length} attendance records`);

    return {
      classes: createdClasses,
      teachers: createdTeachers,
      students: createdStudents,
      attendanceRecords: attendanceData.length
    };

  } catch (error) {
    console.error('❌ Error during bulk data creation:', error);
    throw error;
  }
};

// Helper function to update class with student IDs
const updateClassStudents = async (classId: string, studentIds: string[]) => {
  const { updateDocument } = await import('./firebaseUtils');
  await updateDocument(Collections.CLASSES, classId, { students: studentIds });
};
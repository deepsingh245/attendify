import { Admins, Student, Teacher } from "@/firebase/interfaces/user.interface";

// Sample data used by the demo UI. The shapes here are looser than the canonical
// Firestore types because we include extra demo-only fields (subjects, subjectCode,
// and human-readable date strings) useful for UI prototypes.
export const teachersData: {
  admins: Admins[];
  teachers: Teacher[];
  // classes in this demo include a subjects array with a subject name and code
  classes: { id: string; className: string; teacherId: string; students: string[]; subjects: { name: string; code: string }[] }[];
  students: Student[];
  // attendance is now subject-wise and date is a human-readable string like "26-11-25 00:00"
  attendance: { classId: string; date: string; studentId: string; status: string; subjectCode: string }[];
} = {
  admins:[
    {
      id: 'Bw3j85VthWZK1dSNoZH1HS4SLE83',
      userName: 'guest.admin',
      email: 'guestadmin@arovation.ar',
      role:'admin',
      profilePictureUrl: 'https://example.com/rajesh.jpg',
      lastLogin: '2025-10-26T18:00:00Z',
      isActive: true,
      settings: { theme: 'light', notifications: true },
    }
  ],
  teachers: [
    {
      id: 'T001',
      userName: 'rajesh.sharma',
      email: 'rajesh.sharma@example.com',
      createdAt: '2025-10-01T09:00:00Z',
      updatedAt: '2025-10-27T09:00:00Z',
      role: 'teacher',
      profilePictureUrl: 'https://example.com/rajesh.jpg',
      lastLogin: '2025-10-26T18:00:00Z',
      isActive: true,
      settings: { theme: 'light', notifications: true },
      subject: 'Mathematics',
       classes: [
      { id: 'C101', isAttendanceMarkedForToday: false, completed: true },
      { id: 'C102', isAttendanceMarkedForToday: false, completed: false }
    ]
    },
    {
      id: 'evZsz5wKWlh8mkIJUtTZEftrCBj2',
      userName: 'guest.teaceher',
      email: 'guestteacher@attendify.ar',
      role: 'teacher',
      profilePictureUrl: 'https://example.com/rajesh.jpg',
      lastLogin: '2025-10-26T18:00:00Z',
      isActive: true,
      settings: { theme: 'light', notifications: true },
      subject: 'Mathematics',
       classes: [
      { id: 'C101', isAttendanceMarkedForToday: false, completed: true },
      { id: 'C102', isAttendanceMarkedForToday: false, completed: false }
    ]
    },
    {
      id: 'T002',
      userName: 'priya.mehta',
      email: 'priya.mehta@example.com',
      createdAt: '2025-10-02T09:00:00Z',
      updatedAt: '2025-10-27T09:00:00Z',
      role: 'teacher',
       classes: [
      { id: 'C103', isAttendanceMarkedForToday: false, completed: false }
    ],
      profilePictureUrl: 'https://example.com/priya.jpg',
      lastLogin: '2025-10-25T17:30:00Z',
      isActive: true,
      settings: { theme: 'dark', notifications: true },
      subject: 'Science',
    },
    {
      id: 'T003',
      userName: 'anil.verma',
      email: 'anil.verma@example.com',
      createdAt: '2025-10-03T09:00:00Z',
      updatedAt: '2025-10-27T09:00:00Z',
      role: 'teacher',
        classes: [
      { id: 'C104', isAttendanceMarkedForToday: false, completed: true }
    ],
      profilePictureUrl: 'https://example.com/anil.jpg',
      lastLogin: '2025-10-26T16:45:00Z',
      isActive: true,
      settings: { theme: 'light', notifications: false },
      subject: 'English',
    }
  ],
  classes: [
    {
      id: 'C101',
      className: '8 - A',
      teacherId: 'T001',
      students: ['S001', 'S002', 'S003', 'S004'],
      subjects: [
        { name: 'Mathematics', code: 'MATH101' },
        { name: 'Science', code: 'SCI101' },
        { name: 'English', code: 'ENG101' },
      ]
    },
    {
      id: 'C102',
      className: '9 - B',
      teacherId: 'T001',
      students: ['S005', 'S006', 'S007', 'S008'],
      subjects: [
        { name: 'Mathematics', code: 'MATH101' },
        { name: 'Science', code: 'SCI101' },
        { name: 'English', code: 'ENG101' },
      ]
    },
    {
      id: 'C103',
      className: '7 - C',
      teacherId: 'T002',
      students: ['S009', 'S010', 'S011', 'S012'],
      subjects: [
        { name: 'Mathematics', code: 'MATH101' },
        { name: 'Science', code: 'SCI101' },
        { name: 'English', code: 'ENG101' },
      ]
    },
    {
      id: 'C104',
      className: '10 - A',
      teacherId: 'T003',
      students: ['S013', 'S014', 'S015', 'S016'],
      subjects: [
        { name: 'Mathematics', code: 'MATH101' },
        { name: 'Science', code: 'SCI101' },
        { name: 'English', code: 'ENG101' },
      ]
    }
  ],
  students: [
  {
    id: 'S001',
    name: 'Aarav Patel',
    userName: 'aarav.patel',
    email: 'aarav.patel@example.com',
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-10-27T09:00:00Z',
    role: 'student',
    classes: ['C101'],
    profilePictureUrl: 'https://kbxvquzdkuvqshyarpgj.supabase.co/storage/v1/object/sign/attendify_assets/face1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGVkYjkzZS02NTNiLTQ2Y2UtYTY5MS1hNDhiNDliY2ZhOWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdHRlbmRpZnlfYXNzZXRzL2ZhY2UxLmpwZyIsImlhdCI6MTc2MTc2MzgxNiwiZXhwIjoxNzkzMjk5ODE2fQ.FhYFupr-GUe1-Lt01GcCr3plgd6TzChuLgiLXVYXeZw',
    lastLogin: '2025-10-26T19:00:00Z',
    isActive: true,
    settings: { theme: 'dark', notifications: true },
    rollNo: 1,
    classId: 'C101',
  },
  {
    id: 'S002',
    name: 'Ananya Gupta',
    userName: 'ananya.gupta',
    email: 'ananya.gupta@example.com',
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-10-27T09:00:00Z',
    role: 'student',
    classes: ['C101'],
    isActive: true,
    rollNo: 2,
    classId: 'C101',
    settings: { theme: 'light', notifications: true },
  },
  {
    id: 'S003',
    name: 'Rohan Kumar',
    userName: 'rohan.kumar',
    email: 'rohan.kumar@example.com',
    createdAt: '2025-09-11T10:00:00Z',
    updatedAt: '2025-10-27T09:00:00Z',
    role: 'student',
    classes: ['C101'],
    isActive: true,
    rollNo: 3,
    classId: 'C101',
    settings: { theme: 'light', notifications: false },
  },
  {
    id: 'S004',
    name: 'Isha Singh',
    userName: 'isha.singh',
    email: 'isha.singh@example.com',
    createdAt: '2025-09-12T10:00:00Z',
    updatedAt: '2025-10-27T09:00:00Z',
    role: 'student',
    classes: ['C101'],
    isActive: true,
    rollNo: 4,
    classId: 'C101',
    settings: { theme: 'dark', notifications: true },
  },
  {
    id: 'S005',
    name: 'Devansh Yadav',
    userName: 'devansh.yadav',
    email: 'devansh.yadav@example.com',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-10-27T09:00:00Z',
    role: 'student',
    classes: ['C102'],
    isActive: true,
    rollNo: 5,
    classId: 'C102',
  },
  {
    id: 'S006',
    name: 'Tanya Arora',
    userName: 'tanya.arora',
    email: 'tanya.arora@example.com',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-10-27T09:00:00Z',
    role: 'student',
    classes: ['C102'],
    isActive: true,
    rollNo: 6,
    classId: 'C102',
  },
],
  attendance: [
    // Dates converted to human-readable strings (DD-MM-YY HH:MM) and made subject-specific
    { classId: 'C101', date: '26-11-25 00:00', studentId: 'S001', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '26-11-25 00:00', studentId: 'S002', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '26-11-25 00:00', studentId: 'S003', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '26-11-25 00:00', studentId: 'S004', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '26-11-25 00:00', studentId: 'S005', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '26-11-25 00:00', studentId: 'S006', status: 'Present', subjectCode: 'MATH101' },

    { classId: 'C101', date: '25-11-25 00:00', studentId: 'S001', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '25-11-25 00:00', studentId: 'S002', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '25-11-25 00:00', studentId: 'S003', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '25-11-25 00:00', studentId: 'S004', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '25-11-25 00:00', studentId: 'S005', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '25-11-25 00:00', studentId: 'S006', status: 'Absent', subjectCode: 'MATH101' },

    { classId: 'C101', date: '24-11-25 00:00', studentId: 'S001', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '24-11-25 00:00', studentId: 'S002', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '24-11-25 00:00', studentId: 'S003', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '24-11-25 00:00', studentId: 'S004', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '24-11-25 00:00', studentId: 'S005', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '24-11-25 00:00', studentId: 'S006', status: 'Present', subjectCode: 'MATH101' },

    { classId: 'C101', date: '23-11-25 00:00', studentId: 'S001', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '23-11-25 00:00', studentId: 'S002', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '23-11-25 00:00', studentId: 'S003', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '23-11-25 00:00', studentId: 'S004', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '23-11-25 00:00', studentId: 'S005', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '23-11-25 00:00', studentId: 'S006', status: 'Present', subjectCode: 'MATH101' },

    { classId: 'C101', date: '22-11-25 00:00', studentId: 'S001', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '22-11-25 00:00', studentId: 'S002', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '22-11-25 00:00', studentId: 'S003', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '22-11-25 00:00', studentId: 'S004', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '22-11-25 00:00', studentId: 'S005', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '22-11-25 00:00', studentId: 'S006', status: 'Present', subjectCode: 'MATH101' },

    { classId: 'C101', date: '21-11-25 00:00', studentId: 'S001', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '21-11-25 00:00', studentId: 'S002', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '21-11-25 00:00', studentId: 'S003', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '21-11-25 00:00', studentId: 'S004', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '21-11-25 00:00', studentId: 'S005', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '21-11-25 00:00', studentId: 'S006', status: 'Absent', subjectCode: 'MATH101' },

    { classId: 'C101', date: '20-11-25 00:00', studentId: 'S001', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '20-11-25 00:00', studentId: 'S002', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '20-11-25 00:00', studentId: 'S003', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '20-11-25 00:00', studentId: 'S004', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '20-11-25 00:00', studentId: 'S005', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '20-11-25 00:00', studentId: 'S006', status: 'Present', subjectCode: 'MATH101' },

    { classId: 'C101', date: '19-11-25 00:00', studentId: 'S001', status: 'Absent', subjectCode: 'MATH101' },
    { classId: 'C101', date: '19-11-25 00:00', studentId: 'S002', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '19-11-25 00:00', studentId: 'S003', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '19-11-25 00:00', studentId: 'S004', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '19-11-25 00:00', studentId: 'S005', status: 'Present', subjectCode: 'MATH101' },
    { classId: 'C101', date: '19-11-25 00:00', studentId: 'S006', status: 'Absent', subjectCode: 'MATH101' }
  ]

};
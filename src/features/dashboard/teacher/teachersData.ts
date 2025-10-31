import { Class, Student, Teacher } from "@/firebase/interfaces/user.interface";


export const teachersData: {
  teachers: Teacher[];
  classes: Class[];
  students: Student[];
    attendance: {
      [classId: string]: {
        [timestamp: string]: {
          [studentId: string]: { status: "Present" | "Absent" | "Leave" };
        };
      };
    }
  } = {
  teachers: [
    {
      id: 'T001',
      userName: 'rajesh.sharma',
      email: 'rajesh.sharma@example.com',
      password: 'hashedPass1',
      createdAt: '2025-10-01T09:00:00Z',
      updatedAt: '2025-10-27T09:00:00Z',
      role: 'teacher',
      classes: ['C101', 'C102'],
      profilePictureUrl: 'https://example.com/rajesh.jpg',
      lastLogin: '2025-10-26T18:00:00Z',
      isActive: true,
      settings: { theme: 'light', notifications: true },
      subject: 'Mathematics',
      classesAssigned: ['C101', 'C102'],
      classesCompleted: ['C101'],
      classesPending: ['C102']
    },
    {
      id: 'T002',
      userName: 'priya.mehta',
      email: 'priya.mehta@example.com',
      password: 'hashedPass2',
      createdAt: '2025-10-02T09:00:00Z',
      updatedAt: '2025-10-27T09:00:00Z',
      role: 'teacher',
      classes: ['C103'],
      profilePictureUrl: 'https://example.com/priya.jpg',
      lastLogin: '2025-10-25T17:30:00Z',
      isActive: true,
      settings: { theme: 'dark', notifications: true },
      subject: 'Science',
      classesAssigned: ['C103'],
      classesCompleted: [],
      classesPending: ['C103']
    },
    {
      id: 'T003',
      userName: 'anil.verma',
      email: 'anil.verma@example.com',
      password: 'hashedPass3',
      createdAt: '2025-10-03T09:00:00Z',
      updatedAt: '2025-10-27T09:00:00Z',
      role: 'teacher',
      classes: ['C104'],
      profilePictureUrl: 'https://example.com/anil.jpg',
      lastLogin: '2025-10-26T16:45:00Z',
      isActive: true,
      settings: { theme: 'light', notifications: false },
      subject: 'English',
      classesAssigned: ['C104'],
      classesCompleted: ['C104'],
      classesPending: []
    }
  ],
  classes: [
    {
      id: 'C101',
      className: '8 - A',
      teacherId: 'T001',
      students: ['S001', 'S002', 'S003', 'S004'],
      status: 'Completed'
    },
    {
      id: 'C102',
      className: '9 - B',
      teacherId: 'T001',
      students: ['S005', 'S006', 'S007', 'S008'],
      status: 'Ongoing'
    },
    {
      id: 'C103',
      className: '7 - C',
      teacherId: 'T002',
      students: ['S009', 'S010', 'S011', 'S012'],
      status: 'Ongoing'
    },
    {
      id: 'C104',
      className: '10 - A',
      teacherId: 'T003',
      students: ['S013', 'S014', 'S015', 'S016'],
      status: 'Completed'
    }
  ],
  students: [
  {
    id: 'S001',
    name: 'Aarav Patel',
    userName: 'aarav.patel',
    email: 'aarav.patel@example.com',
    password: 'hashedPassS1',
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
    password: 'hashedPassS2',
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
    password: 'hashedPassS3',
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
    password: 'hashedPassS4',
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
    password: 'hashedPassS5',
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
    password: 'hashedPassS6',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-10-27T09:00:00Z',
    role: 'student',
    classes: ['C102'],
    isActive: true,
    rollNo: 6,
    classId: 'C102',
  },
],
  attendance: {
    "C101": {
      "1737907200000": {  // timestamp for 2025-10-27 00:00:00 UTC
         "S001": { "status": "Present" } ,
         "S002": { "status": "Absent" } ,
         "S003": { "status": "Present" } ,
         "S004": { "status": "Present" } ,
         "S005": { "status": "Absent" } ,
         "S006": { "status": "Present" }
      },
      "1737820800000": {  // 2025-10-26
         "S001": { "status": "Absent" } ,
         "S002": { "status": "Present" } ,
         "S003": { "status": "Present" } ,
         "S004": { "status": "Present" } ,
         "S005": { "status": "Present" } ,
         "S006": { "status": "Absent" }
      },
      "1737734400000": {  // 2025-10-25
        "S001": { "status": "Present" } ,
        "S002": { "status": "Present" } ,
        "S003": { "status": "Absent" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Absent" } ,
        "S006": { "status": "Present" }
      },
      "1737648000000": { // 2025-10-24
         "S001": { "status": "Present" } ,
         "S002": { "status": "Present" } ,
         "S003": { "status": "Present" } ,
         "S004": { "status": "Absent" } ,
         "S005": { "status": "Absent" } ,
         "S006": { "status": "Present" }
      },
      "1737561600000": { // 2025-10-23
        "S001": { "status": "Absent" } ,
        "S002": { "status": "Present" } ,
        "S003": { "status": "Present" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Absent" } ,
        "S006": { "status": "Present" } 
      },
      "1737475200000": { // 2025-10-22
        "S001": { "status": "Present" } ,
        "S002": { "status": "Absent" } ,
        "S003": { "status": "Present" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Present" } ,
        "S006": { "status": "Absent" } 
      },
      "1737388800000": { // 2025-10-21
        "S001": { "status": "Present" } ,
        "S002": { "status": "Present" } ,
        "S003": { "status": "Absent" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Absent" } ,
        "S006": { "status": "Present" } 
      },
      "1737302400000": { // 2025-10-20
        "S001": { "status": "Absent" } ,
        "S002": { "status": "Present" } ,
        "S003": { "status": "Present" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Present" } ,
        "S006": { "status": "Absent" } 
      },
      "1737216000000": { // 2025-10-19
        "S001": { "status": "Present" } ,
        "S002": { "status": "Present" } ,
        "S003": { "status": "Absent" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Absent" } ,
        "S006": { "status": "Present" } 
      },
      "1737129600000": { // 2025-10-18
        "S001": { "status": "Present" } ,
        "S002": { "status": "Absent" } ,
        "S003": { "status": "Present" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Present" } ,
        "S006": { "status": "Absent" } 
      },
      "1737043200000": { // 2025-10-17
        "S001": { "status": "Absent" } ,
        "S002": { "status": "Present" } ,
        "S003": { "status": "Present" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Absent" } ,
        "S006": { "status": "Present" } 
      },
      "1736956800000": { // 2025-10-16
        "S001": { "status": "Present" } ,
        "S002": { "status": "Present" } ,
        "S003": { "status": "Absent" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Present" } ,
        "S006": { "status": "Absent" } 
      },
      "1736870400000": { // 2025-10-15
        "S001": { "status": "Present" } ,
        "S002": { "status": "Absent" } ,
        "S003": { "status": "Present" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Absent" } ,
        "S006": { "status": "Present" } 
      },
      "1736784000000": { // 2025-10-14
        "S001": { "status": "Absent" } ,
        "S002": { "status": "Present" } ,
        "S003": { "status": "Present" } ,
        "S004": { "status": "Present" } ,
        "S005": { "status": "Present" } ,
        "S006": { "status": "Absent" } 
      }
    }
  }
};
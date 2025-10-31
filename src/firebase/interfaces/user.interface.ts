/* eslint-disable @typescript-eslint/no-explicit-any */

// ===========================
// 📘 Common Interfaces
// ===========================

export interface AttendanceRecord {
    date: string;                // e.g. "2025-10-27"
    status: 'Present' | 'Absent';
}

// ===========================
// 👨‍🏫 Teacher Interface
// ===========================
export interface Teacher {
    id: string;
    userName: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    role: 'teacher';
    classes: string[];           // Array of class IDs managed by the teacher
    profilePictureUrl?: string;
    lastLogin?: string;
    isActive: boolean;
    settings?: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };

    // Attendance system–specific
    subject: string;
    classesAssigned: string[];   // Same as `classes`, kept for clarity
    classesCompleted: string[];
    classesPending: string[];

    [key: string]: any;
}

// ===========================
// 🧑‍🎓 Student Interface
// ===========================
export interface Student {
    id: string;
    userName: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    role: 'student';
    classes: string[];           // Array of class IDs student is enrolled in
    profilePictureUrl?: string;
    lastLogin?: string;
    isActive: boolean;
    settings?: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };

    // Attendance system–specific
    rollNo: number;
    classId: string;

    [key: string]: any;
}

// ===========================
// 🏫 Class Interface
// ===========================
export interface Class {
    id: string;
    className: string;           // e.g. "Grade 8 - A"
    teacherId: string;           // Reference to Teacher.id
    students: string[];          // Array of Student IDs
    status: 'Completed' | 'Ongoing';
}
export interface Admin {
    id: string;
    userName: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    role: 'admin';
    profilePictureUrl?: string;
    lastLogin?: string;
    isActive: boolean;
    settings?: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };
    [key: string]: any;
}
/* eslint-disable @typescript-eslint/no-explicit-any */

// ===========================
// 📘 Common Interfaces
// ===========================

export interface AttendanceRecord {
    studentId: string;
    date: string;                // e.g. "2025-10-27"
    status: 'Present' | 'Absent' | 'Leave';
    classId: string;
}

// ===========================
// 👨‍🏫 Teacher Interface
// ===========================
export interface Teacher {
    id: string;
    userName: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
    role: 'teacher';
    classes: {
        id: string;
        isAttendanceMarkedForToday: boolean;
        completed: boolean;
    }[];           // Array of class IDs managed by the teacher
    profilePictureUrl?: string;
    lastLogin?: string;
    isActive: boolean;
    settings?: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };

    // Attendance system–specific
    subject: string;
    [key: string]: any;
}

// ===========================
// 🧑‍🎓 Student Interface
// ===========================
export interface Student {
    id: string;
    userName: string;
    email: string;
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
    className: string;
    teacherId: string;
    students: string[];
}
export interface Admin {
    id: string;
    userName: string;
    email: string;
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


export interface Admins {
    id: string;
    userName: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
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
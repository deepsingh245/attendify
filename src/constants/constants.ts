export const BUCKET_URL = 'https://kbxvquzdkuvqshyarpgj.supabase.co/storage/v1/object/public/attendify_assets/';

export const Collections = {
  TEACHERS: "teachers",
  STUDENTS: "students",
  CLASSES: "classes",
  ATTENDANCE: "attendance",
  ADMINS: "admins",
};

export const AttendanceStatus = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LEAVE: 'Leave',
};

export enum AuthErrorCode {
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  EMAIL_IN_USE = 'auth/email-already-in-use',
  INVALID_EMAIL = 'auth/invalid-email',
  INVALID_CREDENTIALS = 'auth/invalid-credential',
  WEAK_PASSWORD = 'auth/weak-password',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
}

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.USER_NOT_FOUND]: 'No account found with this email address.',
  [AuthErrorCode.WRONG_PASSWORD]: 'Incorrect password. Please try again.',
  [AuthErrorCode.EMAIL_IN_USE]: 'This email is already registered.',
  [AuthErrorCode.INVALID_EMAIL]: 'Please enter a valid email address.',
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Please enter a valid email address and password.',
  [AuthErrorCode.WEAK_PASSWORD]: 'Password must be at least 6 characters long.',
  [AuthErrorCode.TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',
}

export const getAuthErrorMessage = (err: unknown): string =>{
  const code = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : undefined;
  return AUTH_ERROR_MESSAGES[code as AuthErrorCode] || 'An unexpected error occurred.';
}

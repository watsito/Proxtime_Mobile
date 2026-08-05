export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'ALPHA' | 'IZIN' | 'CUTI';
export type LeaveStatus = 'PENDING' | 'DISETUJUI' | 'DITOLAK';
export type LeaveType = 'CUTI_TAHUNAN' | 'SAKIT' | 'IZIN_PRIBADI' | 'LAINNYA';

export interface User {
  id: string;
  name: string;
  nik: string;
  email: string;
  position: string;
  department: string;
  avatarUrl: string;
  branch: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;          // YYYY-MM-DD
  dayName: string;       // e.g. "Senin, 4 Ags 2026"
  clockIn: string;       // e.g. "07:45"
  clockOut?: string;     // e.g. "17:05"
  status: AttendanceStatus;
  locationName: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  typeName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
}

export interface LeaveBalance {
  remainingDays: number;
  usedDays: number;
  totalDays: number;
}

export interface AttendanceSummary {
  totalPresent: number;
  totalLate: number;
  totalLeave: number;
  shiftName: string;
  shiftTime: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface OfficeLocation {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

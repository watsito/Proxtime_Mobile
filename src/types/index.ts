export type UserRole = 'employee' | 'admin';

export type EmployeeStatus = 'active' | 'inactive' | 'wfh';

export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'CUTI' | 'ABSEN' | 'present' | 'absent' | 'late' | 'leave' | 'half_day' | 'overtime' | string;
export type AttendanceStatusType = AttendanceStatus;

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'Menunggu' | 'Disetujui' | 'Ditolak' | string;
export type RequestStatusType = LeaveStatus;

export type NotificationType = 'info' | 'warning' | 'success' | 'alert';

export type LeaveCategoryType = 'leave' | 'sick' | 'permit' | 'overtime';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  roles?: UserRole[];
  employeeId?: string;
  position: string;
  department: string;
  branch?: string;
  avatar?: string;
  avatarUrl?: string;
  photoUrl?: string;
  phone?: string;
  nik?: string;
  joinDate?: string;
  address?: string;
  autoCheckout?: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Selasa, 4 Ags 2026"
  clockIn: string; // e.g. "08:00 AM"
  clockOut?: string; // e.g. "05:00 PM"
  status: AttendanceStatus;
  locationName: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  employeeId?: string;
  employeeName?: string;
}

export interface LeaveRequest {
  id: string;
  type: string; // e.g. "CUTI_TAHUNAN", "IZIN"
  typeName: string; // e.g. "Cuti Tahunan", "Izin Telat Datang"
  subtype?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  duration?: string;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  employeeId?: string;
  employeeName?: string;
  employeeAvatar?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  specialLeaveUsed?: number;
  specialLeaveTotal?: number;
  sickLeaveUsed?: number;
  sickLeaveTotal?: number;
  permitUsed?: number;
  permitTotal?: number;
}

export interface AttendanceSummary {
  presentThisMonth?: number;
  lateThisMonth?: number;
  leaveRemaining?: number;
  totalPresent?: number;
  totalLate?: number;
  totalLeave?: number;
  shiftName?: string;
  shiftTime?: string;
  overtimeHours?: number;
  todayStatus?: 'CHECKED_IN' | 'CHECKED_OUT' | 'NOT_CHECKED_IN';
  todayClockIn?: string;
  todayClockOut?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt?: string;
  time?: string;
  read: boolean;
  type: NotificationType;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface OfficeLocation {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface ActivityFeedItem {
  id: string;
  employeeName: string;
  avatarInitial: string;
  action: 'Check-in' | 'Check-out';
  time: string;
  location: string;
}

export interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: EmployeeStatus;
  avatarInitial: string;
  joinDate: string;
}

export interface CompanySettings {
  companyName: string;
  companyEmail: string;
  phone: string;
  address: string;
  timeZone: string;
}

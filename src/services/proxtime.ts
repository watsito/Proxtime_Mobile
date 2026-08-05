import { User, AttendanceRecord, LeaveRequest, LeaveBalance, AttendanceSummary, FaqItem, OfficeLocation, NotificationItem } from '../types';
import {
  INITIAL_USER,
  INITIAL_OFFICE,
  INITIAL_SUMMARY,
  INITIAL_ATTENDANCE_HISTORY,
  INITIAL_LEAVE_BALANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_FAQS,
  INITIAL_NOTIFICATIONS,
} from './mockData';

class ProxTimeService {
  private user: User = INITIAL_USER;
  private office: OfficeLocation = INITIAL_OFFICE;
  private summary: AttendanceSummary = INITIAL_SUMMARY;
  private history: AttendanceRecord[] = [...INITIAL_ATTENDANCE_HISTORY];
  private leaveBalance: LeaveBalance = INITIAL_LEAVE_BALANCE;
  private leaveRequests: LeaveRequest[] = [...INITIAL_LEAVE_REQUESTS];
  private faqs: FaqItem[] = INITIAL_FAQS;
  private notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

  // --- Auth Service ---
  async login(nikOrEmail: string, password: String): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!nikOrEmail || !password) {
      throw new Error('NIK/Email dan Password wajib diisi');
    }
    return this.user;
  }

  async getUserProfile(): Promise<User> {
    return this.user;
  }

  async getOfficeLocation(): Promise<OfficeLocation> {
    return this.office;
  }

  // --- Notification Service ---
  async getNotifications(): Promise<NotificationItem[]> {
    return [...this.notifications];
  }

  async markNotificationsRead(): Promise<void> {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  // --- Attendance Service ---
  async getTodayAttendance(): Promise<AttendanceRecord | null> {
    const today = new Date().toISOString().split('T')[0];
    const record = this.history.find((item) => item.date === today);
    return record || null;
  }

  async getAttendanceHistory(): Promise<AttendanceRecord[]> {
    return [...this.history];
  }

  async getAttendanceSummary(): Promise<AttendanceSummary> {
    return this.summary;
  }

  async submitCheckIn(photoUri: string, latitude: number, longitude: number, notes?: string): Promise<AttendanceRecord> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const formattedDay = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);
    const status = isLate ? 'TERLAMBAT' : 'HADIR';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: todayStr,
      dayName: formattedDay,
      clockIn: timeStr,
      clockOut: undefined,
      status,
      locationName: 'Proxsis HQ - Cyber 2 Tower (Terverifikasi GPS)',
      latitude,
      longitude,
      photoUrl: photoUri,
      notes: notes || (isLate ? 'Terlambat masuk' : 'Absen masuk tepat waktu'),
    };

    const existingIndex = this.history.findIndex((item) => item.date === todayStr);
    if (existingIndex >= 0) {
      this.history[existingIndex] = { ...this.history[existingIndex], ...newRecord };
    } else {
      this.history.unshift(newRecord);
      this.summary.totalPresent += 1;
      if (isLate) this.summary.totalLate += 1;
    }

    // Add notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Absen Masuk Berhasil',
      message: `Anda berhasil absen masuk pukul ${timeStr}.`,
      time: 'Baru saja',
      read: false,
      type: 'success',
    });

    return newRecord;
  }

  async submitCheckOut(latitude: number, longitude: number): Promise<AttendanceRecord> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const existingIndex = this.history.findIndex((item) => item.date === todayStr);
    if (existingIndex < 0) {
      throw new Error('Belum melakukan absen masuk hari ini');
    }

    const updatedRecord: AttendanceRecord = {
      ...this.history[existingIndex],
      clockOut: timeStr,
    };

    this.history[existingIndex] = updatedRecord;

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Absen Pulang Berhasil',
      message: `Anda berhasil absen pulang pukul ${timeStr}. Terima kasih atas kerja hari ini!`,
      time: 'Baru saja',
      read: false,
      type: 'info',
    });

    return updatedRecord;
  }

  // --- Leave Service ---
  async getLeaveBalance(): Promise<LeaveBalance> {
    return { ...this.leaveBalance };
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return [...this.leaveRequests];
  }

  async submitLeaveRequest(
    type: 'CUTI_TAHUNAN' | 'SAKIT' | 'IZIN_PRIBADI' | 'LAINNYA',
    startDate: string,
    endDate: string,
    reason: string
  ): Promise<LeaveRequest> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const typeNames: Record<string, string> = {
      CUTI_TAHUNAN: 'Cuti Tahunan',
      SAKIT: 'Izin Sakit',
      IZIN_PRIBADI: 'Izin Pribadi',
      LAINNYA: 'Izin Lainnya',
    };

    const newRequest: LeaveRequest = {
      id: `lve-${Date.now()}`,
      type,
      typeName: typeNames[type] || 'Izin',
      startDate,
      endDate,
      durationDays: 1,
      reason,
      status: 'PENDING',
      submittedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    this.leaveRequests.unshift(newRequest);
    return newRequest;
  }

  // --- Help Service ---
  async getFaqs(): Promise<FaqItem[]> {
    return [...this.faqs];
  }
}

export const proxtimeService = new ProxTimeService();

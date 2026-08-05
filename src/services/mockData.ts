import { User, AttendanceRecord, LeaveRequest, LeaveBalance, AttendanceSummary, FaqItem, OfficeLocation, NotificationItem } from '../types';

export const INITIAL_USER: User = {
  id: 'usr-1',
  name: 'Raihan Arianto',
  nik: 'PX-2026-0891',
  email: 'raihan.arianto@proxsis.com',
  position: 'Senior Software Engineer',
  department: 'Technology & Digital Innovation',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  branch: 'Head Office - Proxsis Tower Jakarta',
};

export const INITIAL_OFFICE: OfficeLocation = {
  name: 'Proxsis HQ - Cyber 2 Tower Lt. 12',
  latitude: -6.2241,
  longitude: 106.8322,
  radiusMeters: 50,
};

export const INITIAL_SUMMARY: AttendanceSummary = {
  totalPresent: 18,
  totalLate: 2,
  totalLeave: 1,
  shiftName: 'Shift Reguler (Senin - Jumat)',
  shiftTime: '08:00 - 17:00 WIB',
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pengajuan Cuti Disetujui',
    message: 'Pengajuan Cuti Tahunan Anda untuk tanggal 18 - 19 Ags 2026 telah disetujui oleh HR.',
    time: '10 menit yang lalu',
    read: false,
    type: 'success',
  },
  {
    id: 'notif-2',
    title: 'Pengingat Jam Masuk Kerja',
    message: 'Shift reguler Anda dimulai pukul 08:00 WIB. Pastikan melakukan check-in tepat waktu.',
    time: '2 jam yang lalu',
    read: false,
    type: 'info',
  },
  {
    id: 'notif-3',
    title: 'Pengumuman Libur Nasional',
    message: 'Kantor Proxsis libur nasional pada tanggal 17 Agustus 2026.',
    time: 'Kemarin',
    read: true,
    type: 'info',
  },
];

export const INITIAL_ATTENDANCE_HISTORY: AttendanceRecord[] = [
  {
    id: 'att-100',
    date: '2026-08-03',
    dayName: 'Senin, 3 Ags 2026',
    clockIn: '07:55 WIB',
    clockOut: '17:08 WIB',
    status: 'HADIR',
    locationName: 'Proxsis HQ - Cyber 2 Tower',
    latitude: -6.2241,
    longitude: 106.8322,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    notes: 'Absen normal',
  },
  {
    id: 'att-099',
    date: '2026-07-31',
    dayName: 'Jumat, 31 Jul 2026',
    clockIn: '08:14 WIB',
    clockOut: '17:15 WIB',
    status: 'TERLAMBAT',
    locationName: 'Proxsis HQ - Cyber 2 Tower',
    latitude: -6.2241,
    longitude: 106.8322,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    notes: 'Macet Tol Dalam Kota (+14 menit)',
  },
  {
    id: 'att-098',
    date: '2026-07-30',
    dayName: 'Kamis, 30 Jul 2026',
    clockIn: '07:42 WIB',
    clockOut: '17:02 WIB',
    status: 'HADIR',
    locationName: 'Proxsis HQ - Cyber 2 Tower',
    latitude: -6.2241,
    longitude: 106.8322,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'att-097',
    date: '2026-07-29',
    dayName: 'Rabu, 29 Jul 2026',
    clockIn: '07:50 WIB',
    clockOut: '17:30 WIB',
    status: 'HADIR',
    locationName: 'Proxsis HQ - Cyber 2 Tower',
    latitude: -6.2241,
    longitude: 106.8322,
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  },
];

export const INITIAL_LEAVE_BALANCE: LeaveBalance = {
  remainingDays: 9,
  usedDays: 3,
  totalDays: 12,
};

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lve-201',
    type: 'CUTI_TAHUNAN',
    typeName: 'Cuti Tahunan',
    startDate: '18 Ags 2026',
    endDate: '19 Ags 2026',
    durationDays: 2,
    reason: 'Libur keluarga setelah Hari Kemerdekaan',
    status: 'DISETUJUI',
    submittedAt: '01 Ags 2026',
  },
  {
    id: 'lve-200',
    type: 'SAKIT',
    typeName: 'Izin Sakit',
    startDate: '14 Jul 2026',
    endDate: '14 Jul 2026',
    durationDays: 1,
    reason: 'Demam dan flu (Surat dokter terlampir)',
    status: 'DISETUJUI',
    submittedAt: '14 Jul 2026',
  },
];

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Absensi & Geofencing',
    question: 'Bagaimana jika sistem mendeteksi saya di luar jangkauan lokasi kantor?',
    answer: 'Pastikan fitur GPS lokasi pada HP Anda telah aktif dan berada dalam radius 50 meter dari titik kantor Proxsis. Jika Anda bertugas di luar kantor, minta persetujuan atasan terlebih dahulu.',
  },
  {
    id: 'faq-2',
    category: 'Absensi & Geofencing',
    question: 'Mengapa kamera gagal mengambil foto selfie saat absen?',
    answer: 'Pastikan aplikasi ProxTime diberikan izin akses kamera di pengaturan smartphone Anda. Jangan lupa berada di area dengan pencahayaan yang cukup.',
  },
  {
    id: 'faq-3',
    category: 'Cuti & Perizinan',
    question: 'Berapa hari sebelum pelaksanaan pengajuan cuti harus dibuat?',
    answer: 'Pengajuan Cuti Tahunan sebaiknya diajukan minimal H-3 kerja sebelum tanggal pelaksanaannya agar atasan dapat melakukan approval.',
  },
  {
    id: 'faq-4',
    category: 'Akun & Profil',
    question: 'Bagaimana cara memperbarui data profil atau foto?',
    answer: 'Data profil seperti NIK, Jabatan, dan Departemen dikelola oleh Tim HR. Untuk perubahan data resmi, silakan hubungi Helpdesk HR Proxsis.',
  },
];

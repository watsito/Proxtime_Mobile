import {
  ActivityFeedItem,
  LeaveRequest,
  EmployeeItem,
  CompanySettings,
  LeaveBalance,
} from '../types';

export const INITIAL_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: 'act-1',
    employeeName: 'Vlosa Rayhan Pratama',
    avatarInitial: 'VR',
    action: 'Check-out',
    time: '17:27',
    location: 'Kantor Pusat',
  },
  {
    id: 'act-2',
    employeeName: 'Muhammad Raihan Ramadhan',
    avatarInitial: 'MR',
    action: 'Check-out',
    time: '17:26',
    location: 'Kantor Pusat',
  },
  {
    id: 'act-3',
    employeeName: 'Russel Haviz',
    avatarInitial: 'RH',
    action: 'Check-out',
    time: '17:24',
    location: 'Jalan Tahi...',
  },
  {
    id: 'act-4',
    employeeName: 'Fikhaar Hafiidz Ramadhan',
    avatarInitial: 'FH',
    action: 'Check-out',
    time: '17:18',
    location: 'Kantor Pusat',
  },
  {
    id: 'act-5',
    employeeName: 'Heru Rizky Fajar',
    avatarInitial: 'HR',
    action: 'Check-out',
    time: '17:07',
    location: 'Margahayu...',
  },
  {
    id: 'act-6',
    employeeName: 'Denish Twidovant',
    avatarInitial: 'DT',
    action: 'Check-out',
    time: '17:06',
    location: 'Kantor Pusat',
  },
];

export const INITIAL_ADMIN_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-101',
    type: 'IZIN',
    typeName: 'Izin',
    subtype: 'Izin Wfh',
    startDate: '6 Agu 2026',
    endDate: '6 Agu 2026',
    durationDays: 1,
    duration: '1 hari',
    reason: 'Wfh',
    status: 'Menunggu',
    submittedAt: '5 Agu 2026',
    employeeId: 'emp-001',
    employeeName: 'Daryl Naufal Haidar',
    employeeAvatar: 'DH',
  },
  {
    id: 'req-102',
    type: 'IZIN',
    typeName: 'Izin',
    subtype: 'Izin Tambahan',
    startDate: '4 Agu 2026',
    endDate: '4 Agu 2026',
    durationDays: 1,
    duration: '1 hari',
    reason: 'izin',
    status: 'Disetujui',
    submittedAt: '4 Agu 2026',
    employeeId: 'emp-002',
    employeeName: 'tes2',
    employeeAvatar: 'T2',
  },
];

export const INITIAL_EMPLOYEES_LIST: EmployeeItem[] = [
  {
    id: 'emp-001',
    name: 'Muhammad Raihan Ramadhan',
    email: 'muhammad.ramadhan@proxsis.co.id',
    phone: '+62 812-3456-7890',
    position: 'Senior Software Engineer',
    department: 'Technology & Digital Innovation',
    status: 'active',
    avatarInitial: 'MR',
    joinDate: '1 Jan 2024',
  },
  {
    id: 'emp-002',
    name: 'Vlosa Rayhan Pratama',
    email: 'vlosa.rayhan@proxsis.co.id',
    phone: '+62 813-9876-5432',
    position: 'UI/UX Designer',
    department: 'Product & Design',
    status: 'active',
    avatarInitial: 'VR',
    joinDate: '15 Feb 2024',
  },
  {
    id: 'emp-003',
    name: 'Daryl Naufal Haidar',
    email: 'daryl.haidar@proxsis.co.id',
    phone: '+62 815-5555-1234',
    position: 'Backend Developer',
    department: 'Technology & Digital Innovation',
    status: 'wfh',
    avatarInitial: 'DH',
    joinDate: '1 Mar 2024',
  },
  {
    id: 'emp-004',
    name: 'Russel Haviz',
    email: 'russel.haviz@proxsis.co.id',
    phone: '+62 817-4444-9999',
    position: 'QA Automation Engineer',
    department: 'Quality Assurance',
    status: 'active',
    avatarInitial: 'RH',
    joinDate: '10 Apr 2024',
  },
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'PT. Maju Sejahtera',
  companyEmail: 'info@majusejahtera.com',
  phone: '+62 21 1234 5678',
  address: 'Jl. Sudirman No. 123, Jakarta',
  timeZone: 'Asia/Jakarta (WIB)',
};

class AdminService {
  private activityFeed: ActivityFeedItem[] = [...INITIAL_ACTIVITY_FEED];
  private leaveRequests: LeaveRequest[] = [...INITIAL_ADMIN_LEAVE_REQUESTS];
  private employees: EmployeeItem[] = [...INITIAL_EMPLOYEES_LIST];
  private settings: CompanySettings = { ...INITIAL_COMPANY_SETTINGS };

  async getActivityFeed(): Promise<ActivityFeedItem[]> {
    return [...this.activityFeed];
  }

  async getAdminLeaveRequests(): Promise<LeaveRequest[]> {
    return [...this.leaveRequests];
  }

  async approveLeaveRequest(id: string): Promise<void> {
    this.leaveRequests = this.leaveRequests.map((req) =>
      req.id === id ? { ...req, status: 'Disetujui' } : req
    );
  }

  async rejectLeaveRequest(id: string): Promise<void> {
    this.leaveRequests = this.leaveRequests.map((req) =>
      req.id === id ? { ...req, status: 'Ditolak' } : req
    );
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    this.leaveRequests = this.leaveRequests.filter((req) => req.id !== id);
  }

  async getEmployees(): Promise<EmployeeItem[]> {
    return [...this.employees];
  }

  async getCompanySettings(): Promise<CompanySettings> {
    return { ...this.settings };
  }

  async updateCompanySettings(newSettings: Partial<CompanySettings>): Promise<CompanySettings> {
    this.settings = { ...this.settings, ...newSettings };
    return { ...this.settings };
  }
}

export const adminService = new AdminService();

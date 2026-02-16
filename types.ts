
export type Role = 'MANAGER' | 'SUPERVISOR' | 'EMPLOYEE';

export interface UserPermissions {
  viewDashboard: boolean;
  viewTasks: boolean;
  viewAttendance: boolean;
  viewSchedule: boolean;
  viewReporting: boolean;
  viewInventory: boolean;
  viewOrders: boolean;
  viewAbsences: boolean;
  viewUsers: boolean;
  viewSecurity: boolean;
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  tz: string; // Internal ID
  phone: string; // Login field
  email: string; // Login field
  role: Role;
  avatar: string;
  onboarded: boolean;
  password?: string;
  firstTimePassword?: string;
  passwordChanged: boolean; // Mandatory password change flag
  canAssignTasks?: boolean;
  permissions?: UserPermissions;
}

export type ProofType = 'none' | 'photo' | 'video';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  createdBy: string; // User ID who created it
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'rejected' | 'pending_manager_approval';
  priority: 'low' | 'medium' | 'high';
  proofRequired: ProofType;
  proofUrl?: string;
  dueDate: string;
  isRecurring: boolean;
  completionLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  completionTimestamp?: string;
}

export interface IssueReport {
  id: string;
  reportedBy: string; // User ID (Supervisor)
  type: 'employee_issue' | 'shortage' | 'technical' | 'monthly_summary' | 'staffing_shortage';
  description: string;
  date: string;
  targetUserId?: string; // Manual name input as requested
  severity: 'low' | 'medium' | 'high';
}

export interface Shift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  position: string;
}

export interface ConnectionEvent {
  id: string;
  userId: string;
  userName: string;
  type: 'login' | 'logout' | 'clock_in' | 'clock_out';
  timestamp: string;
  location?: { lat: number; lng: number };
}

export interface AbsenceRequest {
  id: string;
  userId: string;
  type: 'vacation' | 'sick' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  startDate: string;
  endDate: string;
  reason: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockInLocation?: { lat: number; lng: number };
  clockOut?: string;
  clockOutLocation?: { lat: number; lng: number };
}

export interface InventoryItem {
  id: string;
  name: string;
  status: 'available' | 'low' | 'out_of_stock';
  category: string;
  lastReportedBy?: string;
}

export interface EquipmentOrder {
  id: string;
  itemName: string;
  quantity: number;
  status: 'pending' | 'ordered' | 'received';
  date: string;
  priceEstimate?: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  shifts: Shift[];
  absences: AbsenceRequest[];
  attendance: TimeEntry[];
  inventory: InventoryItem[];
  orders: EquipmentOrder[];
  reports: IssueReport[];
  connectionEvents: ConnectionEvent[];
}

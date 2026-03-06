// Shared types for the v2 schedule system

export interface Shift {
  id: string;
  userId: string;
  branchId: string;
  position: string;
  startTime: string;
  endTime: string;
  title?: string;
  notes?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
    username?: string;
    position?: string;
    branchId?: string;
  };
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  position?: string;
  branchId?: string;
  role?: string;
  username?: string;
  isActive?: boolean;
}

export interface TimeOffRequest {
  id: string;
  userId: string;
  userName?: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
  requestedAt: string;
  approvedBy?: string;
  approvalDate?: string;
}

export interface ShiftTrade {
  id: string;
  requesterId: string;
  targetUserId: string;
  shiftId: string;
  status: string;
  reason: string;
  createdAt: string;
  fromUserId?: string;
  toUserId?: string;
  requester?: { firstName: string; lastName: string };
  targetUser?: { firstName: string; lastName: string };
  fromUser?: { firstName: string; lastName: string };
  toUser?: { firstName: string; lastName: string };
  shift?: { date: string; startTime: string; endTime: string };
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  year: number;
  workAllowed: boolean;
  notes: string | null;
  payRule?: { worked: string; notWorked: string };
}

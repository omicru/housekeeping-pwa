export type Role = 'supervisor' | 'cameriera' | 'facchino';

export type RoomType = 'singola' | 'doppia' | 'tripla' | 'quadrupla';

export type HousekeepingStatus =
  | 'partenza'
  | 'fermata'
  | 'occupata'
  | 'gia_pulita'
  | 'fuori_servizio'
  | 'ispezione'
  | 'vip'
  | 'urgente';

export type WorkState = 'da_fare' | 'in_corso' | 'completata';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
}

export interface DailyRoomAssignment {
  id: string;
  date: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  housekeepingStatus: HousekeepingStatus;
  peopleCount: 1 | 2 | 3 | 4;
  extraBed: boolean;
  balcony: boolean;
  specialNotes?: string;
  supervisorNote?: string;
  assignedUserId: string;
  modified: boolean;
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
  lastUpdatedAt: string;
  workflowStatus: WorkState;
}

export interface FacchinoTask {
  id: string;
  date: string;
  title: string;
  zone: string;
  priority: 'bassa' | 'media' | 'alta';
  suggestedTime: string;
  status: Exclude<WorkState, 'completata'> | 'fatto';
  note?: string;
  assignedUserId: string;
  updatedAt: string;
  completedBy?: string;
}

export interface LinenEntry {
  id: string;
  roomAssignmentId: string;
  userId: string;
  createdAt: string;
  federe: number;
  lenzuolo: number;
  coprilenzuolo: number;
  asciugamaniViso: number;
  asciugamaniGrandi: number;
  asciugamaniBidet: number;
}

export interface IssueReport {
  id: string;
  date: string;
  createdBy: string;
  roomAssignmentId?: string;
  taskId?: string;
  category:
    | 'manutenzione'
    | 'minibar'
    | 'biancheria_mancante'
    | 'cliente_in_camera'
    | 'camera_non_accessibile'
    | 'sporco_anomalo'
    | 'richiesta_supervisor'
    | 'altro';
  note?: string;
  createdAt: string;
}

export interface AppSettings {
  mandatoryLinenOnComplete: boolean;
}

export interface ActivityLog {
  id: string;
  createdAt: string;
  userId: string;
  action: string;
  targetType: 'room' | 'task' | 'issue' | 'workday' | 'setting';
  targetId: string;
  detail: string;
}

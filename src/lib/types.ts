export type Role = 'supervisor' | 'cameriera' | 'facchino';

export type RoomType = 'doppia' | 'tripla' | 'quadrupla';

export type RoomWorkStatus = 'da_fare' | 'in_corso' | 'completata';

export type FacchinoTaskStatus = 'da_fare' | 'in_corso' | 'completata';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
}

export interface HotelRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  beds: 2 | 3 | 4;
}

export interface DailyRoomAssignment {
  id: string;
  date: string;
  roomId: string;
  assignedCamerieraId?: string;
  status: RoomWorkStatus;
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
  updatedAt: string;
  supervisorNote?: string;
}

export interface LinenUsage {
  federe: number;
  lenzuolo: number;
  coprilenzuolo: number;
  asciugamaniViso: number;
  asciugamaniGrandi: number;
  asciugamaniBidet: number;
}

export interface MinibarUsage {
  acquaNaturale: number;
  acquaFrizzante: number;
  cocaCola: number;
  estathe: number;
  fanta: number;
  succo: number;
  snackDolce: number;
  snackSalato: number;
  prosecco: number;
}

export interface RoomCompletion {
  id: string;
  assignmentId: string;
  roomId: string;
  date: string;
  userId: string;
  linen: LinenUsage;
  minibar: MinibarUsage;
  createdAt: string;
}

export interface FacchinoTask {
  id: string;
  date: string;
  title: string;
  area: string;
  priority: 'bassa' | 'media' | 'alta';
  assignedFacchinoId: string;
  status: FacchinoTaskStatus;
  updatedAt: string;
}

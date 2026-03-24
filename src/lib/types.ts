export type Role = 'supervisor' | 'cameriera' | 'facchino';

export type RoomType = 'doppia' | 'tripla' | 'quadrupla';

export type WorkdayStatus = 'attivo' | 'chiuso';

export type RoomWorkStatus = 'da_fare' | 'in_corso' | 'completata';

export type FacchinoTaskStatus = 'da_fare' | 'in_corso' | 'completata';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface HotelRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  peopleCapacity: 2 | 3 | 4;
  hasMinibar: boolean;
  isActive: boolean;
}

export interface Workday {
  id: string;
  workDate: string;
  status: WorkdayStatus;
  createdBy: string;
  createdAt: string;
}

export interface DailyRoomAssignment {
  id: string;
  workdayId: string;
  roomId: string;
  assignedCamerieraId?: string;
  status: RoomWorkStatus;
  housekeepingStatus: string;
  peopleCount: number;
  extraBed: boolean;
  balcony: boolean;
  urgent: boolean;
  vip: boolean;
  supervisorNote?: string;
  updatedAt: string;
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
  workdayId: string;
  title: string;
  area: string;
  priority: 'bassa' | 'media' | 'alta';
  suggestedTime?: string;
  assignedFacchinoId: string;
  status: FacchinoTaskStatus;
  note?: string;
  updatedAt: string;
}

export interface IssueReport {
  id: string;
  workdayId: string;
  category: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export const emptyLinenUsage = (): LinenUsage => ({
  federe: 0,
  lenzuolo: 0,
  coprilenzuolo: 0,
  asciugamaniViso: 0,
  asciugamaniGrandi: 0,
  asciugamaniBidet: 0
});

export const emptyMinibarUsage = (): MinibarUsage => ({
  acquaNaturale: 0,
  acquaFrizzante: 0,
  cocaCola: 0,
  estathe: 0,
  fanta: 0,
  succo: 0,
  snackDolce: 0,
  snackSalato: 0,
  prosecco: 0
});

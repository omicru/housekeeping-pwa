import { AppUser, DailyRoomAssignment, FacchinoTask, HotelRoom, RoomCompletion, emptyLinenUsage, emptyMinibarUsage } from '../lib/types';

// File mantenuto solo come riferimento storico V1.5 locale.
// L'app ora usa persistenza reale Supabase.
export const demoUsers: AppUser[] = [];
export const demoRooms: HotelRoom[] = [];
export const demoAssignments: DailyRoomAssignment[] = [];
export const demoCompletions: RoomCompletion[] = [];
export const demoFacchinoTasks: FacchinoTask[] = [];

export { emptyLinenUsage, emptyMinibarUsage };

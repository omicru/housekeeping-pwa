import { AppUser, DailyRoomAssignment, FacchinoTask, HotelRoom, LinenUsage, MinibarUsage, RoomCompletion } from '../lib/types';

const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();

export const demoUsers: AppUser[] = [
  { id: 'sup-1', email: 'supervisor@hotel.it', fullName: 'Giulia Bianchi', role: 'supervisor', isActive: true },
  { id: 'cam-1', email: 'anna@hotel.it', fullName: 'Anna Rossi', role: 'cameriera', isActive: true },
  { id: 'cam-2', email: 'maria@hotel.it', fullName: 'Maria Esposito', role: 'cameriera', isActive: true },
  { id: 'cam-3', email: 'elisa@hotel.it', fullName: 'Elisa Verdi', role: 'cameriera', isActive: true },
  { id: 'fac-1', email: 'paolo@hotel.it', fullName: 'Paolo Conti', role: 'facchino', isActive: true },
  { id: 'fac-2', email: 'sara@hotel.it', fullName: 'Sara Riva', role: 'facchino', isActive: true }
];

const tripleRooms = new Set(['101', '103', '104', '201', '203', '204', '301', '303', '304', '401', '403', '404']);
const quadrupleRooms = new Set(['172', '604']);

const floorRoomNumbers: Record<number, string[]> = {
  0: ['170', '171', '172', '173', '174'],
  1: Array.from({ length: 31 }, (_, i) => String(101 + i)).filter((room) => room !== '113' && room !== '117'),
  2: Array.from({ length: 31 }, (_, i) => String(201 + i)).filter((room) => room !== '213' && room !== '217'),
  3: Array.from({ length: 31 }, (_, i) => String(301 + i)).filter((room) => room !== '313' && room !== '317'),
  4: Array.from({ length: 29 }, (_, i) => String(401 + i)).filter((room) => room !== '413' && room !== '417'),
  5: Array.from({ length: 19 }, (_, i) => String(501 + i)).filter((room) => room !== '513' && room !== '517'),
  6: Array.from({ length: 14 }, (_, i) => String(601 + i)).filter((room) => room !== '613')
};

export const demoRooms: HotelRoom[] = Object.entries(floorRoomNumbers)
  .flatMap(([floorText, rooms]) => {
    const floor = Number(floorText);
    return rooms.map((roomNumber) => {
      if (quadrupleRooms.has(roomNumber)) {
        return { id: `room-${roomNumber}`, roomNumber, floor, roomType: 'quadrupla' as const, beds: 4 as const };
      }
      if (tripleRooms.has(roomNumber)) {
        return { id: `room-${roomNumber}`, roomNumber, floor, roomType: 'tripla' as const, beds: 3 as const };
      }
      return { id: `room-${roomNumber}`, roomNumber, floor, roomType: 'doppia' as const, beds: 2 as const };
    });
  })
  .sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber));

const initialAssignedRooms = ['101', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '114', '115', '116', '118'];

export const demoAssignments: DailyRoomAssignment[] = demoRooms.map((room, index) => {
  const attId = index % 3 === 0 ? 'cam-1' : index % 3 === 1 ? 'cam-2' : 'cam-3';
  const assignedCamerieraId = initialAssignedRooms.includes(room.roomNumber) ? 'cam-1' : Number(room.roomNumber) < 420 ? attId : undefined;
  return {
    id: `assign-${room.roomNumber}`,
    date: today,
    roomId: room.id,
    assignedCamerieraId,
    status: room.roomNumber === '103' ? 'in_corso' : room.roomNumber === '104' ? 'completata' : 'da_fare',
    startedAt: room.roomNumber === '103' ? now : undefined,
    completedAt: room.roomNumber === '104' ? now : undefined,
    completedBy: room.roomNumber === '104' ? 'cam-1' : undefined,
    updatedAt: now,
    supervisorNote: room.roomNumber === '172' ? 'Quadrupla: controllare set completo e minibar.' : undefined
  };
});

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

export const demoCompletions: RoomCompletion[] = [
  {
    id: 'completion-104',
    assignmentId: 'assign-104',
    roomId: 'room-104',
    date: today,
    userId: 'cam-1',
    linen: { federe: 2, lenzuolo: 2, coprilenzuolo: 1, asciugamaniViso: 2, asciugamaniGrandi: 2, asciugamaniBidet: 2 },
    minibar: { acquaNaturale: 1, acquaFrizzante: 0, cocaCola: 0, estathe: 0, fanta: 0, succo: 1, snackDolce: 1, snackSalato: 0, prosecco: 0 },
    createdAt: now
  }
];

export const demoFacchinoTasks: FacchinoTask[] = [
  { id: 'fac-1', date: today, title: 'Ritiro biancheria sporca piani 1-2', area: 'Piani 1-2', priority: 'alta', assignedFacchinoId: 'fac-1', status: 'da_fare', updatedAt: now },
  { id: 'fac-2', date: today, title: 'Consegna culla camera 172', area: 'Piano 0', priority: 'media', assignedFacchinoId: 'fac-1', status: 'in_corso', updatedAt: now },
  { id: 'fac-3', date: today, title: 'Rifornimento magazzino minibar', area: 'Economato', priority: 'media', assignedFacchinoId: 'fac-2', status: 'da_fare', updatedAt: now },
  { id: 'fac-4', date: today, title: 'Spazzatura giornaliera piani 4-6', area: 'Piani 4-6', priority: 'alta', assignedFacchinoId: 'fac-2', status: 'completata', updatedAt: now }
];

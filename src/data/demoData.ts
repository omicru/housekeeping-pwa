import { AppSettings, AppUser, DailyRoomAssignment, FacchinoTask, LinenEntry, IssueReport } from '../lib/types';

const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();

export const demoUsers: AppUser[] = [
  { id: 'u-sup-1', email: 'supervisor@hotel.it', fullName: 'Giulia Bianchi', role: 'supervisor', isActive: true },
  { id: 'u-cam-1', email: 'anna@hotel.it', fullName: 'Anna Rossi', role: 'cameriera', isActive: true },
  { id: 'u-cam-2', email: 'maria@hotel.it', fullName: 'Maria Esposito', role: 'cameriera', isActive: true },
  { id: 'u-cam-3', email: 'luca@hotel.it', fullName: 'Luca Greco', role: 'cameriera', isActive: true },
  { id: 'u-fac-1', email: 'paolo@hotel.it', fullName: 'Paolo Conti', role: 'facchino', isActive: true },
  { id: 'u-fac-2', email: 'sara@hotel.it', fullName: 'Sara Riva', role: 'facchino', isActive: true }
];

const roomAttendants = ['u-cam-1', 'u-cam-2', 'u-cam-3'];

const missingRooms = new Set(['113', '117', '213', '217', '313', '317', '413', '417', '513', '517', '613']);
const tripleRooms = new Set(['101', '103', '104', '201', '203', '204', '301', '303', '304', '401', '403', '404']);
const quadrupleRooms = new Set(['172', '604']);

const roomStatuses: DailyRoomAssignment['housekeepingStatus'][] = ['partenza', 'fermata', 'occupata', 'gia_pulita', 'ispezione'];

function buildFloorRange(start: number, end: number): string[] {
  const rooms: string[] = [];
  for (let room = start; room <= end; room += 1) {
    const roomNumber = String(room);
    if (!missingRooms.has(roomNumber)) rooms.push(roomNumber);
  }
  return rooms;
}

const roomNumbers: string[] = [
  '170',
  '171',
  '172',
  '173',
  '174',
  ...buildFloorRange(101, 131),
  ...buildFloorRange(201, 231),
  ...buildFloorRange(301, 331),
  ...buildFloorRange(401, 429),
  ...buildFloorRange(501, 519),
  ...buildFloorRange(601, 614)
];

function roomTypeFor(roomNumber: string): DailyRoomAssignment['roomType'] {
  if (quadrupleRooms.has(roomNumber)) return 'quadrupla';
  if (tripleRooms.has(roomNumber)) return 'tripla';
  return 'doppia';
}

function peopleCountFor(roomType: DailyRoomAssignment['roomType']): 1 | 2 | 3 | 4 {
  if (roomType === 'quadrupla') return 4;
  if (roomType === 'tripla') return 3;
  if (roomType === 'singola') return 1;
  return 2;
}

function floorFor(roomNumber: string): number {
  if (roomNumber.startsWith('17')) return 0;
  return Number(roomNumber.charAt(0));
}

export const demoRooms: DailyRoomAssignment[] = roomNumbers.map((roomNumber, i) => {
  const roomType = roomTypeFor(roomNumber);
  return {
    id: `r-${roomNumber}`,
    date: today,
    roomNumber,
    floor: floorFor(roomNumber),
    roomType,
    housekeepingStatus: roomStatuses[i % roomStatuses.length],
    peopleCount: peopleCountFor(roomType),
    extraBed: i % 18 === 0,
    balcony: i % 7 === 0,
    specialNotes: i % 16 === 0 ? 'Controllare minibar e amenities' : undefined,
    assignedUserId: roomAttendants[i % roomAttendants.length],
    modified: false,
    lastUpdatedAt: now,
    workflowStatus: 'da_fare'
  };
});

function applyScenario(roomNumber: string, patch: Partial<DailyRoomAssignment>): void {
  const room = demoRooms.find((r) => r.roomNumber === roomNumber);
  if (room) Object.assign(room, patch, { modified: true, lastUpdatedAt: now });
}

applyScenario('214', { housekeepingStatus: 'fermata', supervisorNote: 'Cliente prolunga, rifare più tardi' });
applyScenario('304', { roomType: 'tripla', peopleCount: 3, supervisorNote: 'Aggiunto terzo ospite' });
applyScenario('118', { housekeepingStatus: 'urgente', specialNotes: 'Arrivo VIP ore 12:30' });
applyScenario('512', { housekeepingStatus: 'fuori_servizio', specialNotes: 'Guasto bagno, bloccare camera' });
applyScenario('409', { assignedUserId: 'u-cam-3', supervisorNote: 'Riassegnata per carico lavoro' });

export const demoTasks: FacchinoTask[] = [
  'bagni hall',
  'vetri facciata',
  'lavapavimenti hall',
  'spolvero hall e divani',
  'ritiro biancheria sporca',
  'ritiro bicchieri / piatti / posate',
  'riordino gabbie biancheria sporca',
  'spazzatura giornaliera',
  'refill shampoo / hand wash',
  'bollitori',
  'lavori extra programmati'
].map((title, i) => ({
  id: `t-${i + 1}`,
  date: today,
  title,
  zone: i < 4 ? 'Hall' : i < 8 ? 'Piani 1-3' : 'Piani 4-5',
  priority: i % 4 === 0 ? 'alta' : i % 2 === 0 ? 'media' : 'bassa',
  suggestedTime: `${8 + i}:00`,
  status: i % 5 === 0 ? 'fatto' : i % 3 === 0 ? 'in_corso' : 'da_fare',
  assignedUserId: i % 2 === 0 ? 'u-fac-1' : 'u-fac-2',
  updatedAt: now,
  note: i % 4 === 0 ? 'Priorità alta prima delle 11:00' : undefined
}));

export const demoLinenEntries: LinenEntry[] = [];

export const demoIssues: IssueReport[] = [
  {
    id: 'iss-1',
    date: today,
    createdBy: 'u-cam-2',
    roomAssignmentId: 'r-225',
    category: 'manutenzione',
    note: 'Scarico lavandino lento',
    createdAt: now
  }
];

export const demoSettings: AppSettings = {
  mandatoryLinenOnComplete: true
};

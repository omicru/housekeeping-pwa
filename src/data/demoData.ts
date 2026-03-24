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

const floors123Tripla = new Set([1, 3, 4]);
const floor4Tripla = new Set([1, 3, 4]);
const missing123 = new Set([13, 17]);
const missing45 = new Set([13, 17]);

const EXPECTED_ROOM_TOTAL = 149;

function makeRoomAssignment(roomNumber: string, index: number): DailyRoomAssignment {
  const numeric = Number(roomNumber);
  const floor = roomNumber.startsWith('17') ? 0 : Math.floor(numeric / 100);
  const unit = numeric % 100;

  let roomType: DailyRoomAssignment['roomType'] = 'doppia';
  if ((floor >= 1 && floor <= 3 && floors123Tripla.has(unit)) || (floor === 4 && floor4Tripla.has(unit))) {
    roomType = 'tripla';
  }
  if (roomNumber === '172' || roomNumber === '604') {
    roomType = 'quadrupla';
  }

  const peopleCountMap: Record<DailyRoomAssignment['roomType'], 1 | 2 | 3 | 4> = {
    singola: 1,
    doppia: 2,
    tripla: 3,
    quadrupla: 4
  };

  const statuses: DailyRoomAssignment['housekeepingStatus'][] = ['partenza', 'fermata', 'occupata', 'gia_pulita', 'ispezione'];

  return {
    id: `r-${roomNumber}`,
    date: today,
    roomNumber,
    floor,
    roomType,
    housekeepingStatus: statuses[index % statuses.length],
    peopleCount: peopleCountMap[roomType],
    extraBed: index % 19 === 0,
    balcony: floor >= 4 && index % 6 === 0,
    specialNotes: index % 21 === 0 ? 'Controllare minibar e amenities' : undefined,
    assignedUserId: roomAttendants[index % roomAttendants.length],
    modified: false,
    lastUpdatedAt: now,
    workflowStatus: 'da_fare'
  };
}

function generateRoomNumbers(): string[] {
  const rooms: string[] = ['170', '171', '172', '173', '174'];

  for (const floor of [1, 2, 3]) {
    for (let unit = 1; unit <= 31; unit += 1) {
      if (missing123.has(unit)) continue;
      rooms.push(`${floor}${unit.toString().padStart(2, '0')}`);
    }
  }

  for (let unit = 1; unit <= 29; unit += 1) {
    if (missing45.has(unit)) continue;
    rooms.push(`4${unit.toString().padStart(2, '0')}`);
  }

  for (let unit = 1; unit <= 19; unit += 1) {
    if (missing45.has(unit)) continue;
    rooms.push(`5${unit.toString().padStart(2, '0')}`);
  }

  for (let unit = 1; unit <= 14; unit += 1) {
    if (unit === 13) continue;
    rooms.push(`6${unit.toString().padStart(2, '0')}`);
  }

  return rooms;
}

export const demoRooms: DailyRoomAssignment[] = generateRoomNumbers().map((roomNumber, index) => makeRoomAssignment(roomNumber, index));

if (demoRooms.length !== EXPECTED_ROOM_TOTAL) {
  throw new Error(`Demo camere non valide: attese ${EXPECTED_ROOM_TOTAL}, trovate ${demoRooms.length}`);
}

function applyScenario(roomNumber: string, patch: Partial<DailyRoomAssignment>): void {
  const room = demoRooms.find((r) => r.roomNumber === roomNumber);
  if (room) Object.assign(room, patch, { modified: true, lastUpdatedAt: now });
}

applyScenario('214', { housekeepingStatus: 'fermata', supervisorNote: 'Cliente prolunga, rifare più tardi' });
applyScenario('307', { roomType: 'tripla', peopleCount: 3, supervisorNote: 'Aggiunto terzo ospite' });
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
  zone: i < 4 ? 'Hall' : i < 8 ? 'Piani 1-3' : 'Piani 4-6',
  priority: i % 4 === 0 ? 'alta' : i % 2 === 0 ? 'media' : 'bassa',
  suggestedTime: `${8 + i}:00`,
  status: i % 3 === 0 ? 'in_corso' : 'da_fare',
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

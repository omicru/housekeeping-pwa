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

function roomTypeFor(index: number): DailyRoomAssignment['roomType'] {
  if (index < 2) return 'quadrupla';
  if (index < 17) return 'tripla';
  if (index < 132) return 'doppia';
  return 'singola';
}

function statusFor(index: number): DailyRoomAssignment['housekeepingStatus'] {
  const statuses: DailyRoomAssignment['housekeepingStatus'][] = ['partenza', 'fermata', 'occupata', 'gia_pulita', 'ispezione'];
  return statuses[index % statuses.length];
}

export const demoRooms: DailyRoomAssignment[] = Array.from({ length: 149 }, (_, i) => {
  const roomNumber = (101 + i).toString();
  const floor = Math.min(5, Math.floor((101 + i) / 100));
  return {
    id: `r-${roomNumber}`,
    date: today,
    roomNumber,
    floor,
    roomType: roomTypeFor(i),
    housekeepingStatus: statusFor(i),
    peopleCount: (Math.min(4, (i % 4) + 1) as 1 | 2 | 3 | 4),
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
  zone: i < 4 ? 'Hall' : i < 8 ? 'Piani 1-3' : 'Piani 4-5',
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

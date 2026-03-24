import { FormEvent, useMemo, useState } from 'react';
import { useApp } from '../lib/AppContext';

const linenLabels = {
  federe: 'Federe',
  lenzuolo: 'Lenzuolo',
  coprilenzuolo: 'Coprilenzuolo',
  asciugamaniViso: 'Asciugamani viso',
  asciugamaniGrandi: 'Asciugamani grandi',
  asciugamaniBidet: 'Asciugamani bidet'
} as const;

const minibarLabels = {
  acquaNaturale: 'Acqua naturale',
  acquaFrizzante: 'Acqua frizzante',
  cocaCola: 'Coca cola',
  estathe: 'Estathe',
  fanta: 'Fanta',
  succo: 'Succo',
  snackDolce: 'Snack dolce',
  snackSalato: 'Snack salato',
  prosecco: 'Prosecco'
} as const;

export function SupervisorDashboard(): JSX.Element {
  const {
    rooms,
    assignments,
    users,
    workdays,
    activeWorkday,
    facchinoTasks,
    completions,
    createWorkday,
    setActiveWorkday,
    createFacchinoTask,
    assignRoomsBulk,
    getRoomById
  } = useApp();
  const [selectedFloor, setSelectedFloor] = useState<'tutti' | number>('tutti');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [selectedCameriera, setSelectedCameriera] = useState<string>('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [newWorkdayDate, setNewWorkdayDate] = useState(new Date().toISOString().slice(0, 10));

  const [taskTitle, setTaskTitle] = useState('');
  const [taskZone, setTaskZone] = useState('');
  const [taskPriority, setTaskPriority] = useState<'bassa' | 'media' | 'alta'>('media');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');

  const cameriere = users.filter((user) => user.role === 'cameriera');
  const facchini = users.filter((user) => user.role === 'facchino');

  const assignmentRows = useMemo(
    () =>
      assignments
        .map((assignment) => {
          const room = getRoomById(assignment.roomId);
          if (!room) return null;
          return { assignment, room };
        })
        .filter((row): row is { assignment: (typeof assignments)[number]; room: (typeof rooms)[number] } => row !== null)
        .sort((a, b) => Number(a.room.roomNumber) - Number(b.room.roomNumber)),
    [assignments, getRoomById, rooms]
  );

  const filteredRows = assignmentRows.filter(({ assignment, room }) => {
    if (selectedFloor !== 'tutti' && room.floor !== selectedFloor) return false;
    if (onlyUnassigned && assignment.assignedCamerieraId) return false;
    return true;
  });

  const roomCountsByCameriera = cameriere.map((worker) => ({
    worker,
    count: assignments.filter((assignment) => assignment.assignedCamerieraId === worker.id).length
  }));

  const toggleRoomSelection = (roomId: string): void => {
    setSelectedRooms((prev) => (prev.includes(roomId) ? prev.filter((current) => current !== roomId) : [...prev, roomId]));
  };

  const assignSelectedRooms = async (): Promise<void> => {
    if (!selectedCameriera || selectedRooms.length === 0) return;
    await assignRoomsBulk(selectedRooms, selectedCameriera);
    setSelectedRooms([]);
  };

  const onCreateTask = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!taskTitle || !taskZone || !taskAssignedTo) return;
    await createFacchinoTask({
      title: taskTitle,
      zone: taskZone,
      priority: taskPriority,
      assignedToProfileId: taskAssignedTo
    });
    setTaskTitle('');
    setTaskZone('');
  };

  const roomGroups = {
    da_fare: assignmentRows.filter(({ assignment }) => assignment.status === 'da_fare'),
    in_corso: assignmentRows.filter(({ assignment }) => assignment.status === 'in_corso'),
    completata: assignmentRows.filter(({ assignment }) => assignment.status === 'completata')
  };

  const taskGroups = {
    da_fare: facchinoTasks.filter((task) => task.status === 'da_fare'),
    in_corso: facchinoTasks.filter((task) => task.status === 'in_corso'),
    completata: facchinoTasks.filter((task) => task.status === 'completata')
  };

  const linenTotals = completions.reduce(
    (acc, completion) => {
      Object.keys(linenLabels).forEach((key) => {
        const typedKey = key as keyof typeof linenLabels;
        acc[typedKey] += completion.linen[typedKey];
      });
      return acc;
    },
    { federe: 0, lenzuolo: 0, coprilenzuolo: 0, asciugamaniViso: 0, asciugamaniGrandi: 0, asciugamaniBidet: 0 }
  );

  const minibarTotals = completions.reduce(
    (acc, completion) => {
      Object.keys(minibarLabels).forEach((key) => {
        const typedKey = key as keyof typeof minibarLabels;
        acc[typedKey] += completion.minibar[typedKey];
      });
      return acc;
    },
    { acquaNaturale: 0, acquaFrizzante: 0, cocaCola: 0, estathe: 0, fanta: 0, succo: 0, snackDolce: 0, snackSalato: 0, prosecco: 0 }
  );

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <h2 className="text-xl font-bold">Giornata di lavoro</h2>
        <p className="text-sm">Giornata attiva: {activeWorkday?.workDate ?? 'nessuna'}</p>
        <div className="grid grid-cols-2 gap-2">
          <select className="rounded-xl border p-3 text-base" value={activeWorkday?.id ?? ''} onChange={(event) => void setActiveWorkday(event.target.value)}>
            {workdays.map((workday) => (
              <option value={workday.id} key={workday.id}>
                {workday.workDate} · {workday.status}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input type="date" className="w-full rounded-xl border p-3 text-base" value={newWorkdayDate} onChange={(event) => setNewWorkdayDate(event.target.value)} />
            <button type="button" className="rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white" onClick={() => void createWorkday(newWorkdayDate)}>
              Crea
            </button>
          </div>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-bold">Assegnazione rapida camere</h2>
        <div className="grid grid-cols-2 gap-2">
          <select className="rounded-xl border p-3 text-base" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value === 'tutti' ? 'tutti' : Number(e.target.value))}>
            <option value="tutti">Tutti i piani</option>
            {[0, 1, 2, 3, 4, 5, 6].map((floor) => (
              <option key={floor} value={floor}>
                Piano {floor}
              </option>
            ))}
          </select>
          <label className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 p-3 text-sm font-semibold">
            <input type="checkbox" checked={onlyUnassigned} onChange={(event) => setOnlyUnassigned(event.target.checked)} />
            Solo non assegnate
          </label>
        </div>

        <select className="w-full rounded-xl border p-3 text-base" value={selectedCameriera} onChange={(event) => setSelectedCameriera(event.target.value)}>
          <option value="">Seleziona cameriera</option>
          {cameriere.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.fullName}
            </option>
          ))}
        </select>

        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <p className="font-semibold">Carico camere per cameriera</p>
          <ul className="mt-1 space-y-1">
            {roomCountsByCameriera.map(({ worker, count }) => (
              <li key={worker.id} className="flex justify-between">
                <span>{worker.fullName}</span>
                <span className={count >= 14 ? 'font-bold text-green-700' : 'font-bold text-amber-700'}>{count} camere</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm font-semibold">Selezionate: {selectedRooms.length}</p>

        <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {filteredRows.map(({ assignment, room }) => (
            <label key={room.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 text-sm">
              <div>
                <p className="font-semibold">Camera {room.roomNumber}</p>
                <p className="text-slate-500">
                  Piano {room.floor} · {room.roomType} · {assignment.assignedCamerieraId ? 'assegnata' : 'non assegnata'}
                </p>
              </div>
              <input type="checkbox" checked={selectedRooms.includes(room.id)} onChange={() => toggleRoomSelection(room.id)} className="h-5 w-5" />
            </label>
          ))}
        </div>

        <button type="button" className="rounded-xl bg-slate-900 py-3 text-lg font-bold text-white disabled:opacity-40" disabled={!selectedCameriera || selectedRooms.length === 0} onClick={() => void assignSelectedRooms()}>
          Assegna camere selezionate
        </button>
      </section>

      <section className="card space-y-3">
        <h3 className="text-lg font-bold">Nuovo task facchino</h3>
        <form className="space-y-2" onSubmit={(event) => void onCreateTask(event)}>
          <input className="w-full rounded-xl border p-3 text-sm" placeholder="Titolo task" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
          <input className="w-full rounded-xl border p-3 text-sm" placeholder="Zona" value={taskZone} onChange={(event) => setTaskZone(event.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <select className="rounded-xl border p-3 text-sm" value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as 'bassa' | 'media' | 'alta')}>
              <option value="bassa">Bassa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            <select className="rounded-xl border p-3 text-sm" value={taskAssignedTo} onChange={(event) => setTaskAssignedTo(event.target.value)}>
              <option value="">Assegna a...</option>
              {facchini.map((facchino) => (
                <option key={facchino.id} value={facchino.id}>
                  {facchino.fullName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white">
            Crea task
          </button>
        </form>
      </section>

      <section className="card">
        <h3 className="mb-2 text-lg font-bold">Camere oggi</h3>
        <p className="text-sm">Da fare {roomGroups.da_fare.length} · In corso {roomGroups.in_corso.length} · Completate {roomGroups.completata.length}</p>
      </section>

      <section className="card">
        <h3 className="mb-2 text-lg font-bold">Task facchini</h3>
        <p className="text-sm">Da fare {taskGroups.da_fare.length} · In corso {taskGroups.in_corso.length} · Completate {taskGroups.completata.length}</p>
      </section>

      <section className="card space-y-1 text-sm">
        <h3 className="text-lg font-bold">Totale biancheria</h3>
        {Object.entries(linenLabels).map(([key, label]) => (
          <p key={key}>
            {label}: {linenTotals[key as keyof typeof linenTotals]}
          </p>
        ))}
      </section>

      <section className="card space-y-1 text-sm">
        <h3 className="text-lg font-bold">Totale minibar</h3>
        {Object.entries(minibarLabels).map(([key, label]) => (
          <p key={key}>
            {label}: {minibarTotals[key as keyof typeof minibarTotals]}
          </p>
        ))}
      </section>
    </div>
  );
}

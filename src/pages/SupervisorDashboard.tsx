import { useMemo, useState } from 'react';
import { useApp } from '../lib/AppContext';

const linenKeys = ['federe', 'lenzuolo', 'coprilenzuolo', 'asciugamaniViso', 'asciugamaniGrandi', 'asciugamaniBidet'] as const;

type RoomSection = 'da_fare' | 'in_corso' | 'completata';
type TaskSection = 'da_fare' | 'in_corso' | 'fatto';

export function SupervisorDashboard(): JSX.Element {
  const { rooms, tasks, users, linenEntries, createWorkday } = useApp();
  const [visibleRoomSection, setVisibleRoomSection] = useState<RoomSection>('da_fare');
  const [visibleTaskSection, setVisibleTaskSection] = useState<TaskSection>('da_fare');

  const totals = useMemo(() => {
    const completedRooms = rooms.filter((r) => r.workflowStatus === 'completata');
    const inProgressRooms = rooms.filter((r) => r.workflowStatus === 'in_corso');
    const todoRooms = rooms.filter((r) => r.workflowStatus === 'da_fare');

    const doneTasks = tasks.filter((t) => t.status === 'fatto');
    const inProgressTasks = tasks.filter((t) => t.status === 'in_corso');
    const todoTasks = tasks.filter((t) => t.status === 'da_fare');

    const modified = rooms.filter((r) => r.modified).length;
    const urgent = rooms.filter((r) => r.housekeepingStatus === 'urgente').length;

    const linen = linenEntries.reduce(
      (acc, item) => {
        linenKeys.forEach((key) => {
          acc[key] += item[key];
        });
        return acc;
      },
      { federe: 0, lenzuolo: 0, coprilenzuolo: 0, asciugamaniViso: 0, asciugamaniGrandi: 0, asciugamaniBidet: 0 }
    );

    return {
      completedRooms,
      inProgressRooms,
      todoRooms,
      doneTasks,
      inProgressTasks,
      todoTasks,
      modified,
      urgent,
      linen
    };
  }, [linenEntries, rooms, tasks]);

  const sectionRooms =
    visibleRoomSection === 'da_fare'
      ? totals.todoRooms
      : visibleRoomSection === 'in_corso'
        ? totals.inProgressRooms
        : totals.completedRooms;

  const sectionTasks =
    visibleTaskSection === 'da_fare'
      ? totals.todoTasks
      : visibleTaskSection === 'in_corso'
        ? totals.inProgressTasks
        : totals.doneTasks;

  return (
    <div className="space-y-4">
      <button type="button" className="btn-primary" onClick={createWorkday}>
        Crea / Aggiorna giornata
      </button>
      <div className="grid grid-cols-2 gap-3">
        <div className="card"><p className="text-sm">Totale camere</p><p className="text-3xl font-bold">{rooms.length}</p></div>
        <div className="card"><p className="text-sm">Da fare</p><p className="text-3xl font-bold text-slate-700">{totals.todoRooms.length}</p></div>
        <div className="card"><p className="text-sm">In corso</p><p className="text-3xl font-bold text-yellow-600">{totals.inProgressRooms.length}</p></div>
        <div className="card"><p className="text-sm">Completate</p><p className="text-3xl font-bold text-green-700">{totals.completedRooms.length}</p></div>
        <div className="card"><p className="text-sm">Modificate</p><p className="text-3xl font-bold text-red-700">{totals.modified}</p></div>
        <div className="card"><p className="text-sm">Urgenti</p><p className="text-3xl font-bold text-red-700">{totals.urgent}</p></div>
      </div>

      <div className="card">
        <h2 className="mb-2 text-lg font-bold">Camere per stato</h2>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" className={`rounded-lg py-2 text-sm font-semibold ${visibleRoomSection === 'da_fare' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setVisibleRoomSection('da_fare')}>Da fare</button>
          <button type="button" className={`rounded-lg py-2 text-sm font-semibold ${visibleRoomSection === 'in_corso' ? 'bg-yellow-500 text-white' : 'bg-slate-100'}`} onClick={() => setVisibleRoomSection('in_corso')}>In corso</button>
          <button type="button" className={`rounded-lg py-2 text-sm font-semibold ${visibleRoomSection === 'completata' ? 'bg-green-600 text-white' : 'bg-slate-100'}`} onClick={() => setVisibleRoomSection('completata')}>Completate</button>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {sectionRooms.slice(0, 15).map((room) => (
            <li key={room.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Camera {room.roomNumber} · Piano {room.floor}</span>
              <span>{users.find((u) => u.id === room.assignedUserId)?.fullName}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-2 text-lg font-bold">Task facchini per stato</h2>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" className={`rounded-lg py-2 text-sm font-semibold ${visibleTaskSection === 'da_fare' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setVisibleTaskSection('da_fare')}>Da fare</button>
          <button type="button" className={`rounded-lg py-2 text-sm font-semibold ${visibleTaskSection === 'in_corso' ? 'bg-yellow-500 text-white' : 'bg-slate-100'}`} onClick={() => setVisibleTaskSection('in_corso')}>In corso</button>
          <button type="button" className={`rounded-lg py-2 text-sm font-semibold ${visibleTaskSection === 'fatto' ? 'bg-green-600 text-white' : 'bg-slate-100'}`} onClick={() => setVisibleTaskSection('fatto')}>Completati</button>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {sectionTasks.slice(0, 12).map((task) => (
            <li key={task.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>{task.title}</span>
              <span>{users.find((u) => u.id === task.assignedUserId)?.fullName}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-2 text-lg font-bold">Totale biancheria giornaliera</h2>
        <ul className="space-y-1 text-sm">
          <li>Federe: {totals.linen.federe}</li>
          <li>Lenzuola: {totals.linen.lenzuolo}</li>
          <li>Coprilenzuola: {totals.linen.coprilenzuolo}</li>
          <li>Asciugamani viso: {totals.linen.asciugamaniViso}</li>
          <li>Asciugamani grandi: {totals.linen.asciugamaniGrandi}</li>
          <li>Asciugamani bidet: {totals.linen.asciugamaniBidet}</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-2 text-lg font-bold">Operatori attivi</h2>
        <ul className="space-y-2 text-sm">
          {users.filter((u) => u.role !== 'supervisor').map((user) => (
            <li key={user.id} className="flex justify-between"><span>{user.fullName}</span><span>{rooms.filter((r) => r.assignedUserId === user.id && r.workflowStatus === 'completata').length} completate</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

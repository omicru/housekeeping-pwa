import { useMemo } from 'react';
import { useApp } from '../lib/AppContext';

const linenKeys = ['federe', 'lenzuolo', 'coprilenzuolo', 'asciugamaniViso', 'asciugamaniGrandi', 'asciugamaniBidet'] as const;

export function SupervisorDashboard(): JSX.Element {
  const { rooms, tasks, users, linenEntries, createWorkday } = useApp();

  const totals = useMemo(() => {
    const completed = rooms.filter((r) => r.workflowStatus === 'completata').length;
    const inProgress = rooms.filter((r) => r.workflowStatus === 'in_corso').length;
    const modified = rooms.filter((r) => r.modified).length;
    const urgent = rooms.filter((r) => r.housekeepingStatus === 'urgente').length;
    const tasksDone = tasks.filter((t) => t.status === 'fatto').length;
    const linen = linenEntries.reduce(
      (acc, item) => {
        linenKeys.forEach((key) => {
          acc[key] += item[key];
        });
        return acc;
      },
      { federe: 0, lenzuolo: 0, coprilenzuolo: 0, asciugamaniViso: 0, asciugamaniGrandi: 0, asciugamaniBidet: 0 }
    );

    return { completed, inProgress, modified, urgent, tasksDone, linen };
  }, [linenEntries, rooms, tasks]);

  const roomsByStatus = {
    da_fare: rooms.filter((room) => room.workflowStatus === 'da_fare'),
    in_corso: rooms.filter((room) => room.workflowStatus === 'in_corso'),
    completata: rooms.filter((room) => room.workflowStatus === 'completata')
  };

  const tasksByStatus = {
    da_fare: tasks.filter((task) => task.status === 'da_fare'),
    in_corso: tasks.filter((task) => task.status === 'in_corso'),
    completata: tasks.filter((task) => task.status === 'fatto')
  };

  return (
    <div className="space-y-4">
      <button type="button" className="btn-primary" onClick={createWorkday}>
        Crea / Aggiorna giornata
      </button>
      <div className="grid grid-cols-2 gap-3">
        <div className="card"><p className="text-sm">Totale camere</p><p className="text-3xl font-bold">{rooms.length}</p></div>
        <div className="card"><p className="text-sm">Completate</p><p className="text-3xl font-bold text-green-700">{totals.completed}</p></div>
        <div className="card"><p className="text-sm">In corso</p><p className="text-3xl font-bold text-yellow-600">{totals.inProgress}</p></div>
        <div className="card"><p className="text-sm">Modificate</p><p className="text-3xl font-bold text-red-700">{totals.modified}</p></div>
        <div className="card"><p className="text-sm">Urgenti</p><p className="text-3xl font-bold text-red-700">{totals.urgent}</p></div>
        <div className="card"><p className="text-sm">Task facchini fatti</p><p className="text-3xl font-bold">{totals.tasksDone}/{tasks.length}</p></div>
      </div>
      <div className="card space-y-3">
        <h2 className="text-lg font-bold">Camere per stato</h2>
        {(['da_fare', 'in_corso', 'completata'] as const).map((status) => (
          <div key={status}>
            <p className="text-sm font-semibold">{status === 'da_fare' ? 'Da fare' : status === 'in_corso' ? 'In corso' : 'Completate'} ({roomsByStatus[status].length})</p>
            <p className="text-sm text-slate-600">
              {roomsByStatus[status].length === 0 ? 'Nessuna camera.' : roomsByStatus[status].map((room) => room.roomNumber).join(', ')}
            </p>
          </div>
        ))}
      </div>
      <div className="card space-y-3">
        <h2 className="text-lg font-bold">Task facchino per stato</h2>
        {(['da_fare', 'in_corso', 'completata'] as const).map((status) => (
          <div key={status}>
            <p className="text-sm font-semibold">{status === 'da_fare' ? 'Da fare' : status === 'in_corso' ? 'In corso' : 'Completate'} ({tasksByStatus[status].length})</p>
            <p className="text-sm text-slate-600">
              {tasksByStatus[status].length === 0 ? 'Nessun task.' : tasksByStatus[status].map((task) => task.title).join(', ')}
            </p>
          </div>
        ))}
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

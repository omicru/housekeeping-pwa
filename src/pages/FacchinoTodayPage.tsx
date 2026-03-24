import { useMemo } from 'react';
import { useApp } from '../lib/AppContext';

export function FacchinoTodayPage(): JSX.Element {
  const { currentUser, facchinoTasks, updateFacchinoTaskStatus } = useApp();

  if (!currentUser) return <p>Utente non autenticato.</p>;

  const tasks = useMemo(
    () => facchinoTasks.filter((task) => task.assignedFacchinoId === currentUser.id),
    [currentUser.id, facchinoTasks]
  );

  const daFare = tasks.filter((task) => task.status === 'da_fare');
  const inCorso = tasks.filter((task) => task.status === 'in_corso');
  const completate = tasks.filter((task) => task.status === 'completata');

  const renderTask = (task: (typeof tasks)[number]): JSX.Element => (
    <article key={task.id} className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{task.title}</h3>
        <span className="chip bg-slate-100 text-slate-700">{task.priority}</span>
      </div>
      <p className="text-sm text-slate-600">Area: {task.area}</p>
      {task.status !== 'completata' && (
        <div className="grid grid-cols-2 gap-2">
          {task.status === 'da_fare' ? (
            <button type="button" className="rounded-xl bg-amber-500 py-3 text-base font-bold text-white" onClick={() => void updateFacchinoTaskStatus(task.id, 'in_corso')}>
              Inizia
            </button>
          ) : (
            <button type="button" className="rounded-xl border border-slate-300 py-3 text-base font-bold" onClick={() => void updateFacchinoTaskStatus(task.id, 'da_fare')}>
              Rimetti da fare
            </button>
          )}
          <button type="button" className="rounded-xl bg-green-600 py-3 text-base font-bold text-white" onClick={() => void updateFacchinoTaskStatus(task.id, 'completata')}>
            Completata
          </button>
        </div>
      )}
    </article>
  );

  return (
    <div className="space-y-4">
      <section className="card">
        <p className="text-sm text-slate-500">Facchino</p>
        <h2 className="text-2xl font-bold">{currentUser.fullName}</h2>
        <p className="text-sm">Task attive: {daFare.length + inCorso.length}</p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Task da fare ({daFare.length})</h3>
        {daFare.length === 0 ? <p className="card text-sm text-slate-500">Nessun task da fare.</p> : daFare.map(renderTask)}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Task in corso ({inCorso.length})</h3>
        {inCorso.length === 0 ? <p className="card text-sm text-slate-500">Nessun task in corso.</p> : inCorso.map(renderTask)}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Task completate ({completate.length})</h3>
        {completate.length === 0 ? <p className="card text-sm text-slate-500">Nessun task completato.</p> : completate.map(renderTask)}
      </section>
    </div>
  );
}

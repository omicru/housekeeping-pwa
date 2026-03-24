import { useState } from 'react';
import { useApp } from '../lib/AppContext';

export function FacchinoTodayPage(): JSX.Element {
  const { currentUser, tasks, startTask, completeTask, reportIssue } = useApp();
  const [showCompleted, setShowCompleted] = useState(false);

  if (!currentUser) return <p>Utente non autenticato.</p>;

  const mine = tasks.filter((task) => task.assignedUserId === currentUser.id);
  const activeTasks = mine.filter((task) => task.status !== 'fatto');
  const completedTasks = mine.filter((task) => task.status === 'fatto');

  return (
    <div className="space-y-3">
      <div className="card">
        <h2 className="text-2xl font-bold">Task facchino - {currentUser.fullName}</h2>
        <p className="text-sm">Attivi: {activeTasks.length} · Completati: {completedTasks.length}</p>
      </div>

      {activeTasks.length === 0 ? (
        <div className="card text-center text-sm font-semibold text-green-700">Tutti i task assegnati sono completati.</div>
      ) : (
        activeTasks.map((task) => (
          <article key={task.id} className="card space-y-2">
            <h3 className="text-lg font-bold">{task.title}</h3>
            <p className="text-sm">Zona: {task.zone} · Priorità: {task.priority} · Suggerito: {task.suggestedTime}</p>
            {task.note && <p className="rounded bg-yellow-50 p-2 text-sm">{task.note}</p>}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="rounded-xl bg-yellow-500 py-3 text-sm font-bold text-white"
                onClick={() => startTask(task.id, currentUser.id)}
              >
                Inizia
              </button>
              <button
                type="button"
                className="rounded-xl bg-green-600 py-3 text-sm font-bold text-white"
                onClick={() => completeTask(task.id, currentUser.id)}
              >
                Fatto
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white"
                onClick={() =>
                  reportIssue(
                    { createdBy: currentUser.id, taskId: task.id, category: 'altro', note: `Nota task ${task.title}` },
                    currentUser.id
                  )
                }
              >
                Segnala
              </button>
            </div>
          </article>
        ))
      )}

      <button type="button" className="btn-secondary" onClick={() => setShowCompleted((prev) => !prev)}>
        {showCompleted ? 'Nascondi completate' : 'Mostra completate'}
      </button>

      {showCompleted && (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Task completate</h3>
          {completedTasks.length === 0 ? (
            <div className="card text-sm text-slate-500">Nessun task completato.</div>
          ) : (
            completedTasks.map((task) => (
              <article key={task.id} className="card">
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-slate-600">Completato alle {new Date(task.updatedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}

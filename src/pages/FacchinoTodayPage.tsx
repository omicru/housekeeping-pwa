import { useApp } from '../lib/AppContext';

export function FacchinoTodayPage(): JSX.Element {
  const { currentUser, tasks, startTask, completeTask, reportIssue } = useApp();
  if (!currentUser) return <p>Utente non autenticato.</p>;
  const mine = tasks.filter((task) => task.assignedUserId === currentUser.id);

  return (
    <div className="space-y-3">
      <div className="card">
        <h2 className="text-2xl font-bold">Task facchino - {currentUser.fullName}</h2>
        <p className="text-sm">Da gestire: {mine.length}</p>
      </div>
      {mine.map((task) => (
        <article key={task.id} className="card space-y-2">
          <h3 className="text-lg font-bold">{task.title}</h3>
          <p className="text-sm">Zona: {task.zone} · Priorità: {task.priority} · Suggerito: {task.suggestedTime}</p>
          {task.note && <p className="rounded bg-yellow-50 p-2 text-sm">{task.note}</p>}
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="rounded-xl bg-yellow-500 py-3 text-sm font-bold text-white" onClick={() => startTask(task.id, currentUser.id)}>Inizia</button>
            <button type="button" className="rounded-xl bg-green-600 py-3 text-sm font-bold text-white" onClick={() => completeTask(task.id, currentUser.id)}>Fatto</button>
            <button
              type="button"
              className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white"
              onClick={() => reportIssue({ createdBy: currentUser.id, taskId: task.id, category: 'altro', note: `Nota task ${task.title}` }, currentUser.id)}
            >
              Segnala
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

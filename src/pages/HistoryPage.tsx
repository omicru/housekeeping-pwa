import { useApp } from '../lib/AppContext';
import { formatTime } from '../lib/format';

export function HistoryPage(): JSX.Element {
  const { activity, users } = useApp();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Storico attività</h2>
      {activity.length === 0 && <div className="card">Nessuna attività registrata oggi.</div>}
      {activity.map((event) => (
        <article key={event.id} className="card">
          <p className="text-sm font-semibold">{event.action}</p>
          <p className="text-sm text-slate-600">Operatore: {users.find((u) => u.id === event.userId)?.fullName}</p>
          <p className="text-xs text-slate-500">{formatTime(event.createdAt)} · {event.detail}</p>
        </article>
      ))}
    </div>
  );
}

import { FormEvent, useState } from 'react';
import { useApp } from '../lib/AppContext';

const categories = ['manutenzione', 'minibar', 'biancheria_mancante', 'cliente_in_camera', 'camera_non_accessibile', 'sporco_anomalo', 'richiesta_supervisor', 'altro'] as const;

export function IssueReportingPage(): JSX.Element {
  const { reportIssue, currentUser, issues } = useApp();
  const [category, setCategory] = useState<typeof categories[number]>('manutenzione');
  const [note, setNote] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    if (!currentUser) return;
    reportIssue({ createdBy: currentUser.id, category, note }, currentUser.id);
    setNote('');
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="card space-y-3">
        <h2 className="text-xl font-bold">Segnala problema</h2>
        <select className="w-full rounded-xl border p-3" value={category} onChange={(e) => setCategory(e.target.value as typeof categories[number])}>
          {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
        <textarea placeholder="Nota opzionale" className="w-full rounded-xl border p-3" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn-primary" type="submit">Invia</button>
      </form>
      <div className="card">
        <h3 className="mb-2 text-lg font-bold">Ultime segnalazioni</h3>
        <ul className="space-y-2 text-sm">
          {issues.slice(0, 8).map((issue) => <li key={issue.id}><strong>{issue.category}</strong> · {issue.note || 'senza nota'}</li>)}
        </ul>
      </div>
    </div>
  );
}

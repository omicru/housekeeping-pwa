import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/AppContext';

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, users } = useApp();
  const [email, setEmail] = useState('supervisor@hotel.it');
  const [error, setError] = useState('');

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    const ok = login(email);
    if (!ok) {
      setError('Utente non trovato o non attivo.');
      return;
    }
    navigate('/supervisor');
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Login Housekeeping</h1>
      <p className="text-sm text-slate-600">Account individuali. Accesso per ruolo con dati demo.</p>
      <form onSubmit={onSubmit} className="card space-y-3">
        <label className="text-sm font-semibold">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-lg" />
        <button className="btn-primary" type="submit">
          Accedi
        </button>
        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      </form>
      <div className="card">
        <p className="mb-2 text-sm font-semibold text-slate-500">Utenti demo</p>
        <ul className="space-y-1 text-sm">
          {users.map((u) => (
            <li key={u.id}>{u.email} ({u.role})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

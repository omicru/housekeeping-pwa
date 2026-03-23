import { useApp } from '../lib/AppContext';

export function UserManagementPage(): JSX.Element {
  const { users } = useApp();

  return (
    <div className="card">
      <h2 className="mb-3 text-xl font-bold">Gestione utenti</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            <span className="chip bg-slate-200 text-slate-800">{user.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

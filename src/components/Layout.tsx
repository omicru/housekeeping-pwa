import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../lib/AppContext';

const links = [
  { to: '/supervisor', label: 'Dashboard' },
  { to: '/rooms', label: 'Camere' },
  { to: '/cameriera', label: 'Oggi Cameriera' },
  { to: '/facchino', label: 'Oggi Facchino' },
  { to: '/history', label: 'Storico' },
  { to: '/users', label: 'Utenti' }
];

export function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 border-b bg-white px-4 py-3">
        <p className="text-sm text-slate-500">{currentUser?.fullName}</p>
        <h1 className="text-xl font-bold text-slate-900">Operazioni Housekeeping</h1>
      </header>
      <main className="space-y-4 p-4">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-md gap-1 border-t bg-white p-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex-1 rounded-lg px-2 py-2 text-center text-xs font-semibold ${
              location.pathname.startsWith(link.to) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button type="button" onClick={logout} className="rounded-lg bg-red-100 px-2 py-2 text-xs font-semibold text-red-700">
          Esci
        </button>
      </nav>
    </div>
  );
}

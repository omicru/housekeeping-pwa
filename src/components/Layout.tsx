import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../lib/AppContext';

export function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  const links =
    currentUser?.role === 'supervisor'
      ? [{ to: '/supervisor', label: 'Dashboard' }]
      : currentUser?.role === 'cameriera'
        ? [{ to: '/cameriera', label: 'Le mie camere' }]
        : [{ to: '/facchino', label: 'I miei task' }];

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 border-b bg-white px-4 py-3">
        <p className="text-sm text-slate-500">{currentUser?.fullName}</p>
        <h1 className="text-xl font-bold text-slate-900">Housekeeping Hotel</h1>
      </header>
      <main className="space-y-4 p-4">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-md gap-2 border-t bg-white p-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex-1 rounded-lg px-2 py-3 text-center text-sm font-semibold ${
              location.pathname.startsWith(link.to) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button type="button" onClick={logout} className="rounded-lg bg-red-100 px-3 py-3 text-sm font-semibold text-red-700">
          Esci
        </button>
      </nav>
    </div>
  );
}

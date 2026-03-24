import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { AppProvider, useApp } from './lib/AppContext';
import { Layout } from './components/Layout';
import { CamerieraTodayPage } from './pages/CamerieraTodayPage';
import { FacchinoTodayPage } from './pages/FacchinoTodayPage';
import { SupervisorDashboard } from './pages/SupervisorDashboard';

function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { users, login } = useApp();
  const [email, setEmail] = useState('supervisor@hotel.it');
  const [error, setError] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    if (!login(email)) {
      setError('Utente non trovato. Usa un account demo.');
      return;
    }
    const role = users.find((user) => user.email === email)?.role;
    if (role === 'supervisor') navigate('/supervisor');
    if (role === 'cameriera') navigate('/cameriera');
    if (role === 'facchino') navigate('/facchino');
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Housekeeping Hotel · Login</h1>
      <p className="text-sm text-slate-600">Demo locale con ruoli: supervisor, cameriera, facchino.</p>
      <form onSubmit={submit} className="card space-y-3">
        <label className="text-sm font-semibold">Email operatore</label>
        <input className="w-full rounded-xl border border-slate-300 p-3 text-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="btn-primary">
          Accedi
        </button>
        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      </form>
      <div className="card text-sm">
        <p className="mb-2 font-semibold">Utenti demo</p>
        <ul className="space-y-1">
          {users.map((user) => (
            <li key={user.id}>
              {user.email} · {user.role}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AppRoutes(): JSX.Element {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/supervisor" element={currentUser.role === 'supervisor' ? <SupervisorDashboard /> : <Navigate to="/" replace />} />
        <Route path="/cameriera" element={currentUser.role === 'cameriera' ? <CamerieraTodayPage /> : <Navigate to="/" replace />} />
        <Route path="/facchino" element={currentUser.role === 'facchino' ? <FacchinoTodayPage /> : <Navigate to="/" replace />} />
        <Route
          path="*"
          element={<Navigate to={currentUser.role === 'supervisor' ? '/supervisor' : currentUser.role === 'cameriera' ? '/cameriera' : '/facchino'} replace />}
        />
      </Routes>
    </Layout>
  );
}

export function App(): JSX.Element {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

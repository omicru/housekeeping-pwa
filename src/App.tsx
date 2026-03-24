import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';
import { AppProvider, useApp } from './lib/AppContext';
import { Layout } from './components/Layout';
import { CamerieraTodayPage } from './pages/CamerieraTodayPage';
import { FacchinoTodayPage } from './pages/FacchinoTodayPage';
import { SupervisorDashboard } from './pages/SupervisorDashboard';

function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, authError, loading, currentUser } = useApp();
  const [email, setEmail] = useState('supervisor@hotel.it');
  const [password, setPassword] = useState('Password123!');

  useEffect(() => {
    if (currentUser?.role === 'supervisor') navigate('/supervisor');
    if (currentUser?.role === 'cameriera') navigate('/cameriera');
    if (currentUser?.role === 'facchino') navigate('/facchino');
  }, [currentUser, navigate]);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Housekeeping Hotel · Login</h1>
      <p className="text-sm text-slate-600">Accesso reale Supabase con ruoli supervisor, cameriera e facchino.</p>
      <form onSubmit={submit} className="card space-y-3">
        <label className="text-sm font-semibold">Email operatore</label>
        <input className="w-full rounded-xl border border-slate-300 p-3 text-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="text-sm font-semibold">Password</label>
        <input
          type="password"
          className="w-full rounded-xl border border-slate-300 p-3 text-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
        {authError && <p className="text-sm font-semibold text-red-700">{authError}</p>}
      </form>
    </div>
  );
}

function AppRoutes(): JSX.Element {
  const { currentUser, loading } = useApp();

  if (loading) {
    return <div className="mx-auto max-w-md p-6 text-sm font-semibold">Caricamento operativo...</div>;
  }

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

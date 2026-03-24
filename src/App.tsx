import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './lib/AppContext';
import { Layout } from './components/Layout';
import { CamerieraTodayPage } from './pages/CamerieraTodayPage';
import { FacchinoTodayPage } from './pages/FacchinoTodayPage';
import { HistoryPage } from './pages/HistoryPage';
import { IssueReportingPage } from './pages/IssueReportingPage';
import { LoginPage } from './pages/LoginPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { RoomsListPage } from './pages/RoomsListPage';
import { SetupWorkdayPage } from './pages/SetupWorkdayPage';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { UserManagementPage } from './pages/UserManagementPage';

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
        <Route path="/setup" element={currentUser.role === 'supervisor' ? <SetupWorkdayPage /> : <Navigate to="/" replace />} />
        <Route path="/rooms" element={currentUser.role === 'supervisor' ? <RoomsListPage /> : <Navigate to="/" replace />} />
        <Route path="/rooms/:id" element={currentUser.role === 'supervisor' ? <RoomDetailPage /> : <Navigate to="/" replace />} />
        <Route path="/cameriera" element={currentUser.role === 'cameriera' ? <CamerieraTodayPage /> : <Navigate to="/" replace />} />
        <Route path="/facchino" element={currentUser.role === 'facchino' ? <FacchinoTodayPage /> : <Navigate to="/" replace />} />
        <Route path="/issue" element={<IssueReportingPage />} />
        <Route path="/history" element={currentUser.role === 'supervisor' ? <HistoryPage /> : <Navigate to="/" replace />} />
        <Route path="/users" element={currentUser.role === 'supervisor' ? <UserManagementPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to={currentUser.role === 'supervisor' ? '/supervisor' : currentUser.role === 'cameriera' ? '/cameriera' : '/facchino'} replace />} />
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

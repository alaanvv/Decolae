import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginScreen from './components/login/LoginScreen';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import GerenteDashboard from './components/gerente/GerenteDashboard';
import ClienteDashboard from './components/cliente/ClienteDashboard';

const DASHBOARDS = { admin: AdminDashboard, gerente: GerenteDashboard, cliente: ClienteDashboard };

function Shell() {
  const { user } = useAuth();
  const Dashboard = user && DASHBOARDS[user.type];
  return (
    <div className="min-h-screen flex flex-col">
      {user ? (
        <>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Dashboard />
          </main>
        </>
      ) : (
        <LoginScreen />
      )}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <Shell />
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

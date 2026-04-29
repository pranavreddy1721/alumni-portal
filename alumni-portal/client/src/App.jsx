import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard pages
import StudentDashboard from './pages/dashboards/StudentDashboard';
import AlumniDashboard from './pages/dashboards/AlumniDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';

// Feature pages
import AlumniSearch from './pages/Alumni/AlumniSearch';
import AlumniProfile from './pages/Alumni/AlumniProfile';
import JobList from './pages/Jobs/JobList';
import EventList from './pages/Events/EventList';

// Dashboard router based on role
const DashboardHome = () => {
  const { user } = useAuth();
  const map = {
    student: <StudentDashboard />,
    alumni: <AlumniDashboard />,
    teacher: <TeacherDashboard />,
    admin: <AdminDashboard />,
    superadmin: <SuperAdminDashboard />,
  };
  return map[user?.role] || <Navigate to="/login" replace />;
};

// Main layout with sidebar + navbar
const AppLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount] = useState(0);

  // Map tab → component
  const tabContent = {
    dashboard: <DashboardHome />,
    alumni: <AlumniSearch />,
    jobs: <JobList />,
    events: <EventList />,
    users: <AdminDashboard />,
    approvals: <AdminDashboard />,
    analytics: <SuperAdminDashboard />,
    admins: <SuperAdminDashboard />,
    settings: (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚙️</div>
        <h2 style={{ color: '#1e293b', margin: '0 0 8px' }}>System Settings</h2>
        <p>Coming soon!</p>
      </div>
    ),
    chat: (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
        <h2 style={{ color: '#1e293b', margin: '0 0 8px' }}>Messages</h2>
        <p>Real-time chat powered by Socket.io — coming soon!</p>
      </div>
    ),
    profile: (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
        <h2 style={{ color: '#1e293b', margin: '0 0 8px' }}>My Profile</h2>
        <p>Profile editing coming soon!</p>
      </div>
    ),
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {tabContent[activeTab] || tabContent.dashboard}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500 },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyOTP />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
          <Route path="/alumni/:id" element={
            <ProtectedRoute>
              <AlumniProfile />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

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

// Coming Soon placeholder
const ComingSoon = ({ title, emoji }) => (
  <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
    <div style={{ fontSize: 56, marginBottom: 16 }}>{emoji}</div>
    <h2 style={{ color: '#1e293b', margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>{title}</h2>
    <p style={{ fontSize: 14 }}>This feature is coming soon!</p>
  </div>
);

// Profile page placeholder
const MyProfile = () => {
  const { user } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 24px' }}>👤 My Profile</h1>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{user?.name}</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>{user?.email}</p>
            <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, textTransform: 'capitalize', display: 'inline-block', marginTop: 6 }}>
              {user?.role}
            </span>
          </div>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
            ✅ Email Verified · Account Active · {user?.role === 'alumni' ? (user?.isApproved ? '✅ Approved' : '⏳ Pending Approval') : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard home based on role
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

// Main app layout
const AppLayout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount] = useState(0);

  // All tab content mapped properly
  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome />;
      case 'alumni':    return <AlumniSearch />;
      case 'jobs':      return <JobList />;
      case 'events':    return <EventList />;
      case 'profile':   return <MyProfile />;

      // Admin tabs
      case 'users':     return <AdminDashboard />;
      case 'approvals': return <AdminDashboard />;

      // SuperAdmin tabs
      case 'analytics': return <SuperAdminDashboard />;
      case 'admins':    return <SuperAdminDashboard />;
      case 'settings':  return <ComingSoon title="System Settings" emoji="⚙️" />;

      // Chat
      case 'chat': return (
        <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <h2 style={{ color: '#1e293b', margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>Real-time Chat</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
              Chat feature powered by Socket.io is ready on the backend. Frontend UI coming soon!
            </p>
            <div style={{ background: '#eff6ff', borderRadius: 10, padding: 16, textAlign: 'left' }}>
              <p style={{ margin: 0, color: '#1e40af', fontSize: 13, lineHeight: 1.7 }}>
                ✅ Socket.io server running<br />
                ✅ Message model ready<br />
                ✅ Chat routes ready<br />
                🔧 Frontend UI in progress
              </p>
            </div>
          </div>
        </div>
      );

      default: return <DashboardHome />;
    }
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
          {renderTab()}
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
            style: {
              borderRadius: 12,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 500,
            },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/"               element={<Navigate to="/login" replace />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/verify-email"   element={<VerifyOTP />} />
          <Route path="/verify-otp"     element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><AppLayout /></ProtectedRoute>
          } />
          <Route path="/alumni/:id" element={
            <ProtectedRoute><AlumniProfile /></ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

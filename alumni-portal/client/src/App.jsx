import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar   from './components/Sidebar';
import Navbar    from './components/Navbar';

// Auth
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import VerifyOTP      from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboards
import StudentDashboard    from './pages/dashboards/StudentDashboard';
import AlumniDashboard     from './pages/dashboards/AlumniDashboard';
import TeacherDashboard    from './pages/dashboards/TeacherDashboard';
import AdminDashboard      from './pages/dashboards/AdminDashboard';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';

// Features
import AlumniSearch  from './pages/Alumni/AlumniSearch';
import TeacherSearch from './pages/Teachers/TeacherSearch';
import StudentSearch from './pages/Students/StudentSearch';
import JobList       from './pages/Jobs/JobList';
import EventList     from './pages/Events/EventList';
import MyProfile     from './pages/profile/MyProfile';
import ViewProfile   from './pages/profile/ViewProfile';
import ChatPage      from './pages/Chat/ChatPage';

// ── Placeholders ─────────────────────────────────────────────
const Soon = ({ title, emoji }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', color:'#64748b' }}>
    <div style={{ fontSize:56, marginBottom:16 }}>{emoji}</div>
    <h2 style={{ color:'#1e293b', margin:'0 0 8px', fontSize:22, fontWeight:800 }}>{title}</h2>
    <p style={{ fontSize:14 }}>Coming soon!</p>
  </div>
);

// ── Dashboard router ─────────────────────────────────────────
const DashboardHome = () => {
  const { user } = useAuth();
  const map = { student:<StudentDashboard/>, alumni:<AlumniDashboard/>, teacher:<TeacherDashboard/>, admin:<AdminDashboard/>, superadmin:<SuperAdminDashboard/> };
  return map[user?.role] || <Navigate to="/login" replace />;
};

// ── Main layout ──────────────────────────────────────────────
const AppLayout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount]              = useState(0);

  const tabContent = {
    dashboard: <DashboardHome />,
    alumni:    <AlumniSearch />,
    teachers:  <TeacherSearch />,
    students:  <StudentSearch />,
    jobs:      <JobList />,
    events:    <EventList />,
    profile:   <MyProfile />,
    chat:      <ChatPage />,
    users:     <AdminDashboard />,
    approvals: <AdminDashboard />,
    analytics: <SuperAdminDashboard />,
    admins:    <SuperAdminDashboard />,
    settings:  <Soon title="System Settings" emoji="⚙️" />,
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#f1f5f9' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Navbar onMenuToggle={()=>setMobileOpen(o=>!o)} />
        <main style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {tabContent[activeTab] || <DashboardHome />}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          duration:4000,
          style:{ borderRadius:12, fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:500 },
          success:{ iconTheme:{ primary:'#059669', secondary:'#fff' } },
          error  :{ iconTheme:{ primary:'#dc2626', secondary:'#fff' } },
        }} />
        <Routes>
          <Route path="/"                element={<Navigate to="/login" replace />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-email"    element={<VerifyOTP />} />
          <Route path="/verify-otp"      element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard"       element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><div style={{minHeight:'100vh',background:'#f1f5f9'}}><div style={{maxWidth:860,margin:'0 auto',padding:20}}><ViewProfile /></div></div></ProtectedRoute>} />
          <Route path="*"                element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

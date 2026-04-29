import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, border: '4px solid #e2e8f0',
        borderTop: '4px solid #2563eb', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
      }} />
      <p style={{ color: '#64748b', fontSize: 14 }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;

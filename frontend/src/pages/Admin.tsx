import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function Admin() {
  const { user, loading } = useAuth();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (refresh > 0 && user) {
      setRefresh(0);
    }
  }, [user, refresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <AdminLogin
        onSuccess={() => setRefresh((r) => r + 1)}
      />
    );
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Graph from '@/pages/Graph';
import Library from '@/pages/Library';
import Learning from '@/pages/Learning';
import Settings from '@/pages/Settings';
import SynapseChat from '@/pages/SynapseChat';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="graph" element={<Graph />} />
        <Route path="library" element={<Library />} />
        <Route path="learning" element={<Learning />} />
        <Route path="synapse" element={<SynapseChat />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

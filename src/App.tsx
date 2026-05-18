import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import { useAuthStore } from './store/authStore';
import ChatWidget from './components/ChatWidget';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role && user.role !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const isPropertyPage = location.pathname.startsWith('/property/');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isPropertyPage && <ChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

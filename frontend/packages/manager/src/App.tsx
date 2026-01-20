import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { AcceptInvitationForm } from './components/AcceptInvitationForm';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/accept-invitation" element={<AcceptInvitationForm />} />
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <LoginForm />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


import { Toaster } from 'react-hot-toast';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster position="top-center" />
      {isAuthenticated ? <Dashboard /> : <LoginForm />}
    </>
  );
}

export default App;


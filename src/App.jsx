import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import TribePage from './pages/TribePage/TribePage';
import TribeCustomization from './pages/TribeCustomization/TribeCustomization';
import './styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tribe" element={<TribePage />} />
          <Route path="/tribe/customize" element={<TribeCustomization />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

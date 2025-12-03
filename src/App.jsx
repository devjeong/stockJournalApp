import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './pages/LoginScreen';
import HomeScreen from './pages/HomeScreen';
import JournalScreen from './pages/JournalScreen';
import AddEntryScreen from './pages/AddEntryScreen';
import AIScreen from './pages/AIScreen';
import ProfileScreen from './pages/ProfileScreen';
import MainLayout from './layouts/MainLayout';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />

          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/journal" element={<JournalScreen />} />
            <Route path="/ai" element={<AIScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Route>

          <Route path="/add" element={
            <ProtectedRoute>
              <div className="max-w-md mx-auto h-screen bg-white shadow-2xl relative overflow-hidden font-sans text-gray-900">
                <AddEntryScreen />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

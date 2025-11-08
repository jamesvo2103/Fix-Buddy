import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DiagnosisProvider } from './context/DiagnosisContext';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import DiagnosisPage from './pages/DiagnosisPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DiagnosisProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/diagnosis" element={<DiagnosisPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </DiagnosisProvider>
      </AuthProvider>
    </Router>
  );
}

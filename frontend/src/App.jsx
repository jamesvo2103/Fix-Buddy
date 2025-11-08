import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DiagnosisProvider } from './context/DiagnosisContext';
import Home from './pages/Home';
import Login from './pages/Login';
import DiagnosisPage from './pages/DiagnosisPage';
import HistoryPage from './pages/HistoryPage';
import Layout from './pages/Layout';

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
            </Routes>
          </Layout>
        </DiagnosisProvider>
      </AuthProvider>
    </Router>
  );
}

// frontend/src/App.jsx
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home.jsx';
import Layout from './pages/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FixBuddy from './pages/FixBuddy.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Loader from './components/Loader.jsx';

const App = () => {
  const { loading } = useSelector(state => state.auth);

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="fixbuddy" element={<FixBuddy />} />
        <Route path="fixbuddy/:diagnosisId" element={<FixBuddy />} />
      </Route>

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App;
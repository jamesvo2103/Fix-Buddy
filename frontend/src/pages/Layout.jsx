// frontend/src/pages/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx'; // Correct path
import { useSelector } from 'react-redux';
import Loader from '../components/Loader.jsx'; // Correct path

const Layout = () => {
  const { loading } = useSelector(state => state.auth);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      {/* Removed container for more flexibility on child pages */}
      <main>
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;
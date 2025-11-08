import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-linear-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">⚙️</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:inline">Fix Buddy</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-blue-100 transition">Home</Link>
            {user && (
              <>
                <Link to="/diagnosis" className="text-white hover:text-blue-100 transition">Diagnosis</Link>
                <Link to="/history" className="text-white hover:text-blue-100 transition">History</Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white hidden sm:inline">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block text-white hover:text-blue-100">Home</Link>
            {user && (
              <>
                <Link to="/diagnosis" className="block text-white hover:text-blue-100">Diagnosis</Link>
                <Link to="/history" className="block text-white hover:text-blue-100">History</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

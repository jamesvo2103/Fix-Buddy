import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader.jsx'; 

const ProtectedRoute = ({ children }) => {
    const { user, token, loading } = useSelector(state => state.auth);
    const location = useLocation();

    if (loading) {
        return <Loader />; 
    }

    if (!user || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
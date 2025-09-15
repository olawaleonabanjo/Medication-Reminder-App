// import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddMedication from './pages/AddMedication';
import MedicationDetail from './pages/MedicationDetail';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/medications/add" element={<PrivateRoute><AddMedication /></PrivateRoute>} />
          <Route path="/medications/:id" element={<PrivateRoute><MedicationDetail /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

export default App;
import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ConnectAccountPage from './pages/ConnectAccountPage';

function App() {
  return (
    <Router>
      {/* This component renders the actual popups on top of everything */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <Routes>
        {/* Default Route: Redirect to Login */}
        <Route path='/' element={<Navigate to = '/login' />} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/connect' element={<ConnectAccountPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;
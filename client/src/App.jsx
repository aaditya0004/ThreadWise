import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route: Redirect to Login */}
        <Route path='/' element={<Navigate to = '/login' />} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/dashboard' element={<DashboardPage />} />

        {/* We'll add RegisterPage later */}
      </Routes>
    </Router>
  );
}

export default App;
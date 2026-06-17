import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import BookingPage from './pages/BookingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MyBookings from './pages/MyBookings';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import './styles/App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event/:id" element={<EventPage />} />
            <Route 
              path="/booking/:reservationId" 
              element={isAuthenticated ? <BookingPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-bookings" 
              element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" />} 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
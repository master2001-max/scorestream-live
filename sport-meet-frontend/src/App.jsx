import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Scoreboard from './pages/Scoreboard';
import Announcements from './pages/Announcements';
import AdminDashboard from './pages/admin/AdminDashboard';
import HouseManagement from './pages/admin/HouseManagement';
import UserManagement from './pages/admin/UserManagement';
import MatchManagement from './pages/admin/MatchManagement';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="scoreboard" element={<Scoreboard />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="profile" element={<Profile />} />

                {/* Admin Routes */}
                <Route path="admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="admin/houses" element={
                  <ProtectedRoute requiredRole="admin">
                    <HouseManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/matches" element={
                  <ProtectedRoute requiredRole="admin">
                    <MatchManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/announcements" element={
                  <ProtectedRoute requiredRole="admin">
                    <AnnouncementManagement />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
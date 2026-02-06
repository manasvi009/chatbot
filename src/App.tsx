import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import TicketStatus from './pages/Tickets/TicketStatus';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminTicketManagement from './components/Admin/AdminTicketManagement';
import AdminFaqManagement from './components/Admin/AdminFaqManagement';
import AdminUserManagement from './components/Admin/AdminUserManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tickets" 
              element={
                <ProtectedRoute>
                  <TicketStatus />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/tickets" 
              element={
                <ProtectedRoute>
                  <AdminTicketManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/faqs" 
              element={
                <ProtectedRoute>
                  <AdminFaqManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute>
                  <AdminUserManagement />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<LoginForm />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
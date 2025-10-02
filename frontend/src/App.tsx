import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BoardProvider } from './contexts/BoardContext';
import { ColumnProvider } from './contexts/ColumnContext';
import { TaskProvider } from './contexts/TaskContext';
import { TagProvider } from './contexts/TagContext';
import { TaskTagProvider } from './contexts/TaskTagContext';
import { TaskAssignmentProvider } from './contexts/TaskAssignmentContext';
import { MemberProvider } from './contexts/MemberContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/Board';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BoardProvider>
        <ColumnProvider>
          <TaskProvider>
            <TagProvider>
              <TaskTagProvider>
                <TaskAssignmentProvider>
                  <MemberProvider>
                  <Router>
              <div className="App">
                <Routes>
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/board/:id" 
                    element={
                      <ProtectedRoute>
                        <BoardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
                  </Router>
                  </MemberProvider>
                </TaskAssignmentProvider>
              </TaskTagProvider>
            </TagProvider>
          </TaskProvider>
        </ColumnProvider>
      </BoardProvider>
    </AuthProvider>
  );
}

export default App;

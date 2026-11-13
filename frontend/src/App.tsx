import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

import { ProtectedRoute } from './layouts/ProtectedRoute';
import { Layout } from './layouts/Layout';

import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MyQueues } from './pages/MyQueues';
import { QueueDetails } from './pages/QueueDetails';
import { QueueHistory } from './pages/QueueHistory';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { PublicQueueDisplay } from './pages/PublicQueueDisplay';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Marketing & Display Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/display/:id" element={<PublicQueueDisplay />} />
                <Route path="/public/queue/:id" element={<PublicQueueDisplay />} />

                {/* Protected Manager Application */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/queues" element={<MyQueues />} />
                    <Route path="/queues/:id" element={<QueueDetails />} />
                    <Route path="/history" element={<QueueHistory />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

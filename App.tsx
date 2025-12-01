
import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Outlet, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PortalPage from './pages/PortalPage';
import Sidebar from './components/Sidebar';
import ManageUsersPage from './pages/ManageUsersPage';
import ManageThirdPartiesPage from './pages/ManageThirdPartiesPage';
import ManageCompaniesPage from './pages/ManageCompaniesPage';
import DashboardPage from './pages/DashboardPage';
import SupportPage from './pages/SupportPage';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, AuthUser } from './contexts/AuthContext';

const PortalLayout: React.FC<{ onLogout: () => void; user: AuthUser; }> = ({ onLogout, user }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <AuthProvider value={{ user }}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          onLogout={onLogout} 
          user={user} 
          isCollapsed={isSidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
        <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Outlet />
            </div>
        </main>
      </div>
    </AuthProvider>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const handleLogin = useCallback((user: AuthUser) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          {currentUser ? (
            // Authenticated Routes
            <Route path="/" element={<PortalLayout onLogout={handleLogout} user={currentUser} />}>
              <Route index element={<PortalPage />} />
              <Route path="users" element={<ManageUsersPage />} />
              <Route path="third-parties" element={<ManageThirdPartiesPage />} />
              <Route path="companies" element={<ManageCompaniesPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              {/* Redirect any attempt to access public pages to the portal's home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          ) : (
            // Public Routes
            <>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              {/* Redirect any other path to the login page */}
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;

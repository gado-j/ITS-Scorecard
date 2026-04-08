import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";

// new pages
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Predict from "./pages/Predict";
import UploadUpdate from "./pages/UploadUpdate";

import { DashboardProvider } from "./context/DashboardContext";
import { isAuthed, getRole } from "./utils/auth";

import "./styles/global.css";

function ProtectedRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  return isAuthed() && getRole() === "admin"
    ? children
    : <Navigate to="/home" replace />;
}

function AppLayout({ collapsed, onToggleSidebar }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div
      className={`app-container ${collapsed ? "collapsed" : ""} ${
        isLoginPage ? "login-mode" : ""
      }`}
    >
      {!isLoginPage && (
        <Sidebar collapsed={collapsed} onToggle={onToggleSidebar} />
      )}

      <div className="content">
        <Routes>
          <Route
            path="/login"
            element={isAuthed() ? <Navigate to="/home" replace /> : <Login />}
          />

          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
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
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <Predict />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadUpdate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* ✅ Vaulted: admin-only */}
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
        </Routes>

        {!isLoginPage && <Footer />}
      </div>
    </div>
  );
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((c) => !c);

  return (
    <DashboardProvider>
      <Router>
        <AppLayout collapsed={collapsed} onToggleSidebar={toggleSidebar} />
      </Router>
    </DashboardProvider>
  );
}

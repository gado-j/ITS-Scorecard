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

import { DashboardProvider } from "./context/DashboardContext";

import "./styles/global.css";

const isAuthed = () => localStorage.getItem("ITS_AUTH") === "1";

function ProtectedRoute({ children }) {
    return isAuthed() ? children : <Navigate to="/login" replace />;
}

function AppLayout({ collapsed, onToggleSidebar }) {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";

    return (
        <div
            className={`app-container ${collapsed ? "collapsed" : ""} ${isLoginPage ? "login-mode" : ""
                }`}
        >
            {!isLoginPage && (
                <Sidebar collapsed={collapsed} onToggle={onToggleSidebar} />
            )}

            <div className="content">
                <Routes>
                    {/* Login lives on /login */}
                    <Route
                        path="/login"
                        element={isAuthed() ? <Navigate to="/home" replace /> : <Login />}
                    />

                    {/* Default route sends user to home */}
                    <Route path="/" element={<Navigate to="/home" replace />} />

                    {/* Protected routes */}
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
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute>
                                <Users />
                            </ProtectedRoute>
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

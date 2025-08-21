import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";

import { DashboardProvider } from "./context/DashboardContext";

import "./styles/global.css";   // your existing globals
// NOTE: grid rules are in Footer.css to avoid creating layout.css

export default function App() {
    const [collapsed, setCollapsed] = useState(false);
    const toggleSidebar = () => setCollapsed((c) => !c);

    return (
        <DashboardProvider>
            <Router>
                <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
                    <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
                    <main className="app-main">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/users" element={<Users />} />
                            {/* add more routes as needed */}
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </DashboardProvider>
    );
}

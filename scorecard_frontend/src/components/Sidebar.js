import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FaBars,
    FaHome,
    FaTachometerAlt,
    FaListAlt,
    FaBalanceScale,
    FaChartBar,
    FaCog,
    FaUsers,
    FaChevronDown,
    FaChevronUp,
    FaSignOutAlt,
} from "react-icons/fa";
import "../styles/Sidebar.css";
import { logout } from "../utils/auth";

export default function Sidebar({ collapsed, onToggle }) {
    const [showScoreSubMenu, setShowScoreSubMenu] = useState(false);
    const navigate = useNavigate();
    const userRole = "admin"; // later from context

    const toggleCollapsed = () => {
        onToggle?.();
        if (!collapsed) setShowScoreSubMenu(false);
    };

    const getActiveClass = ({ isActive }) =>
        `sidebar-link${isActive ? " active" : ""}`;

    const handleLogout = () => {
        logout();

        // replace prevents back-button returning to app
        navigate("/login", { replace: true });
    };

    return (
        <div className={`sidebar${collapsed ? " collapsed" : ""}`}>
            <div className="sidebar-header">
                <button className="collapse-btn" onClick={toggleCollapsed}>
                    <FaBars />
                </button>
                <h2 className="sidebar-title">Scorecard</h2>
            </div>

            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/home" className={getActiveClass}>
                        <FaHome className="icon" />
                        <span className="link-text">Home</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/dashboard" className={getActiveClass}>
                        <FaTachometerAlt className="icon" />
                        <span className="link-text">Dashboard</span>
                    </NavLink>
                </li>

                <li
                    className="sidebar-link collapsible"
                    onClick={() => setShowScoreSubMenu((s) => !s)}
                >
                    <FaListAlt className="icon" />
                    <span className="link-text">Scorecards</span>
                    {showScoreSubMenu ? <FaChevronUp /> : <FaChevronDown />}
                </li>

                {showScoreSubMenu && !collapsed && (
                    <ul className="sidebar-submenu">
                        <li>
                            <NavLink
                                to="/scorecards/overview"
                                className={getActiveClass}
                            >
                                <FaListAlt className="icon small" />
                                <span className="link-text">Overview</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/scorecards/comparison"
                                className={getActiveClass}
                            >
                                <FaBalanceScale className="icon small" />
                                <span className="link-text">Comparison</span>
                            </NavLink>
                        </li>
                    </ul>
                )}

                <li>
                    <NavLink to="/reports" className={getActiveClass}>
                        <FaChartBar className="icon" />
                        <span className="link-text">Reports</span>
                    </NavLink>
                </li>

                {userRole === "admin" && (
                    <li>
                        <NavLink to="/users" className={getActiveClass}>
                            <FaUsers className="icon" />
                            <span className="link-text">Users</span>
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/settings" className={getActiveClass}>
                        <FaCog className="icon" />
                        <span className="link-text">Settings</span>
                    </NavLink>
                </li>
            </ul>

            {/* 🔐 LOGOUT — pinned to bottom */}
            <div className="sidebar-logout">
                <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt className="icon" />
                    {!collapsed && <span className="link-text">Logout</span>}
                </button>
            </div>
        </div>
    );
}

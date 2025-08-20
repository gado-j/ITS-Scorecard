import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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
} from "react-icons/fa";
import "../styles/Sidebar.css";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [showScoreSubMenu, setShowScoreSubMenu] = useState(false);
    const userRole = "admin"; // or from context

    const toggleCollapsed = () => {
        setCollapsed((c) => !c);
        // if collapsing, also close submenu
        if (!collapsed) setShowScoreSubMenu(false);
    };

    const getActiveClass = ({ isActive }) =>
        `sidebar-link${isActive ? " active" : ""}`;

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
                    <NavLink to="/" className={getActiveClass}>
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
                            <NavLink to="/scorecards/overview" className={getActiveClass}>
                                <FaListAlt className="icon small" />
                                <span className="link-text">Overview</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/scorecards/comparison" className={getActiveClass}>
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
        </div>
    );
}

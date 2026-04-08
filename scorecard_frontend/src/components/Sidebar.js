import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaTachometerAlt,
  FaListAlt,
  FaProjectDiagram,
  FaChartBar,
  FaChartLine,
  FaChartArea,
  FaCog,
  FaUsers,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUpload,
} from "react-icons/fa";

import "../styles/Sidebar.css";
import { logout, getRole } from "../utils/auth";

export default function Sidebar({ collapsed, onToggle }) {
  const [showScoreSubMenu, setShowScoreSubMenu] = useState(false);
  const navigate = useNavigate();

  // ✅ REAL role (no hardcoding)
  const userRole = getRole();

  const toggleCollapsed = () => {
    onToggle?.();
    if (!collapsed) setShowScoreSubMenu(false);
  };

  const getActiveClass = ({ isActive }) =>
    `sidebar-link${isActive ? " active" : ""}`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`sidebar${collapsed ? " collapsed" : ""}`}>
      {/* ================= HEADER ================= */}
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={toggleCollapsed}>
          <FaBars />
        </button>
        <h2 className="sidebar-title">Scorecard</h2>
      </div>

      {/* ================= MENU ================= */}
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

        {/* ===== Collapsible Scorecards Section ===== */}
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
              <NavLink to="/projects" className={getActiveClass}>
                <FaProjectDiagram className="icon small" />
                <span className="link-text">Projects</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/analytics" className={getActiveClass}>
                <FaChartBar className="icon small" />
                <span className="link-text">Analytics</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/predict" className={getActiveClass}>
                <FaChartLine className="icon small" />
                <span className="link-text">Predict</span>
              </NavLink>
            </li>
          </ul>
        )}

        <li>
          <NavLink to="/upload" className={getActiveClass}>
            <FaUpload className="icon" />
            <span className="link-text">Upload &amp; Update</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/reports" className={getActiveClass}>
            <FaChartArea className="icon" />
            <span className="link-text">Legislative Analysis</span>
          </NavLink>
        </li>

        {/* ===== ADMIN ONLY ===== */}
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

      {/* ================= LOGOUT ================= */}
      <div className="sidebar-logout">
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="icon" />
          {!collapsed && <span className="link-text">Logout</span>}
        </button>
      </div>
    </div>
  );
}

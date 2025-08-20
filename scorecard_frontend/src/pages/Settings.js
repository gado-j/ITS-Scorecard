import React, { useEffect, useState } from "react";

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Function to change theme
  const changeTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme); // ✅ Uses `data-theme`
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme); // ✅ Applies theme globally
  }, [theme]);

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <label htmlFor="theme">Theme:</label>
      <select id="theme" value={theme} onChange={(e) => changeTheme(e.target.value)}>
        <option value="light">Light Mode</option>
        <option value="dark">Dark Mode</option>
      </select>
    </div>
  );
};

export default Settings;

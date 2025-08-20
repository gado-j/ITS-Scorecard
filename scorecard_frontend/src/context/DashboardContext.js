import React, { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [selectedState, setSelectedState] = useState("");

  return (
    <DashboardContext.Provider value={{ selectedState, setSelectedState }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);

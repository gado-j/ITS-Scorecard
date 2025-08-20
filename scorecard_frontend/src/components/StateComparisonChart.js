import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const StateComparisonChart = () => {
  const [stateData, setStateData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/state-summary")
      .then(res => setStateData(res.data))
      .catch(err => console.error("Error fetching state summary", err));
  }, []);

  return (
    <div>
      <h3>State Legislative Activity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stateData}>
          <XAxis dataKey="state" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#8884d8" name="Total Bills" />
          <Bar dataKey="enacted" fill="#82ca9d" name="Enacted Bills" />
          <Bar dataKey="pending" fill="#ffc658" name="Pending Bills" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StateComparisonChart;

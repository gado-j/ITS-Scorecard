import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardCard from "../components/DashboardCard";
import Charts from "../components/Charts";
import StateComparisonChart from "../components/StateComparisonChart";
import YearlyTrendChart from "../components/YearlyTrendChart";
import TopAuthors from "../components/TopAuthors";

const Reports = () => {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    version: "All",
    vehicleType: "All",
    author: "",
    keyword: "",
    dateRange: { start: "", end: "" },
  });

  // Fetch available states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/states");
        setStates(response.data.states || []);
      } catch (error) {
        console.error("Error fetching states", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch data based on selected state
  useEffect(() => {
    if (selectedState) {
      axios.get(`http://127.0.0.1:5000/api/data?state=${selectedState}`)
        .then(res => {
          setData(res.data);
          setFilteredData(res.data);
        })
        .catch(err => console.error("Error fetching data", err));
    }
  }, [selectedState]);

  // Handle filtering
  useEffect(() => {
    let filtered = data;

    if (filters.version !== "All") {
      filtered = filtered.filter(d => d.Version?.trim().toLowerCase() === filters.version.toLowerCase());
    }

    if (filters.vehicleType !== "All") {
      filtered = filtered.filter(d => d["Vehicle Type"]?.trim().toLowerCase() === filters.vehicleType.trim().toLowerCase());
    }

    if (filters.author) {
      filtered = filtered.filter(d => d.Author?.toLowerCase().includes(filters.author.toLowerCase()));
    }

    if (filters.keyword) {
      filtered = filtered.filter(d =>
        d.Title?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        d.Synopsis?.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(d => {
        const billDate = new Date(d.Date);
        return billDate >= new Date(filters.dateRange.start) && billDate <= new Date(filters.dateRange.end);
      });
    }

    setFilteredData(filtered);
  }, [filters, data]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Legislative Reports</h1>

      {/* Filters */}
      <div className="filters-container">
        <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
          <option value="">Select a State</option>
          {states.length > 0 ? states.map(state => (
            <option key={state} value={state}>{state}</option>
          )) : <option disabled>Loading states...</option>}
        </select>

        <select onChange={(e) => setFilters({ ...filters, version: e.target.value })}>
          <option>All</option>
          <option>Enacted</option>
          <option>Not Enacted</option>
        </select>

        <select onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}>
          <option>All</option>
          <option>Autonomous Vehicles</option>
          <option>Electric Vehicles</option>
          <option>Public Transport</option>
        </select>

        <input 
          type="text" 
          placeholder="Search by Author" 
          onChange={(e) => setFilters({ ...filters, author: e.target.value })} 
        />

        <input 
          type="text" 
          placeholder="Search by Keyword" 
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} 
        />
      </div>

      {selectedState && (
        <>
          {/* Dashboard Metrics in Grid */}
          <div className="metrics-grid">
            <DashboardCard title="Total Bills" value={filteredData.length} />
            <DashboardCard title="Enacted Bills" value={filteredData.filter(d => d.Version?.trim().toLowerCase() === "enacted").length} />
            <DashboardCard title="Pending Bills" value={filteredData.filter(d => d.Version?.trim().toLowerCase() !== "enacted").length} />
          </div>

          {/* Data Charts in Grid */}
          <div className="charts-grid">
            <Charts data={filteredData} />
            <YearlyTrendChart state={selectedState} />
          </div>

          {/* Insights Section */}
          <div className="insights-grid">
            <StateComparisonChart />
            <TopAuthors state={selectedState} />
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

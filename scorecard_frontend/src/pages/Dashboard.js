import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDashboard } from "../context/DashboardContext";

import USHeatMap from "../components/USHeatMap";
import DashboardCard from "../components/DashboardCard";
import Charts from "../components/Charts";
import BillTypeDonut from "../components/BillTypeDonut";
import YearlyTrendChart from "../components/YearlyTrendChart";
import StateComparisonChart from "../components/StateComparisonChart";
import TopAuthors from "../components/TopAuthors";

export default function Dashboard() {
    const { selectedState, setSelectedState } = useDashboard();

    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [statesList, setStatesList] = useState([]);
    const [scorecard, setScorecard] = useState(null);

    const [vehicleFilter, setVehicleFilter] = useState("All");
    const [authorFilter, setAuthorFilter] = useState("");

    // 1️⃣ Load states
    useEffect(() => {
        axios
            .get("http://127.0.0.1:5000/api/states")
            .then(res => setStatesList(res.data.states || []))
            .catch(console.error);
    }, []);

    // 2️⃣ Fetch data + summary
    useEffect(() => {
        if (!selectedState) return;

        axios
            .get(`http://127.0.0.1:5000/api/data?state=${encodeURIComponent(selectedState)}`)
            .then(res => {
                const enacted = res.data.filter(
                    b => (b.Version || "").trim().toLowerCase() === "enacted"
                );
                setAllData(enacted);
            })
            .catch(console.error);

        axios
            .get("http://127.0.0.1:5000/api/state-scorecards")
            .then(res => setScorecard(res.data[selectedState] || null))
            .catch(console.error);
    }, [selectedState]);

    // 3️⃣ Filter logic
    useEffect(() => {
        let d = [...allData];
        if (vehicleFilter !== "All") {
            d = d.filter(b =>
                (b["Vehicle Type"] || "")
                    .split(",")
                    .map(v => v.trim().toLowerCase())
                    .includes(vehicleFilter.toLowerCase())
            );
        }
        if (authorFilter) {
            d = d.filter(b =>
                (b.Author || "")
                    .toLowerCase()
                    .includes(authorFilter.toLowerCase())
            );
        }
        setFilteredData(d);
    }, [allData, vehicleFilter, authorFilter]);

    if (!selectedState) {
        return <div style={{ padding: 20 }}><h2>Please click a state on the map first.</h2></div>;
    }
    if (!allData.length) {
        return <div style={{ padding: 20 }}><h2>Loading data for {selectedState}…</h2></div>;
    }

    // KPIs
    const totalEnacted = filteredData.length;
    const uniqueAuthors = new Set(
        filteredData
            .flatMap(b => (b.Author || "").split(","))
            .map(a => a.trim())
    ).size;
    const vehicleTypes = new Set(
        filteredData
            .flatMap(b => (b["Vehicle Type"] || "").split(","))
            .map(v => v.trim())
            .filter(Boolean)
    ).size;

    return (
        <div className="dashboard-container">
            {/* Single page title */}
            <div className="dashboard-title">
                ITS Scorecard Dashboard — {selectedState}
            </div>

            {/* 1️⃣ Heatmap */}
            <div className="heatmap-card">
                <USHeatMap />
            </div>

            {/* 2️⃣ Filters */}
            <div className="filters-container">
                <select value={selectedState} onChange={e => setSelectedState(e.target.value)}>
                    {statesList.map(st => (
                        <option key={st} value={st}>{st}</option>
                    ))}
                </select>

                <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)}>
                    <option>All</option>
                    {[...new Set(
                        allData.flatMap(b => (b["Vehicle Type"] || "").split(","))
                    )]
                        .map(v => v.trim())
                        .filter(v => v)
                        .map(v => (
                            <option key={v}>{v}</option>
                        ))}
                </select>

                <input
                    type="text"
                    placeholder="Filter by Author"
                    value={authorFilter}
                    onChange={e => setAuthorFilter(e.target.value)}
                />
            </div>

            {/* 3️⃣ KPI Cards */}
            <div className="metrics-grid">
                <DashboardCard title="Total Enacted Bills" value={totalEnacted} />
                <DashboardCard title="Unique Authors" value={uniqueAuthors} />
                <DashboardCard title="Vehicle Types" value={vehicleTypes} />
            </div>

            {/* 4️⃣ Charts 2×2 Grid */}
            <div className="charts-grid">
                <div className="card">
                    <h3>Bills by Vehicle Type</h3>
                    <div className="chart-wrapper"><Charts data={filteredData} /></div>
                </div>

                <div className="card">
                    <h3>Bill Types</h3>
                    <div className="chart-wrapper donut"><BillTypeDonut data={filteredData} /></div>
                </div>

                <div className="card">
                    <h3>Yearly Trends</h3>
                    <div className="chart-wrapper line"><YearlyTrendChart data={filteredData} /></div>
                </div>

                <div className="card">
                    <h3>Compare with Other States</h3>
                    <div className="chart-wrapper compare">
                        <StateComparisonChart selectedState={selectedState} />
                    </div>
                </div>
            </div>

            {/* 5️⃣ Top Authors (in insights grid) */}
            <div className="insights-grid">
                <div className="card">
                    <h3>Top Authors</h3>
                    <TopAuthors state={selectedState} />
                </div>
            </div>
        </div>
    );
}

// src/components/USHeatMap.js

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { scaleLinear } from "d3-scale";
import axios from "axios";
import StateModal from "./StateModal";
import { useDashboard } from "../context/DashboardContext";

// ─── Constants ────────────────────────────────────────────────

// TopoJSON for US states
const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Categorical grade colors (light→dark)
const GRADE_COLORS = {
    A: "#deebf7",
    B: "#c6dbef",
    C: "#9ecae1",
    D: "#6baed6",
    F: "#3182bd",
};

// Fallback fill for no-data
const NO_DATA_FILL = "#f0f0f0";

// Offsets for tiny states’ labels
const LABEL_OFFSETS = {
    "Rhode Island": [10, -5], Connecticut: [10, -5],
    Delaware: [10, -5], "New Jersey": [10, 0],
    Massachusetts: [15, -5], Maryland: [10, 0],
    Vermont: [5, -5], "New Hampshire": [10, 0]
};

// State abbreviation lookup
const stateAbbreviations = {
    Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
    Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
    Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
    Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
    Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO",
    Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH",
    Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
    Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY"
};

// Utility: choose black/white text for contrast
function getTextColor(hex) {
    const c = hex.startsWith("#") ? hex.slice(1) : hex;
    const r = parseInt(c.substr(0, 2), 16),
        g = parseInt(c.substr(2, 2), 16),
        b = parseInt(c.substr(4, 2), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? "#000" : "#fff";
}

// ─── Component ────────────────────────────────────────────────

export default function USHeatMap() {
    const { setSelectedState } = useDashboard();
    const navigate = useNavigate();
    const hoverTimer = useRef();

    // fetched scorecards: { StateName: { grade, finalScore, reason… }, … }
    const [scorecards, setScorecards] = useState({});
    // which state to show modal for
    const [modalState, setModalState] = useState(null);
    // display mode: "grade" vs "score"
    const [mode, setMode] = useState("grade");

    // fetch once on mount
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/state-scorecards")
            .then(res => setScorecards(res.data))
            .catch(err => console.error("HeatMap load error", err));
    }, []);

    // continuous scale for numeric scores
    const scoreScale = useMemo(() => {
        const vals = Object.values(scorecards)
            .map(s => Number(s.finalScore ?? s.score))
            .filter(n => !isNaN(n));
        if (!vals.length) return () => NO_DATA_FILL;
        const [min, max] = [Math.min(...vals), Math.max(...vals)];
        return scaleLinear().domain([min, max]).range(["#deebf7", "#08519c"]);
    }, [scorecards]);

    // hover → show modal after 1.5s
    const onMouseEnter = st => {
        hoverTimer.current = setTimeout(() => {
            setSelectedState(st);
            setModalState(st);
        }, 1500);
    };
    const onMouseLeave = () => {
        clearTimeout(hoverTimer.current);
        setModalState(null);
    };

    // click → navigate to dashboard
    const onClick = st => {
        setSelectedState(st);
        navigate("/dashboard");
    };

    return (
        <div className="heatmap-card">
            <h2 style={{ marginBottom: 12 }}>ITS Maturity Scorecard Heat Map</h2>

            {/* Mode toggle */}
            <div style={{ textAlign: "right", marginBottom: 8 }}>
                <label style={{ fontSize: 14 }}>
                    Color by:&nbsp;
                    <select
                        value={mode}
                        onChange={e => setMode(e.target.value)}
                        style={{ padding: "2px 6px" }}
                    >
                        <option value="grade">Grade (A–F)</option>
                        <option value="score">Score (0–100)</option>
                    </select>
                </label>
            </div>

            {/* Map */}
            <ComposableMap
                projection="geoAlbersUsa"
                width={1000}
                height={600}
                style={{ margin: "0 auto" }}
            >
                <Geographies geography={GEO_URL}>
                    {({ geographies, projection }) =>
                        geographies.map(geo => {
                            const name = geo.properties.name;
                            const data = scorecards[name] || {};
                            // fill by grade or by numeric score
                            const fill = mode === "grade"
                                ? GRADE_COLORS[data.grade] ?? NO_DATA_FILL
                                : !isNaN(data.finalScore ?? data.score)
                                    ? scoreScale(Number(data.finalScore ?? data.score))
                                    : NO_DATA_FILL;

                            // label position
                            const [cx, cy] = (() => {
                                const [x, y] = geoCentroid(geo);
                                const off = LABEL_OFFSETS[name] || [0, 0];
                                return [x + off[0], y + off[1]];
                            })();

                            const textColor = getTextColor(fill);

                            return (
                                <React.Fragment key={geo.rsmKey}>
                                    <Geography
                                        geography={geo}
                                        fill={fill}
                                        stroke="#999"
                                        strokeWidth={0.5}
                                        onMouseEnter={() => onMouseEnter(name)}
                                        onMouseLeave={onMouseLeave}
                                        onClick={() => onClick(name)}
                                        style={{
                                            default: { outline: "none", cursor: "pointer" },
                                            hover: { fill: "#f4a261", outline: "none" },
                                            pressed: { fill: "#e76f51", outline: "none" },
                                        }}
                                    />
                                    <text
                                        x={cx}
                                        y={cy}
                                        textAnchor="middle"
                                        fontSize={10}
                                        fontWeight="bold"
                                        fill={textColor}
                                        style={{ pointerEvents: "none", userSelect: "none" }}
                                    >
                                        {stateAbbreviations[name] || ""}
                                    </text>
                                </React.Fragment>
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>

            {/* Hover summary modal */}
            {modalState && (
                <StateModal
                    stateName={modalState}
                    data={scorecards[modalState]}
                    onClose={() => setModalState(null)}
                />
            )}
        </div>
    );
}

// src/components/BillTypeDonut.js
import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

// ─── Register Chart.js modules ─────────────────────────────────
ChartJS.register(ArcElement, Tooltip, Legend);

export default function BillTypeDonut({ data }) {
    const countsByType = useMemo(() => {
        const map = {};
        data.forEach((b) => {
            const types = (b["Vehicle Type"] || "").split(",").map((v) => v.trim());
            types.forEach((t) => {
                if (!t) return;
                map[t] = (map[t] || 0) + 1;
            });
        });
        return map;
    }, [data]);

    const labels = Object.keys(countsByType);
    const counts = Object.values(countsByType);
    const backgroundColor = [
        "#1976d2", "#ffa000", "#4caf50", "#e91e63", "#9c27b0",
        "#ff5722", "#03a9f4", "#8bc34a", "#ffeb3b", "#795548",
        "#607d8b",
    ];

    const chartData = { labels, datasets: [{ data: counts, backgroundColor }] };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "right" } },
    };

    return (
        <div className="chart-wrapper donut">
            <Doughnut data={chartData} options={options} redraw />
        </div>
    );
}

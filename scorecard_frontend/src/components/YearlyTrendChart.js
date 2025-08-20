// src/components/YearlyTrendChart.js
import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// ─── Register Chart.js modules ─────────────────────────────────
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function YearlyTrendChart({ data }) {
    const byYear = useMemo(() => {
        const m = {};
        data.forEach((b) => {
            const y = new Date(b.Date).getFullYear();
            if (!isNaN(y)) m[y] = (m[y] || 0) + 1;
        });
        return Object.entries(m)
            .sort(([a], [b]) => a - b)
            .map(([year, count]) => ({ year, count }));
    }, [data]);

    const labels = byYear.map((d) => d.year);
    const counts = byYear.map((d) => d.count);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Bills",
                data: counts,
                borderColor: "#1976d2",
                backgroundColor: "rgba(25,118,210,0.2)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { title: { display: true, text: "Year" } },
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="chart-wrapper line">
            <Line data={chartData} options={options} redraw />
        </div>
    );
}

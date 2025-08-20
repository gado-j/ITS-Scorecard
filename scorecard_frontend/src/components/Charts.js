// src/components/Charts.js
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ─── Register Chart.js modules ─────────────────────────────────
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Charts({ data }) {
  const labels = useMemo(
    () =>
      [...new Set(data.flatMap((b) => (b["Vehicle Type"] || "").split(",")))]
        .map((s) => s.trim())
        .filter(Boolean),
    [data]
  );

  const counts = useMemo(
    () =>
      labels.map((lbl) =>
        data.filter((b) =>
          (b["Vehicle Type"] || "")
            .split(",")
            .map((v) => v.trim())
            .includes(lbl)
        ).length
      ),
    [data, labels]
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "count",
        data: counts,
        backgroundColor: "#1976d2",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } },
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="chart-wrapper bar">
      <Bar data={chartData} options={options} redraw />
    </div>
  );
}

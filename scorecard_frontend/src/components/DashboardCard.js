import React from "react";

const DashboardCard = ({ title, value, icon, color = "#1976d2" }) => (
    <div
        style={{
            border: `1px solid ${color}`,
            borderTop: `4px solid ${color}`,
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            minWidth: "180px",
        }}
    >
        {icon && <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>}
        <h3 style={{ margin: "0 0 10px", fontSize: "18px", color: "#333" }}>
            {title}
        </h3>
        <p
            style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: value > 0 ? color : "#ccc",
            }}
        >
            {value !== undefined ? value : "N/A"}
        </p>
    </div>
);

export default DashboardCard;

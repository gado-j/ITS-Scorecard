import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Login() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
    const [stateName, setStateName] = useState("Texas");

    useEffect(() => {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

        if (!mapRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/light-v11",
                center: [-98.5795, 39.8283],
                zoom: 3.2,
            });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();

        // temp auth (until real auth is wired)
        localStorage.setItem("ITS_AUTH", "1");

        // IMPORTANT: replace=true prevents "back" from returning to login
        navigate("/home", { replace: true });
    };

    const handleRegister = (e) => {
        e.preventDefault();

        // for now, treat register as success too (you'll wire real register later)
        localStorage.setItem("ITS_AUTH", "1");
        navigate("/home", { replace: true });
    };

    return (
        <div style={{ position: "relative", height: "100vh", width: "100%" }}>
            {/* Map background */}
            <div ref={mapContainer} style={{ position: "absolute", inset: 0 }} />

            {/* Top banner */}
            <div
                style={{
                    position: "absolute",
                    top: 18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(20, 30, 40, 0.9)",
                    color: "#fff",
                    padding: "14px 22px",
                    borderRadius: 14,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    textAlign: "center",
                    zIndex: 5,
                    minWidth: 260,
                }}
            >
                <div style={{ fontWeight: 800, fontSize: 22 }}>ITS Scorecard</div>
                <div style={{ opacity: 0.9, marginTop: 2 }}>Please Select Your State</div>
            </div>

            {/* Center modal */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    padding: 16,
                    zIndex: 5,
                }}
            >
                <div
                    style={{
                        width: "min(520px, 92vw)",
                        background: "#fff",
                        borderRadius: 14,
                        boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
                        padding: 18,
                        position: "relative",
                    }}
                >
                    {/* Close button (optional UI) */}
                    <button
                        type="button"
                        aria-label="close"
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            border: "none",
                            background: "transparent",
                            fontSize: 18,
                            cursor: "pointer",
                        }}
                        onClick={() => { }}
                    >
                        ×
                    </button>

                    {/* State title */}
                    <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
                        {stateName}
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab("login")}
                            style={tabStyle(activeTab === "login")}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("register")}
                            style={tabStyle(activeTab === "register")}
                        >
                            Register
                        </button>
                    </div>

                    {/* Form */}
                    {activeTab === "login" ? (
                        <form onSubmit={handleLogin}>
                            <label style={labelStyle}>Email</label>
                            <input type="email" required style={inputStyle} />

                            <label style={{ ...labelStyle, marginTop: 10 }}>Password</label>
                            <input type="password" required style={inputStyle} />

                            <button type="submit" style={primaryBtn}>
                                Sign In
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            <label style={labelStyle}>Email</label>
                            <input type="email" required style={inputStyle} />

                            <label style={{ ...labelStyle, marginTop: 10 }}>Password</label>
                            <input type="password" required style={inputStyle} />

                            <label style={{ ...labelStyle, marginTop: 10 }}>Confirm Password</label>
                            <input type="password" required style={inputStyle} />

                            <button type="submit" style={primaryBtn}>
                                Create Account
                            </button>
                        </form>
                    )}

                    {/* Snapshot card (placeholder like your screenshot) */}
                    <div
                        style={{
                            marginTop: 18,
                            borderRadius: 12,
                            border: "1px solid #e7e7e7",
                            padding: 14,
                            background: "#fafafa",
                        }}
                    >
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Scorecard Snapshot</div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: "#1f2a37",
                                    color: "#fff",
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: 800,
                                }}
                            >
                                A
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Overall Rating</div>
                                <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
                                    Superior transportation systems with innovative solutions and high
                                    efficiency ratings across all sectors.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OPTIONAL: state selection dropdown (until we wire map-click state selection) */}
                    <div style={{ marginTop: 12, fontSize: 13, color: "#555" }}>
                        State selection is currently mocked. Next step: make state click on the map set
                        this modal’s state.
                    </div>
                </div>
            </div>
        </div>
    );
}

const tabStyle = (active) => ({
    border: "1px solid #d0d0d0",
    background: active ? "#111827" : "#fff",
    color: active ? "#fff" : "#111",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
});

const labelStyle = { fontWeight: 700, fontSize: 13, display: "block" };

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginTop: 6,
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    outline: "none",
};

const primaryBtn = {
    width: "100%",
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    background: "#111827",
    color: "#fff",
};

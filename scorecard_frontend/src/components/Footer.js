import React from "react";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-logos">
                <img src="/logo-ncit.png" alt="NCIT Logo" className="footer-logo" />
            </div>
            <div className="footer-copy">
                &copy; {new Date().getFullYear()} NCIT. All rights reserved.
            </div>
        </footer>
    );
}

import React from "react";
import "../styles/StateModal.css";

const StateModal = ({ stateName, data, onClose }) => {
  // If no data or stateName is provided, don't render anything
  if (!stateName || !data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{stateName} ITS Scorecard</h2>
        <p>
          <strong>Grade:</strong> {data.grade}
        </p>
        <p>
          <strong>Final Score:</strong> {data.finalScore}
        </p>
        <p>
          <strong>Reason:</strong> {data.reason}
        </p>
        {data.details && (
          <div className="modal-details">
            <h3>Details:</h3>
            <ul>
              {Object.entries(data.details).map(([metric, info]) => (
                <li key={metric}>
                  <strong>{metric}:</strong> {info.justification} (Weighted Score: {info.weighted_score})
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    </div>
  );
};

export default StateModal;

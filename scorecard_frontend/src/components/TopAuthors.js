import React, { useState, useEffect } from "react";
import axios from "axios";

const TopAuthors = ({ state }) => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    if (state) {
      axios.get(`http://127.0.0.1:5000/api/top-authors?state=${state}`)
        .then(res => setAuthors(res.data))
        .catch(err => console.error("Error fetching top authors", err));
    }
  }, [state]);

  return (
    <div>
      <h3>Top Authors in {state}</h3>
      <ul>
        {authors.map((a, index) => (
          <li key={index}>{a.author}: {a.bills} bills</li>
        ))}
      </ul>
    </div>
  );
};

export default TopAuthors;

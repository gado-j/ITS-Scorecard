ITS Benchmark Scorecard
Project Overview
The ITS Benchmark Scorecard is a web-based software tool that assesses and visualizes the maturity of a U.S. state’s Intelligent Transportation System (ITS) program. It provides a comprehensive framework to evaluate a state's progress across three key areas: Regulatory/Policy, Deployment, and Future Planning.
This project is a collaboration between ITS America, AECOM, and the Prairie View A&M University (PVAMU) Transportation Center.
Features
Interactive U.S. Heatmap: A visual representation of states' ITS maturity scores.
State-Level Dashboards: Detailed views for each state, including key performance indicators (KPIs) and dynamic charts.
Dynamic Charts: Various charts (bar, donut, and star charts) to visualize data on bills, vehicle types, and technology capabilities.
Data-Driven Insights: Provides insights into resource and deployment gaps to help policy leaders make informed decisions.
Responsive Design: The application is built to be accessible on both desktop and mobile devices.
Technology Stack
Frontend
React 18: The core JavaScript library for building the user interface.
React Router v6: Manages application navigation.
Charting: Uses react-chartjs-2 for most charts, with Recharts being an optional future alternative.
react-simple-maps: For rendering the interactive U.S. map.
Axios (or fetch): For making API calls to the backend.
Material UI (MUI): For UI components.
Backend
Python 3.10+: The core programming language.
Flask, Flask-Cors: A micro-framework for building the API and handling cross-origin requests.
pandas, openpyxl: Python libraries for data processing and reading Excel files.
Data Storage
The application uses Excel files (.xlsx) as its primary data source. No external database is required.
Getting Started
To get the project up and running on your local machine, follow these steps.
Prerequisites
Git
Node.js 18+ and npm
Python 3.10+ and pip
1. Clone the Repository
git clone https://github.com/gado-j/ITS-Scorecard.git
cd ITS-Scorecard


2. Install Dependencies
The project has both a frontend and a backend.
Frontend (React)
cd scorecard_frontend
npm install --legacy-peer-deps


Backend (Python)
cd ../scorecard_backend
pip install -r requirements.txt


3. Run the Application
You must run both the backend and frontend servers simultaneously.
Start the Backend Server
python app.py
# The backend server typically runs on http://localhost:5000


Start the Frontend Development Server
In a separate terminal, navigate to the scorecard_frontend directory.
cd scorecard_frontend
npm start
# This will open the app at http://localhost:3000


Project Structure
its-scorecard/
├─ scorecard_backend/
│  ├─ app.py               # Flask backend server
│  ├─ requirements.txt     # Python dependencies
│  └─ data/                # Excel data files (.xlsx)
└─ scorecard_frontend/
   ├─ public/
   │  ├─ index.html
   │  └─ data/              # Local data fallback for development
   │     ├─ bills.json
   │     └─ state-summaries/
   │        ├─ Texas.json
   │        └─ New%20Jersey.json
   ├─ src/
   │  ├─ components/        # Reusable React components
   │  ├─ pages/             # Main pages (Dashboard, etc.)
   │  ├─ context/           # React context for state management
   │  └─ services/          # API service calls (api.js)
   ├─ package.json
   └─ README.md


API Contracts
GET /api/state/bills
Returns an array of bill rows or an object containing an array under one of the keys: results, items, or data.
Example row:
{
  "Vehicle Type": "Autonomous, Electric",
  "Date": "2024-03-10",
  "Title": "HB1234 An autonomous vehicle bill",
  "Author": "Doe, J."
}


GET /api/state/:state/summary
Returns state capability details. The weight is a value from 0 to 1, which is displayed as 0 to 100 on the star chart.
{
  "details": [
    { "axis": "Sensing / Detection", "matched": true, "weight": 0.8 },
    { "axis": "Signal / Traffic Mgmt", "matched": true, "weight": 0.6 },
    { "axis": "Connectivity (C-V2X/5G)", "matched": false, "weight": 0.0 },
    { "axis": "Information Systems", "matched": true, "weight": 0.7 },
    { "axis": "Incident Response", "matched": true, "weight": 0.5 }
  ],
  "grade": "B"
}


Troubleshooting & Development Tips
Blank charts: If a chart is blank, check the Network tab in your browser's developer tools for calls to /api/state/bills. The issue is likely that no data was returned from the backend. You can place public/data/bills.json as a fallback.
CORS errors: Ensure that Flask-Cors is properly configured on the backend or use a proxy in the React setup.
Field normalization: The frontend components are designed to accept data with varying field names (e.g., 'Vehicle Type', 'Date'), which helps handle inconsistencies in the data source.
Star chart: The StateStarChart component calls getStateSummary(selectedState) internally to fetch its data.
Contributing
Fork the repository.
Create a new branch for your feature (git checkout -b feature/<name>).
Commit your changes (git commit -m "feat: <description>").
Push to the branch (git push origin feature/<name>).
Open a Pull Request.
License
© NCIT. All rights reserved.

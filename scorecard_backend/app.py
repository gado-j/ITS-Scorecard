from flask import Flask, jsonify, request
import pandas as pd
import os
from flask_cors import CORS
from scorecard_processor import analyze_state  # ✅ Import the new module

app = Flask(__name__)
CORS(app)

DATA_FOLDER = "C:\\Users\\sgado\\scorecard\\scorecard_backend\\data\\states"
data_cache = {}

def get_available_states():
    return [file.replace(".xlsx", "") for file in os.listdir(DATA_FOLDER) if file.endswith(".xlsx")]

def load_data():
    global data_cache
    data_cache = {}
    for file in os.listdir(DATA_FOLDER):
        if file.endswith(".xlsx"):
            state_name = file.replace(".xlsx", "")
            df = pd.read_excel(os.path.join(DATA_FOLDER, file))
            data_cache[state_name] = df.to_dict(orient="records")

load_data()

@app.route('/api/states', methods=['GET'])
def get_states():
    return jsonify({"states": get_available_states()})

@app.route('/api/data', methods=['GET'])
def get_data():
    state = request.args.get('state')
    if state and state in data_cache:
        return jsonify(data_cache[state])
    return jsonify({"error": "State data not found"}), 404

@app.route('/api/state-summary', methods=['GET'])
def get_state_summary():
    summary = []
    for state, bills in data_cache.items():
        total_bills = len(bills)
        enacted_bills = sum(1 for bill in bills if str(bill.get("Version", "")).strip().lower() == "enacted")
        pending_bills = total_bills - enacted_bills
        summary.append({"state": state, "total": total_bills, "enacted": enacted_bills, "pending": pending_bills})
    return jsonify(summary)

@app.route('/api/yearly-trends', methods=['GET'])
def get_yearly_trends():
    state = request.args.get('state')
    if state not in data_cache:
        return jsonify({"error": "State not found"}), 404

    yearly_trends = {}
    for bill in data_cache[state]:
        try:
            year = str(pd.to_datetime(bill.get("Date", ""), errors='coerce').year)
            if year != "NaT":
                yearly_trends[year] = yearly_trends.get(year, 0) + 1
        except:
            continue
    return jsonify([{"year": y, "count": c} for y, c in sorted(yearly_trends.items())])

@app.route('/api/top-authors', methods=['GET'])
def get_top_authors():
    state = request.args.get('state')
    if state not in data_cache:
        return jsonify({"error": "State not found"}), 404

    author_counts = {}
    for bill in data_cache[state]:
        authors = str(bill.get("Author", "")).split(",")
        for author in authors:
            author = author.strip()
            author_counts[author] = author_counts.get(author, 0) + 1

    top_authors = sorted(author_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return jsonify([{"author": a, "bills": c} for a, c in top_authors])

@app.route('/api/longest-pending-bills', methods=['GET'])
def get_longest_pending_bills():
    state = request.args.get('state')
    if state not in data_cache:
        return jsonify({"error": "State not found"}), 404

    pending_bills = [bill for bill in data_cache[state] if str(bill.get("Version", "")).strip().lower() != "enacted"]
    pending_bills.sort(key=lambda b: pd.to_datetime(b.get("Date", ""), errors='coerce'), reverse=False)

    return jsonify(pending_bills[:5])

@app.route('/api/state-vehicle-types', methods=['GET'])
def get_state_vehicle_types():
    state_summary = {}
    for state, bills in data_cache.items():
        vehicle_types = set()
        for bill in bills:
            if "Vehicle Type" in bill and isinstance(bill["Vehicle Type"], str):
                vehicle_types.update(bill["Vehicle Type"].split(","))
        state_summary[state] = {"totalVehicleTypes": len(vehicle_types)}
    return jsonify(state_summary)

# ✅ NEW API: State Scorecards
@app.route('/api/state-scorecards', methods=['GET'])
def get_state_scorecards():
    results = {}
    for file in os.listdir(DATA_FOLDER):
        if file.endswith(".xlsx"):
            state = file.replace(".xlsx", "")
            filepath = os.path.join(DATA_FOLDER, file)
            try:
                result = analyze_state(filepath)
                results[state] = result
            except Exception as e:
                results[state] = {"error": str(e)}
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)

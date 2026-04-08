from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client
from scorecard_processor import analyze_state_data
import io
import csv
import uuid
from datetime import datetime, timezone, timedelta
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

SUPABASE_URL = "https://ivustulljgjkhpikzitj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dXN0dWxsamdqa2hwaWt6aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTA0ODksImV4cCI6MjA4OTM4NjQ4OX0.0sz-uap_Xvv9v6cpXdfsVyGa5fqfo_2ATr27aJ7eM0M"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Maps state name to (bills table, state data table)
STATE_TABLE_MAP = {
    "Texas": ("tx_bills", "tx_state_data"),
    "New Jersey": ("nj_bills", "nj_state_data"),
}

def to_frontend(record):
    """Convert Supabase snake_case keys back to the Title Case keys the frontend expects."""
    return {
        "Title": record.get("title"),
        "Bill Info": record.get("bill_info"),
        "Author": record.get("author"),
        "Version": record.get("version"),
        "Date": record.get("date"),
        "Vehicle Type": record.get("vehicle_type"),
        "State": record.get("state"),
        "Synopsis": record.get("synopsis"),
        "Category": record.get("category"),
    }

def fetch_all(table):
    all_data = []
    page = 0
    page_size = 1000
    while True:
        result = supabase.table(table).select("*").range(page * page_size, (page + 1) * page_size - 1).execute()
        all_data.extend(result.data)
        if len(result.data) < page_size:
            break
        page += 1
    return all_data

@app.route('/api/bills', methods=['GET'])
def get_bills():
    state = request.args.get('state', '')
    version = request.args.get('version', '')
    category = request.args.get('category', '')
    vehicle_type = request.args.get('vehicleType', '')
    author = request.args.get('author', '')
    keyword = request.args.get('keyword', '')

    if state:
        tables = [STATE_TABLE_MAP[state][0]] if state in STATE_TABLE_MAP else []
    else:
        tables = [v[0] for v in STATE_TABLE_MAP.values()]

    result = []
    for table in tables:
        result.extend(fetch_all(table))

    if version:
        result = [b for b in result if str(b.get('version', '') or '').strip().lower() == version.strip().lower()]
    if category:
        result = [b for b in result if str(b.get('category', '') or '').strip().lower() == category.strip().lower()]
    if vehicle_type:
        result = [b for b in result if vehicle_type.strip().lower() in str(b.get('vehicle_type', '') or '').strip().lower()]
    if author:
        result = [b for b in result if author.strip().lower() in str(b.get('author', '') or '').lower()]
    if keyword:
        result = [b for b in result if
                  keyword.lower() in str(b.get('title', '') or '').lower() or
                  keyword.lower() in str(b.get('synopsis', '') or '').lower()]

    return jsonify([to_frontend(b) for b in result])

@app.route('/api/bills/meta', methods=['GET'])
def get_bills_meta():
    all_bills = []
    for bills_table, _ in STATE_TABLE_MAP.values():
        all_bills.extend(fetch_all(bills_table))

    states = sorted(set(str(b.get('state', '') or '').strip() for b in all_bills if b.get('state')))
    vehicle_types = sorted(set(
        vt.strip()
        for b in all_bills
        for vt in str(b.get('vehicle_type', '') or '').split(',')
        if vt.strip()
    ))
    categories = sorted(set(str(b.get('category', '') or '').strip() for b in all_bills if b.get('category')))
    return jsonify({"states": states, "vehicleTypes": vehicle_types, "categories": categories})

@app.route('/api/states', methods=['GET'])
def get_states():
    return jsonify({"states": list(STATE_TABLE_MAP.keys())})

@app.route('/api/data', methods=['GET'])
def get_data():
    state = request.args.get('state')
    if state not in STATE_TABLE_MAP:
        return jsonify({"error": "State data not found"}), 404
    _, state_table = STATE_TABLE_MAP[state]
    return jsonify([to_frontend(r) for r in fetch_all(state_table)])

@app.route('/api/state-summary', methods=['GET'])
def get_state_summary():
    summary = []
    for state, (_, state_table) in STATE_TABLE_MAP.items():
        bills = fetch_all(state_table)
        total_bills = len(bills)
        enacted_bills = sum(1 for bill in bills if str(bill.get("version", "")).strip().lower() == "enacted")
        pending_bills = total_bills - enacted_bills
        summary.append({"state": state, "total": total_bills, "enacted": enacted_bills, "pending": pending_bills})
    return jsonify(summary)

@app.route('/api/yearly-trends', methods=['GET'])
def get_yearly_trends():
    state = request.args.get('state')
    if state not in STATE_TABLE_MAP:
        return jsonify({"error": "State not found"}), 404
    _, state_table = STATE_TABLE_MAP[state]
    bills = fetch_all(state_table)
    yearly_trends = {}
    for bill in bills:
        try:
            date_str = str(bill.get("date", "") or "")
            year = date_str[:4]
            if year.isdigit():
                yearly_trends[year] = yearly_trends.get(year, 0) + 1
        except:
            continue
    return jsonify([{"year": y, "count": c} for y, c in sorted(yearly_trends.items())])

@app.route('/api/top-authors', methods=['GET'])
def get_top_authors():
    state = request.args.get('state')
    if state not in STATE_TABLE_MAP:
        return jsonify({"error": "State not found"}), 404
    _, state_table = STATE_TABLE_MAP[state]
    bills = fetch_all(state_table)
    author_counts = {}
    for bill in bills:
        for author in str(bill.get("author", "")).split(","):
            author = author.strip()
            if author:
                author_counts[author] = author_counts.get(author, 0) + 1
    top_authors = sorted(author_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return jsonify([{"author": a, "bills": c} for a, c in top_authors])

@app.route('/api/longest-pending-bills', methods=['GET'])
def get_longest_pending_bills():
    state = request.args.get('state')
    if state not in STATE_TABLE_MAP:
        return jsonify({"error": "State not found"}), 404
    _, state_table = STATE_TABLE_MAP[state]
    bills = fetch_all(state_table)
    pending_bills = [bill for bill in bills if str(bill.get("version", "")).strip().lower() != "enacted"]
    pending_bills.sort(key=lambda b: str(b.get("date", "") or ""))
    return jsonify([to_frontend(b) for b in pending_bills[:5]])

@app.route('/api/state-vehicle-types', methods=['GET'])
def get_state_vehicle_types():
    state_summary = {}
    for state, (_, state_table) in STATE_TABLE_MAP.items():
        bills = fetch_all(state_table)
        vehicle_types = set()
        for bill in bills:
            vt = bill.get("vehicle_type", "")
            if vt and isinstance(vt, str):
                vehicle_types.update(v.strip() for v in vt.split(",") if v.strip())
        state_summary[state] = {"totalVehicleTypes": len(vehicle_types)}
    return jsonify(state_summary)

@app.route('/api/state-scorecards', methods=['GET'])
def get_state_scorecards():
    results = {}
    for state, (_, state_table) in STATE_TABLE_MAP.items():
        try:
            bills = fetch_all(state_table)
            results[state] = analyze_state_data(bills)
        except Exception as e:
            results[state] = {"error": str(e)}
    return jsonify(results)

# ─────────────────────────────────────────────
#  DOCUMENT UPLOAD HELPERS
# ─────────────────────────────────────────────

def extract_keywords_from_csv(content):
    try:
        text = content.decode('utf-8', errors='ignore')
        reader = csv.reader(io.StringIO(text))
        headers = next(reader, [])
        return [h.strip() for h in headers if h.strip()][:8]
    except Exception:
        return []

def extract_keywords_from_xlsx(content):
    try:
        import pandas as pd
        df = pd.read_excel(io.BytesIO(content))
        return [str(c).strip() for c in df.columns if str(c).strip()][:8]
    except Exception:
        return []

def purge_expired_deleted_docs():
    """Permanently remove docs that have been in deleted_docs for more than 30 days."""
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        supabase.table('deleted_docs').delete().lt('deleted_at', cutoff).execute()
    except Exception:
        pass

# ─────────────────────────────────────────────
#  DOCUMENT ENDPOINTS
# ─────────────────────────────────────────────

@app.route('/api/documents/upload', methods=['POST'])
def upload_document():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        doc_type = request.form.get('doc_type', 'survey')

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        original_name = file.filename
        filename = secure_filename(original_name)
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

        file_content = file.read()
        keywords = []

        if ext == 'csv':
            keywords = extract_keywords_from_csv(file_content)
        elif ext in ('xlsx', 'xls'):
            keywords = extract_keywords_from_xlsx(file_content)

        doc_id = str(uuid.uuid4())

        result = supabase.table('documents').insert({
            'id': doc_id,
            'filename': filename,
            'original_name': original_name,
            'doc_type': doc_type,
            'status': 'extracted',
            'keywords': keywords,
            'created_at': datetime.now(timezone.utc).isoformat()
        }).execute()

        if hasattr(result, 'error') and result.error:
            return jsonify({'error': str(result.error)}), 500

        return jsonify({'message': 'Uploaded successfully', 'id': doc_id}), 201

    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500


@app.route('/api/documents', methods=['GET'])
def get_documents():
    try:
        purge_expired_deleted_docs()
        result = supabase.table('documents').select('*').order('created_at', desc=True).execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': f'Could not fetch documents: {str(e)}'}), 500


@app.route('/api/documents/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    try:
        result = supabase.table('documents').select('*').eq('id', doc_id).execute()
        if not result.data:
            return jsonify({'error': 'Document not found'}), 404

        doc = result.data[0]

        # Move to deleted_docs with 30-day expiry timestamp
        supabase.table('deleted_docs').insert({
            **doc,
            'deleted_at': datetime.now(timezone.utc).isoformat()
        }).execute()

        supabase.table('documents').delete().eq('id', doc_id).execute()

        return jsonify({'message': 'Document moved to trash'}), 200

    except Exception as e:
        return jsonify({'error': f'Delete failed: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)

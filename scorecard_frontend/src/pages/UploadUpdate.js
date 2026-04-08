import React, { useState, useEffect, useRef } from 'react';
import {
  FaCloudUploadAlt,
  FaSearch,
  FaSyncAlt,
  FaTrash,
  FaFileCsv,
  FaFilePdf,
  FaFileExcel,
} from 'react-icons/fa';
import axios from 'axios';

const API = 'http://127.0.0.1:5000';

const DOC_TYPES = [
  {
    key: 'survey',
    label: 'Survey Data',
    accepts: '.xlsx,.csv',
    acceptsLabel: 'Supported formats: XLSX, CSV',
    Icon: FaFileExcel,
  },
  {
    key: 'planning',
    label: 'Planning Documentation',
    accepts: '.pdf,.docx',
    acceptsLabel: 'Supported formats: PDF, DOCX',
    Icon: FaFilePdf,
  },
  {
    key: 'legislation',
    label: 'Legislation Data',
    accepts: '.pdf,.docx',
    acceptsLabel: 'Supported formats: PDF, DOCX',
    Icon: FaFileCsv,
  },
];

const SECTION_LABELS = {
  survey: 'Latest ITS Survey Data',
  planning: 'Planning Extraction',
  legislation: 'Legislative Extraction',
};

export default function UploadUpdate() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploading, setUploading] = useState({});
  const [dragOver, setDragOver] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRefs = useRef({});

  const showError = (msg) => {
    setSuccessMsg('');
    setErrorMsg(msg);
  };

  const showSuccess = (msg) => {
    setErrorMsg('');
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API}/api/documents`);
      setDocuments(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Could not reach backend. Make sure Flask is running on port 5000.';
      showError(msg);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (docType, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [docType]: true }));
    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    try {
      await axios.post(`${API}/api/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSuccess(`"${file.name}" uploaded successfully.`);
      await fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed. Check that the backend is running and the Supabase tables exist.';
      showError(msg);
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }));
      if (fileInputRefs.current[docType]) {
        fileInputRefs.current[docType].value = '';
      }
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      showSuccess('Document moved to trash. It will be permanently deleted in 30 days.');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Delete failed.';
      showError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDrop = (docType, e) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [docType]: false }));
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(docType, file);
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch =
      search === '' ||
      d.original_name?.toLowerCase().includes(search.toLowerCase()) ||
      (d.keywords || []).some(k =>
        k.toLowerCase().includes(search.toLowerCase())
      );
    const matchesFilter =
      filterCategory === 'all' || d.doc_type === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const groupedDocs = DOC_TYPES.reduce((acc, type) => {
    acc[type.key] = filteredDocs.filter(d => d.doc_type === type.key);
    return acc;
  }, {});

  const totalDocs = documents.length;

  return (
    <div className="upload-page">

      {/* ── Status banners ── */}
      {errorMsg && (
        <div className="upload-banner upload-banner-error">
          <strong>Error:</strong> {errorMsg}
          <button className="upload-banner-close" onClick={() => setErrorMsg('')}>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="upload-banner upload-banner-success">
          {successMsg}
          <button className="upload-banner-close" onClick={() => setSuccessMsg('')}>✕</button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="upload-header">
        <div>
          <h1>Update Agency Documents</h1>
          <p>Upload &amp; manage important documents to keep your data updated</p>
        </div>
        <div className="upload-header-stats">
          <span className="upload-stat-badge">{totalDocs} document{totalDocs !== 1 ? 's' : ''} uploaded</span>
        </div>
      </div>

      <div className="upload-layout">
        {/* ══════════════ LEFT: Upload Cards ══════════════ */}
        <div className="upload-left">
          <h2 className="upload-section-title">Upload New Documents</h2>

          <div className="upload-cards">
            {DOC_TYPES.map(({ key, label, accepts, acceptsLabel, Icon }) => (
              <div
                key={key}
                className={`upload-card${dragOver[key] ? ' drag-over' : ''}`}
                onDragOver={e => {
                  e.preventDefault();
                  setDragOver(p => ({ ...p, [key]: true }));
                }}
                onDragLeave={() =>
                  setDragOver(p => ({ ...p, [key]: false }))
                }
                onDrop={e => handleDrop(key, e)}
                onClick={() => fileInputRefs.current[key]?.click()}
              >
                <input
                  type="file"
                  accept={accepts}
                  ref={el => (fileInputRefs.current[key] = el)}
                  style={{ display: 'none' }}
                  onChange={e => handleUpload(key, e.target.files[0])}
                />
                <div className="upload-card-body">
                  {uploading[key] ? (
                    <div className="upload-spinner-wrap">
                      <div className="upload-spinner" />
                      <span>Uploading…</span>
                    </div>
                  ) : (
                    <>
                      <Icon className="upload-icon" />
                      <p className="upload-card-label">{label}</p>
                      <p className="upload-card-hint">
                        Drag &amp; drop files here or{' '}
                        <span className="browse-link">Browse</span>
                      </p>
                      <p className="upload-card-formats">{acceptsLabel}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ RIGHT: Preview ══════════════ */}
        <div className="upload-right">
          <div className="preview-header">
            <h2 className="upload-section-title">Preview Extracted Data</h2>
            <button
              className="btn btn-outline btn-small refresh-btn"
              onClick={fetchDocuments}
            >
              <FaSyncAlt /> Refresh Data
            </button>
          </div>

          {/* Controls */}
          <div className="preview-controls">
            <div className="preview-search-wrap">
              <FaSearch className="preview-search-icon" />
              <input
                className="preview-search-input"
                type="text"
                placeholder="Search extracted data…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="preview-filter-select"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="all">Filter by Category</option>
              <option value="survey">Survey Data</option>
              <option value="planning">Planning Docs</option>
              <option value="legislation">Legislation</option>
            </select>
          </div>

          {/* Sections */}
          <div className="preview-sections">
            {filteredDocs.length === 0 ? (
              <div className="preview-empty">
                No documents uploaded yet. Upload files to see extracted data here.
              </div>
            ) : (
              DOC_TYPES.map(({ key }) => {
                const docs = groupedDocs[key];
                if (!docs || docs.length === 0) return null;

                return (
                  <div key={key} className="preview-section">
                    <h3 className="preview-section-label">
                      {SECTION_LABELS[key]}
                    </h3>

                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>Keyword</th>
                          <th>Source</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {docs.map(doc => {
                          const keywords =
                            doc.keywords && doc.keywords.length > 0
                              ? doc.keywords
                              : [doc.original_name];

                          return keywords.map((kw, i) => (
                            <tr key={`${doc.id}-${i}`}>
                              <td className="kw-cell">{kw}</td>
                              <td className="source-cell">{doc.original_name}</td>
                              <td>
                                <span className="status-badge extracted">
                                  Extracted
                                </span>
                              </td>
                              <td className="action-cell">
                                {i === 0 && (
                                  <button
                                    className="delete-doc-btn"
                                    title="Delete document"
                                    disabled={deletingId === doc.id}
                                    onClick={() => handleDelete(doc.id)}
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

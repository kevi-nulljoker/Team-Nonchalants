import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AppNavbar from "../components/AppNavbar";

// ─── COLOR PALETTE (matches Dashboard) ──────────────────────────────────────
const P = {
  bg: "#E9EEF6", card: "#FFFFFF", navy: "#0B1B35", navyMid: "#1C304F",
  blue: "#1A56E8", blueLight: "#EBF0FE", teal: "#1D4ED8", tealLight: "#EBF0FE",
  amber: "#D97706", amberLight: "#FEF3C7", red: "#DC2626", redLight: "#FEF2F2",
  purple: "#7C3AED", purpleLight: "#F5F3FF", slate: "#64748B", muted: "#94A3B8",
  faint: "#CBD5E1", border: "#E2E8F0", borderSoft: "#F1F5F9",
  gold: "#F59E0B", goldLight: "#FFFBEB",
};

// Category colours (same as Dashboard)
const CAT_COLORS = {
  food: "#2563EB",
  shopping: "#7C3AED",
  education: "#1A56E8",
  emi: "#DC2626",
  investment: "#1D4ED8",
  travel: "#D97706",
  healthcare: "#DB2777",
  utilities: "#0284C7",
  entertainment: "#EA580C",
};

// ─── STYLES (embedded) ─────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');

  .txn-page {
    min-height: 100vh;
    width: 100vw;
    background: ${P.bg};
    font-family: 'Manrope', sans-serif;
    padding: 24px;
    color: ${P.navy};
    box-sizing: border-box;
  }

  .txn-card {
    background: ${P.card};
    border-radius: 16px;
    border: 1px solid ${P.border};
    box-shadow: 0 1px 4px rgba(11,27,53,0.06);
    padding: 20px;
  }

  .upload-area {
    border: 2px dashed ${P.border};
    border-radius: 16px;
    background: ${P.card};
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .upload-area:hover {
    border-color: ${P.blue};
    background: ${P.blueLight}20;
  }
  .upload-area.dragging {
    border-color: ${P.teal};
    background: ${P.tealLight}30;
  }

  .txn-table {
    width: 100%;
    border-collapse: collapse;
  }
  .txn-table th {
    text-align: left;
    padding: 12px 8px;
    font-size: 11px;
    font-weight: 700;
    color: ${P.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${P.border};
  }
  .txn-table td {
    padding: 12px 8px;
    font-size: 13px;
    border-bottom: 1px solid ${P.borderSoft};
  }
  .txn-table tr:hover {
    background: ${P.borderSoft};
  }

  .category-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
    color: white;
  }

  .confidence-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 99px;
    font-size: 10px;
    font-weight: 600;
    background: ${P.goldLight};
    color: ${P.gold};
  }

  .filter-input {
    border: 1px solid ${P.border};
    border-radius: 30px;
    padding: 8px 16px;
    font-size: 13px;
    outline: none;
    transition: all 0.2s;
    width: 100%;
    max-width: 300px;
  }
  .filter-input:focus {
    border-color: ${P.blue};
    box-shadow: 0 0 0 3px ${P.blueLight};
  }

  .btn-primary {
    background: linear-gradient(135deg, ${P.blue}, ${P.teal});
    color: white;
    border: none;
    border-radius: 30px;
    padding: 10px 24px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(26,86,232,0.25);
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// ─── HELPER: format currency ────────────────────────────────────────────────
const formatINR = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt);

const TXN_API_BASES = Array.from(new Set([
  (import.meta.env.VITE_TXN_API_URL || '').replace(/\/$/, ''),
  'http://127.0.0.1:8000',
  'http://localhost:8000',
].filter(Boolean)));

async function readErrorMessage(res, fallback) {
  try {
    const payload = await res.json();
    return payload?.detail || payload?.message || fallback;
  } catch {
    try {
      const text = await res.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
}

async function requestWithFallback(path, options = {}, fallbackMessage = 'Request failed') {
  let lastError = null;
  for (const baseUrl of TXN_API_BASES) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${baseUrl}${path}`, { ...options, signal: controller.signal });
      window.clearTimeout(timeoutId);
      if (res.ok) return res;
      const message = await readErrorMessage(res, fallbackMessage);
      lastError = new Error(message);
      if (![404, 408, 429, 500, 502, 503, 504].includes(res.status)) break;
    } catch (err) {
      window.clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(fallbackMessage);
    }
  }
  throw lastError || new Error(fallbackMessage);
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const Transactions = () => {
  const { token } = useContext(AuthContext);
  const effectiveToken = token || localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [pipelineStatus, setPipelineStatus] = useState('');

  const fetchTransactions = async () => {
    if (!effectiveToken) {
      setTransactions([]);
      setFiltered([]);
      setError('Please log in to view transactions');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const authHeader = { Authorization: `Bearer ${effectiveToken}` };
      let res = null;
      let parsed = [];
      for (const endpoint of ['/transactions', '/ledger']) {
        try {
          res = await requestWithFallback(endpoint, { headers: authHeader }, 'Failed to fetch transactions');
          parsed = await res.json();
          break;
        } catch {
          // try next endpoint
        }
      }
      if (!res) throw new Error('Failed to fetch transactions. Ensure transaction service is running on port 8000.');
      const data = Array.isArray(parsed)
        ? parsed
        : (Array.isArray(parsed?.transactions) ? parsed.transactions : []);
      setTransactions(data);
      setFiltered(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveToken) fetchTransactions();
  }, [effectiveToken]);

  // Filter transactions when search changes
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(transactions);
    } else {
      const lower = search.toLowerCase();
      setFiltered(transactions.filter(tx =>
        tx.description?.toLowerCase().includes(lower) ||
        tx.category?.toLowerCase().includes(lower) ||
        tx.amount?.toString().includes(lower)
      ));
    }
  }, [search, transactions]);

  // Handle file upload
  const handleUpload = async (file) => {
    if (!file) return;
    if (!effectiveToken) {
      setError('Please log in to upload files');
      return;
    }

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      setError('Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setError('');
    setPipelineStatus('Uploading image and running extraction pipeline...');
    try {
      const res = await requestWithFallback('/upload/process', {
        method: 'POST',
        headers: { Authorization: `Bearer ${effectiveToken}` },
        body: formData,
      }, 'Upload failed');
      const payload = await res.json();
      const inserted = Number(payload?.inserted_transactions ?? payload?.total_transactions ?? 0);
      setPipelineStatus(`Done. ${inserted} new transaction(s) imported to MongoDB for your account.`);
      window.dispatchEvent(new CustomEvent('finsight:transactions-updated'));
    } catch (err) {
      setError(err.message);
      setPipelineStatus('');
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      handleUpload(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  // Helper to get category colour
  const getCatColor = (cat) => CAT_COLORS[cat?.toLowerCase()] || P.purple;

  return (
    <>
      <style>{styles}</style>
      <div className="txn-page">
        <AppNavbar />
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: P.navy, margin: 0 }}>Transactions</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {/* Upload area */}
        <div
          className={`upload-area ${dragging ? 'dragging' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: P.navy, marginBottom: 4 }}>
            {uploading ? 'Processing...' : 'Upload a transaction image'}
          </p>
          <p style={{ fontSize: 12, color: P.muted }}>
            Drag & drop an image here, or click to browse
          </p>
          {uploading && (
            <div style={{ marginTop: 12 }}>
              <div className="progress-bg" style={{ height: 4, width: '100%', maxWidth: 200, margin: '0 auto' }}>
                <div className="progress-fill" style={{ width: '60%', background: P.blue, animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
          )}
        </div>

        {pipelineStatus && (
          <div style={{ marginTop: 16, padding: 12, background: P.tealLight, border: `1px solid ${P.teal}`, borderRadius: 12, color: P.teal, fontSize: 13 }}>
            {pipelineStatus}
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-start' }}>
          <button className="btn-primary" onClick={fetchTransactions} disabled={loading || uploading || !effectiveToken}>
            {loading ? 'Fetching...' : 'Show Transactions'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ marginTop: 16, padding: 12, background: P.redLight, border: `1px solid ${P.red}`, borderRadius: 12, color: P.red, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Transactions list */}
        <div className="txn-card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: P.navy, margin: 0 }}>Your Transactions</h2>
            <span style={{ fontSize: 12, color: P.muted }}>{filtered.length} entries</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${P.border}`, borderTopColor: P.blue, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: P.muted }}>Loading transactions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: P.borderSoft, borderRadius: 12 }}>
              <p style={{ fontSize: 14, color: P.muted }}>No transactions yet. Upload an image to get started.</p>
            </div>
          ) : (
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, idx) => (
                  <tr key={tx._id || `${tx.date || 'na'}-${tx.description || 'tx'}-${idx}`}>
                    <td>{tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.description}
                    </td>
                    <td>
                      <span
                        className="category-badge"
                        style={{ background: getCatColor(tx.category) }}
                      >
                        {tx.category || 'Other'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: P.navy }}>{formatINR(tx.amount)}</td>
                    <td>
                      {tx.confidence ? (
                        <span className="confidence-badge">
                          {(tx.confidence * 100).toFixed(0)}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Inline animation keyframes */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          .progress-fill {
            background: linear-gradient(90deg, ${P.blue} 30%, ${P.teal} 50%, ${P.blue} 70%);
            background-size: 200% 100%;
          }
        `}</style>
      </div>
    </>
  );
};

export default Transactions;

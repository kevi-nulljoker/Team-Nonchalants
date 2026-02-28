import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getPointsSummary } from "../services/pointsApi";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const P = {
  bg: "#E9EEF6", card: "#FFFFFF", navy: "#0B1B35", navyMid: "#1C304F",
  blue: "#1A56E8", blueLight: "#EBF0FE", teal: "#1D4ED8", tealLight: "#EBF0FE",
  amber: "#D97706", amberLight: "#FEF3C7", red: "#DC2626", redLight: "#FEF2F2",
  purple: "#7C3AED", purpleLight: "#F5F3FF", slate: "#64748B", muted: "#94A3B8",
  faint: "#CBD5E1", border: "#E2E8F0", borderSoft: "#F1F5F9",
  gold: "#F59E0B", goldLight: "#FFFBEB",
};

const CATS = {
  food: { label: "Food & Dining", color: "#2563EB", icon: "🍜", budget: 25000 },
  shopping: { label: "Shopping", color: "#7C3AED", icon: "🛍", budget: 20000 },
  education: { label: "Education", color: "#1A56E8", icon: "📖", budget: 20000 },
  emi: { label: "EMI / Loans", color: "#DC2626", icon: "🏦", budget: 30000 },
  investment: { label: "Investment", color: "#1D4ED8", icon: "📈", budget: 35000 },
  travel: { label: "Travel", color: "#D97706", icon: "✈", budget: 20000 },
  healthcare: { label: "Healthcare", color: "#DB2777", icon: "💊", budget: 15000 },
  utilities: { label: "Utilities", color: "#0284C7", icon: "⚡", budget: 15000 },
  entertainment: { label: "Entertainment", color: "#EA580C", icon: "🎬", budget: 10000 },
};

function parseAmt(t) { const m = t.match(/INR (\d+)/); return m ? parseInt(m[1]) : 0; }
function cleanDesc(t) { return t.replace(/TXN[a-f0-9]+/gi, "").replace(/INR \d+/, "").trim(); }

const RAW = [
  {text:"Swiggy order INR 1240 TXNa1",cat:"food",day:1},{text:"Mobile recharge INR 299 TXNa2",cat:"utilities",day:1},
  {text:"Mutual fund SIP INR 5000 TXNa3",cat:"investment",day:2},{text:"Uber ride INR 320 TXNa4",cat:"travel",day:2},
  {text:"Amazon purchase INR 2850 TXNa5",cat:"shopping",day:3},{text:"Credit card EMI INR 8500 TXNa6",cat:"emi",day:3},
  {text:"Doctor consultation INR 800 TXNa7",cat:"healthcare",day:4},{text:"Netflix subscription INR 649 TXNa8",cat:"entertainment",day:4},
  {text:"Online course INR 1999 TXNa9",cat:"education",day:5},{text:"Electricity bill INR 1240 TXNb1",cat:"utilities",day:5},
  {text:"Zomato dinner INR 580 TXNb2",cat:"food",day:6},{text:"Flipkart order INR 3200 TXNb3",cat:"shopping",day:6},
  {text:"Ola cab INR 220 TXNb4",cat:"travel",day:7},{text:"Home loan EMI INR 18000 TXNb5",cat:"emi",day:8},
  {text:"Stock purchase INR 10000 TXNb6",cat:"investment",day:8},{text:"Cafe coffee INR 460 TXNb7",cat:"food",day:9},
  {text:"Pharmacy INR 540 TXNb8",cat:"healthcare",day:9},{text:"Bus ticket INR 180 TXNb9",cat:"travel",day:10},
  {text:"Water bill INR 320 TXNc1",cat:"utilities",day:10},{text:"Exam fee INR 1500 TXNc2",cat:"education",day:11},
  {text:"Movie ticket INR 680 TXNc3",cat:"entertainment",day:11},{text:"Pizza delivery INR 720 TXNc4",cat:"food",day:12},
  {text:"Online shopping INR 1890 TXNc5",cat:"shopping",day:12},{text:"Hotel booking INR 4500 TXNc6",cat:"travel",day:13},
  {text:"Medical test INR 1100 TXNc7",cat:"healthcare",day:13},{text:"PPF contribution INR 5000 TXNc8",cat:"investment",day:14},
  {text:"Gas bill INR 850 TXNc9",cat:"utilities",day:14},{text:"Bike loan EMI INR 6200 TXNd1",cat:"emi",day:15},
  {text:"Restaurant bill INR 1340 TXNd2",cat:"food",day:15},{text:"Library fee INR 500 TXNd3",cat:"education",day:16},
  {text:"Concert ticket INR 1200 TXNd4",cat:"entertainment",day:16},{text:"Train ticket INR 890 TXNd5",cat:"travel",day:17},
  {text:"Clothing store INR 2100 TXNd6",cat:"shopping",day:17},{text:"Fixed deposit INR 10000 TXNd7",cat:"investment",day:18},
  {text:"Hospital bill INR 2800 TXNd8",cat:"healthcare",day:18},{text:"Internet recharge INR 999 TXNd9",cat:"utilities",day:19},
  {text:"Swiggy order INR 640 TXNe1",cat:"food",day:19},{text:"Personal loan INR 7000 TXNe2",cat:"emi",day:20},
  {text:"Online course INR 2499 TXNe3",cat:"education",day:20},{text:"Flipkart order INR 4100 TXNe4",cat:"shopping",day:21},
  {text:"Flight ticket INR 5200 TXNe5",cat:"travel",day:21},{text:"Game purchase INR 499 TXNe6",cat:"entertainment",day:22},
  {text:"Crypto invest INR 3000 TXNe7",cat:"investment",day:22},{text:"Food court INR 920 TXNe8",cat:"food",day:23},
  {text:"Electronics INR 6800 TXNe9",cat:"shopping",day:23},{text:"Car loan EMI INR 9500 TXNf1",cat:"emi",day:24},
  {text:"Pharmacy INR 380 TXNf2",cat:"healthcare",day:24},{text:"Electricity bill INR 1100 TXNf3",cat:"utilities",day:25},
  {text:"College fees INR 8000 TXNf4",cat:"education",day:25},{text:"Ola cab INR 340 TXNf5",cat:"travel",day:26},
  {text:"Lunch at hotel INR 1100 TXNf6",cat:"food",day:26},{text:"Mutual fund SIP INR 3000 TXNf7",cat:"investment",day:27},
  {text:"Concert ticket INR 1500 TXNf8",cat:"entertainment",day:27},{text:"Amazon purchase INR 1650 TXNf9",cat:"shopping",day:28},
  {text:"Doctor consultation INR 600 TXNg1",cat:"healthcare",day:28},{text:"Swiggy order INR 480 TXNg2",cat:"food",day:29},
  {text:"Mobile recharge INR 239 TXNg3",cat:"utilities",day:29},{text:"Hotel booking INR 3200 TXNg4",cat:"travel",day:30},
  {text:"Stock purchase INR 8000 TXNg5",cat:"investment",day:30},
];

const INCOME = 75000;
const TRANSACTIONS = RAW.map((r,i)=>({
  id:i, desc:cleanDesc(r.text), txnId:r.text.match(/TXN[a-f0-9]+/i)?.[0]||"",
  cat:r.cat, amount:parseAmt(r.text), day:r.day,
  date:`Oct ${String(r.day).padStart(2,"0")}`, meta:CATS[r.cat]||CATS.shopping,
}));

const GOALS = [
  {id:1,label:"Emergency Fund",target:150000,saved:62000,icon:"🛡",color:P.teal,deadlineDay:7},
  {id:2,label:"Goa Trip Fund", target:40000, saved:28500,icon:"🏖",color:P.amber,deadlineDay:14},
  {id:3,label:"New Laptop", target:80000, saved:45000,icon:"💻",color:P.blue,deadlineDay:21},
  {id:4,label:"Annual SIP Goal",target:60000,saved:36000,icon:"📈",color:P.purple,deadlineDay:28},
];

// Learning modules
const LEARNING_MODULES = [
  { id: "budgeting", title: "Budgeting 101", icon: "💡", points: 20, duration: "5 min", desc: "Master the 50/30/20 rule" },
  { id: "investing", title: "Investing Basics", icon: "📈", points: 30, duration: "8 min", desc: "SIPs, mutual funds & more" },
  { id: "tax", title: "Tax Saving Tips", icon: "🏛", points: 25, duration: "6 min", desc: "Section 80C deductions" },
  { id: "debt", title: "Debt Management", icon: "🔗", points: 20, duration: "5 min", desc: "Tackle loans smartly" },
  { id: "emergency", title: "Emergency Fund", icon: "🛡", points: 15, duration: "4 min", desc: "Build your safety net" },
  { id: "credit", title: "Credit Score", icon: "⭐", points: 20, duration: "5 min", desc: "Boost your CIBIL score" },
];

// Point tiers
const TIERS = [
  { name: "Beginner", min: 0, max: 100, color: "#94A3B8", icon: "🌱" },
  { name: "Learner", min: 100, max: 300, color: "#2563EB", icon: "📗" },
  { name: "Scholar", min: 300, max: 600, color: "#1A56E8", icon: "🎓" },
  { name: "Expert", min: 600, max: 1000, color: "#7C3AED", icon: "🏆" },
  { name: "Master", min: 1000, max: Infinity, color: "#D97706", icon: "👑" },
];

// Simulated past logins/learning for Oct 2024 (days 1-17 already done, today = Oct 18)
const INITIAL_LOGIN_DAYS = new Set([1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17]);
const INITIAL_LEARNING_DAYS = new Set([1,3,5,6,8,10,11,13,14,16,17]);
const INITIAL_COMPLETED_MODULES = { 1: ["budgeting","investing"], 3: ["tax"], 5: ["budgeting"], 6: ["debt"], 8: ["investing","credit"], 10: ["emergency"], 11: ["tax","budgeting"], 13: ["debt"], 14: ["investing"], 16: ["credit"], 17: ["emergency","tax"] };
const TODAY = 18; // Oct 18

const TXN_API_BASE = (
  import.meta.env.VITE_TXN_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");
const AUTH_API_BASES = Array.from(new Set([
  (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, ""),
  (import.meta.env.VITE_API_TARGET || "http://127.0.0.1:8001").replace(/\/$/, ""),
].filter(Boolean)));
const READ_ENDPOINTS = ["/transactions", "/ledger"];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", to: "/dashboard", Icon: "grid" },
  { id: "transactions", label: "Transactions", to: "/transactions", Icon: "bar" },
  { id: "insights", label: "Insights", to: "/insights", Icon: "trend" },
  { id: "goals", label: "Goals", to: "/goals", Icon: "target" },
  { id: "learning", label: "Learning", to: "/learning", Icon: "book" },
  { id: "profile", label: "Profile", to: "/signup", Icon: "user" },
];

// ─── STATIC STYLES (CSS classes) ─────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; width: 100%; }

  body {
    background: #E9EEF6;
    font-family: 'Manrope', 'DM Sans', 'Segoe UI', sans-serif;
    color: #0B1B35;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.7); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pointsBurst {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-40px) scale(1.4); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
    50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
  }

  /* Utility classes */
  .fade-up { animation: fadeUp 0.38s cubic-bezier(0.4, 0, 0.2, 1) both; }
  .pop-in { animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .streak-flame { animation: pulse 2s infinite; }

  /* Card styles */
  .card {
    background: #FFFFFF;
    border-radius: 16px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 1px 4px rgba(11, 27, 53, 0.06);
  }
  .card-hover {
    transition: box-shadow 0.18s, transform 0.18s;
  }
  .card-hover:hover {
    box-shadow: 0 8px 24px rgba(11, 27, 53, 0.10);
    transform: translateY(-1px);
  }

  /* Transaction row */
  .txn-row {
    transition: background 0.12s;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 6px;
    border-radius: 9px;
  }
  .txn-row:hover { background: #F8FAFC; }

  /* Calendar day */
  .cal-day {
    height: 30px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    border: 2px solid transparent;
  }
  .cal-day:hover { transform: scale(1.08); }

  /* Module button */
  .module-btn {
    cursor: pointer;
    border: none;
    border-radius: 12px;
    padding: 12px;
    transition: all 0.2s;
    text-align: left;
    background: #F1F5F9;
    border: 1.5px solid #E2E8F0;
  }
  .module-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 86, 232, 0.15);
  }
  .module-btn:disabled {
    opacity: 1;
    cursor: default;
    background: linear-gradient(135deg, #EBF0FE 15%, #F5F3FF 10%);
    border: 1.5px solid #1A56E8;
  }

  /* Labels */
  .label-container { margin-bottom: 14px; }
  .label-main {
    font-size: 13px;
    font-weight: 700;
    color: #0B1B35;
    margin: 0;
  }
  .label-sub {
    font-size: 11px;
    color: #94A3B8;
    margin: 2px 0 0;
  }

  /* Progress bar */
  .progress-bg {
    background: #F1F5F9;
    border-radius: 99px;
    height: 5px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 1s ease;
  }

  /* Points burst */
  .points-burst {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    pointer-events: none;
    animation: pointsBurst 1.2s ease-out forwards;
    font-size: 28px;
    font-weight: 800;
    color: #F59E0B;
    text-shadow: 0 2px 12px rgba(245, 158, 11, 0.6);
  }

  /* Nav button */
  .nav-btn {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  .nav-btn.active {
    background: #0B1B35;
    color: #fff;
  }
  .nav-btn:not(.active) {
    background: transparent;
    color: #64748B;
  }

  /* Check-in button */
  .checkin-btn {
    padding: 8px 14px;
    border-radius: 99px;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, #2563EB, #1D4ED8);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 3px 10px rgba(37, 99, 235, 0.35);
    transition: all 0.15s;
  }
  .checkin-badge {
    font-size: 11px;
    font-weight: 700;
    color: #1D4ED8;
    background: #EBF0FE;
    padding: 6px 12px;
    border-radius: 99px;
  }

  /* Stats grid */
  .stat-box {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 9px;
    padding: 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .stat-label {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.35);
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .stat-value {
    font-size: 13px;
    font-weight: 800;
  }
`;

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────
const Card = ({ children, style = {}, className = "" }) => (
  <div className={`card ${className}`} style={style}>
    {children}
  </div>
);

const Lbl = ({ text, sub }) => (
  <div className="label-container">
    <p className="label-main">{text}</p>
    {sub && <p className="label-sub">{sub}</p>}
  </div>
);

const PBar = ({ v, color, h = 5 }) => (
  <div className="progress-bg" style={{ height: h }}>
    <div
      className="progress-fill"
      style={{ width: `${Math.min(v, 100)}%`, backgroundColor: color }}
    />
  </div>
);

const NavIcons = {
  grid: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  target: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  bar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  trend: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  user: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  book: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
};

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: P.card,
      border: `1px solid ${P.border}`,
      borderRadius: 10,
      padding: "10px 13px",
      boxShadow: "0 6px 20px rgba(0,0,0,.09)",
      fontSize: 12
    }}>
      {label && <p style={{ fontWeight: 700, color: P.navy, marginBottom: 5 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ display: "flex", alignItems: "center", gap: 6, margin: "2px 0" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color || P.blue }} />
          <span style={{ color: P.muted }}>{p.name}:</span>
          <strong style={{ color: P.navy }}>₹{Number(p.value).toLocaleString("en-IN")}</strong>
        </p>
      ))}
    </div>
  );
};

const PointsBurst = ({ points, visible }) => {
  if (!visible) return null;
  return <div className="points-burst">+{points} pts ✨</div>;
};

const LearningCalendar = ({ loginDays, learningDays, completedModules, goalDeadlines, onDayClick, today }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const daysOfWeek = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const startOffset = 2; // Oct 2024 starts on Tuesday
  const totalDays = 31;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {daysOfWeek.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: P.muted, padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} style={{ height: 30 }} />
        ))}
        {Array.from({ length: totalDays }, (_, i) => {
          const d = i + 1;
          const isLogin = loginDays.has(d);
          const isLearning = learningDays.has(d);
          const isToday = d === today;
          const isFuture = d > today;
          const goalsOnDay = goalDeadlines[d] || [];
          const hasGoalDeadline = goalsOnDay.length > 0;
          const modCount = (completedModules[d] || []).length;

          let bg = P.borderSoft;
          let textColor = P.muted;
          let borderColor = "transparent";

          if (isFuture) { bg = P.borderSoft; textColor = P.faint; }
          else if (isLearning) { bg = `linear-gradient(135deg,${P.blue},${P.purple})`; textColor = "#fff"; }
          else if (isLogin) { bg = P.tealLight; textColor = P.teal; borderColor = P.teal + "44"; }

          return (
            <div
              key={d}
              className="cal-day"
              title={isFuture ? "" : `Oct ${d}: ${isLearning ? "✓ Learned" : "Login only"} ${modCount > 0 ? `(${modCount} modules)` : ""}`}
              onClick={() => !isFuture && onDayClick(d)}
              onMouseEnter={() => setHoveredDay(d)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                background: bg,
                borderColor: isToday ? P.gold : borderColor,
              }}
            >
              <span style={{ fontSize: 10.5, fontWeight: isToday ? 800 : 600, color: textColor }}>{d}</span>
              {isLearning && modCount > 0 && (
                <span style={{
                  position: "absolute", top: -3, right: -3,
                  width: 13, height: 13, borderRadius: "50%",
                  background: P.gold, color: "#fff",
                  fontSize: 7, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1.5px solid ${P.card}`,
                }}>
                  {modCount}
                </span>
              )}
              {isToday && !isLearning && (
                <span style={{
                  position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)",
                  width: 5, height: 5, borderRadius: "50%", background: P.gold,
                }} />
              )}
              {hasGoalDeadline && (
                <span style={{
                  position: "absolute", top: -3, left: -3,
                  width: 12, height: 12, borderRadius: "50%",
                  background: P.amber, color: "#fff",
                  fontSize: 7, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1.5px solid ${P.card}`,
                }}>
                  G
                </span>
              )}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        {[
          { bg: `linear-gradient(135deg,${P.blue},${P.purple})`, label: "Learned" },
          { bg: P.tealLight, border: `1px solid ${P.teal}44`, label: "Login only" },
          { bg: P.amber, label: "Goal date" },
          { bg: P.borderSoft, label: "No activity" },
          { bg: P.borderSoft, border: `2px solid ${P.gold}`, label: "Today" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: l.border || "none" }} />
            <span style={{ fontSize: 9.5, color: P.muted }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showAll, setShowAll] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  const [coinPoints, setCoinPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  const [transactionsFetchError, setTransactionsFetchError] = useState(false);
  const [noTxPopupShown, setNoTxPopupShown] = useState(false);
  const [transactionsReloadKey, setTransactionsReloadKey] = useState(0);
  const hasAuthToken = !!(localStorage.getItem("auth_token") || localStorage.getItem("token"));

  // Gamification State
  const [loginDays, setLoginDays] = useState(INITIAL_LOGIN_DAYS);
  const [learningDays, setLearningDays] = useState(INITIAL_LEARNING_DAYS);
  const [completedModules, setCompletedModules] = useState(INITIAL_COMPLETED_MODULES);
  const [todayLoggedIn, setTodayLoggedIn] = useState(false);
  const [todayLearnedModules, setTodayLearnedModules] = useState([]);
  const [showBurst, setShowBurst] = useState(false);
  const [burstPoints, setBurstPoints] = useState(0);
  const [selectedCalDay, setSelectedCalDay] = useState(null);

  useEffect(() => {
    const found = NAV_ITEMS.find((i) => location.pathname.startsWith(i.to));
    setActiveNav(found?.id || "dashboard");
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    const userId = localStorage.getItem("auth_user_id");
    const storedName = (localStorage.getItem("auth_name") || "").trim();
    const storedEmail = (localStorage.getItem("auth_email") || localStorage.getItem("userEmail") || "").trim();
    const fallbackName = storedName || storedEmail || "User";

    setUserName(fallbackName);
    setUserInitial(fallbackName.charAt(0).toUpperCase() || "U");

    if (!userId) return () => { mounted = false; };

    (async () => {
      for (const baseUrl of AUTH_API_BASES) {
        try {
          const res = await fetch(`${baseUrl}/users/${userId}/profile`);
          if (!res.ok) continue;
          const data = await res.json();
          const dbName = (data?.name || data?.email || fallbackName || "User").trim();
          if (mounted) {
            setUserName(dbName);
            setUserInitial(dbName.charAt(0).toUpperCase() || "U");
          }
          return;
        } catch {
          // Try next base URL
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const userId = localStorage.getItem("auth_user_id");
    if (!userId) return;

    (async () => {
      try {
        const points = await getPointsSummary(userId);
        if (mounted && typeof points?.total_points === "number") setCoinPoints(points.total_points);
      } catch {
        // Keep silent fallback
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onTransactionsUpdated = () => setTransactionsReloadKey((v) => v + 1);
    window.addEventListener("finsight:transactions-updated", onTransactionsUpdated);
    return () => window.removeEventListener("finsight:transactions-updated", onTransactionsUpdated);
  }, []);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    const userId = localStorage.getItem("auth_user_id");

    if (!token) {
      setTransactions([]);
      setTransactionsLoaded(true);
      setTransactionsFetchError(false);
      return;
    }

    const normalizeCategoryKey = (rawCategory = "", description = "") => {
      const raw = `${rawCategory} ${description}`.toLowerCase();
      if (raw.includes("food") || raw.includes("swiggy") || raw.includes("zomato") || raw.includes("restaurant") || raw.includes("cafe")) return "food";
      if (raw.includes("shop") || raw.includes("amazon") || raw.includes("flipkart") || raw.includes("clothing") || raw.includes("electronic")) return "shopping";
      if (raw.includes("educat") || raw.includes("course") || raw.includes("library") || raw.includes("exam") || raw.includes("college")) return "education";
      if (raw.includes("emi") || raw.includes("loan")) return "emi";
      if (raw.includes("invest") || raw.includes("fund") || raw.includes("stock") || raw.includes("ppf") || raw.includes("sip") || raw.includes("crypto")) return "investment";
      if (raw.includes("travel") || raw.includes("uber") || raw.includes("ola") || raw.includes("flight") || raw.includes("hotel") || raw.includes("ticket") || raw.includes("cab")) return "travel";
      if (raw.includes("health") || raw.includes("doctor") || raw.includes("medical") || raw.includes("pharmacy") || raw.includes("hospital")) return "healthcare";
      if (raw.includes("utilit") || raw.includes("electricity") || raw.includes("internet") || raw.includes("water") || raw.includes("gas") || raw.includes("recharge") || raw.includes("bill")) return "utilities";
      if (raw.includes("entertain") || raw.includes("movie") || raw.includes("netflix") || raw.includes("concert") || raw.includes("game")) return "entertainment";
      return "shopping";
    };

    const normalizeDate = (value) => {
      if (!value) return { day: 1, date: "Oct 01" };
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return { day: 1, date: "Oct 01" };
      const day = d.getDate();
      return {
        day,
        date: d.toLocaleDateString("en-IN", { month: "short", day: "2-digit" }),
      };
    };

    (async () => {
      try {
        setTransactionsFetchError(false);
        const authHeader = { Authorization: `Bearer ${token}` };
        let parsedPayload = [];
        for (const endpoint of READ_ENDPOINTS) {
          const res = await fetch(`${TXN_API_BASE}${endpoint}`, { headers: authHeader });
          if (!res.ok) continue;
          const parsed = await res.json();
          parsedPayload = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.transactions) ? parsed.transactions : []);
          break;
        }

        const userFiltered = parsedPayload.filter((tx) => {
          if (!userId) return true;
          return String(tx.user_id) === String(userId);
        });

        const normalized = userFiltered.map((tx, i) => {
          const amountNum = Math.abs(Number(tx?.amount || 0));
          const description = tx?.description || tx?.desc || tx?.merchant || "Transaction";
          const categoryKey = normalizeCategoryKey(tx?.category || tx?.cat || "", description);
          const dateInfo = normalizeDate(tx?.date || tx?.created_at || tx?.timestamp);
          return {
            id: tx?.id || tx?._id || `${i}_${description}`,
            desc: description,
            txnId: tx?.txnId || tx?.transaction_id || "",
            cat: categoryKey,
            amount: Number.isFinite(amountNum) ? amountNum : 0,
            day: dateInfo.day,
            date: dateInfo.date,
            meta: CATS[categoryKey] || CATS.shopping,
          };
        });

        if (mounted) setTransactions(normalized);
      } catch {
        if (mounted) {
          setTransactions([]);
          setTransactionsFetchError(true);
        }
      } finally {
        if (mounted) setTransactionsLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [transactionsReloadKey]);

  useEffect(() => {
    if (!hasAuthToken || !transactionsLoaded || noTxPopupShown || transactionsFetchError) return;
    if (transactions.length > 0) return;
    if (location.pathname !== "/dashboard") return;
    setNoTxPopupShown(true);
    window.alert("Please upload a transaction file first.");
    navigate("/transactions");
  }, [hasAuthToken, transactionsLoaded, transactions.length, noTxPopupShown, transactionsFetchError, navigate, location.pathname]);

  // Calculate total points
  const totalPoints = useMemo(() => {
    let pts = 0;
    loginDays.forEach(d => { pts += 5; });
    Object.entries(completedModules).forEach(([d, mods]) => {
      mods.forEach(mid => {
        const mod = LEARNING_MODULES.find(m => m.id === mid);
        if (mod) pts += mod.points;
      });
    });
    if (todayLoggedIn) pts += 5;
    todayLearnedModules.forEach(mid => {
      const mod = LEARNING_MODULES.find(m => m.id === mid);
      if (mod) pts += mod.points;
    });
    return pts;
  }, [loginDays, completedModules, todayLoggedIn, todayLearnedModules]);

  // Streak calculation
  const streak = useMemo(() => {
    let s = 0;
    const allLoginDays = new Set([...loginDays]);
    if (todayLoggedIn) allLoginDays.add(TODAY);
    for (let d = TODAY; d >= 1; d--) {
      if (allLoginDays.has(d)) s++;
      else break;
    }
    return s;
  }, [loginDays, todayLoggedIn]);

  const learningStreak = useMemo(() => {
    let s = 0;
    const allLearningDays = new Set([...learningDays]);
    if (todayLearnedModules.length > 0) allLearningDays.add(TODAY);
    for (let d = TODAY; d >= 1; d--) {
      if (allLearningDays.has(d)) s++;
      else break;
    }
    return s;
  }, [learningDays, todayLearnedModules]);

  // Current tier based on profile coins
  const tierCoins = Math.max(0, Number(coinPoints) || 0);
  const currentTier = TIERS.find(t => tierCoins >= t.min && tierCoins < t.max) || TIERS[TIERS.length - 1];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const tierProgress = nextTier ? Math.max(0, Math.round(((tierCoins - currentTier.min) / (nextTier.min - currentTier.min)) * 100)) : 100;

  const triggerBurst = (pts) => {
    setBurstPoints(pts);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 1200);
  };

  const handleDailyLogin = () => {
    if (todayLoggedIn) return;
    setTodayLoggedIn(true);
    setLoginDays(prev => new Set([...prev, TODAY]));
    triggerBurst(5);
  };

  const handleCompleteModule = (moduleId) => {
    if (todayLearnedModules.includes(moduleId)) return;
    const mod = LEARNING_MODULES.find(m => m.id === moduleId);
    if (!mod) return;
    const newLearned = [...todayLearnedModules, moduleId];
    setTodayLearnedModules(newLearned);
    setLearningDays(prev => new Set([...prev, TODAY]));
    setCompletedModules(prev => ({
      ...prev,
      [TODAY]: [...(prev[TODAY] || []), moduleId],
    }));
    triggerBurst(mod.points);
  };

  // Finance data
  const income = INCOME;
  const totalExp = useMemo(() => transactions.reduce((s, t) => s + t.amount, 0), [transactions]);
  const savings = income - totalExp;
  const savRate = Math.max(0, Math.round((savings / income) * 100));
  const catTotals = useMemo(() => {
    const m = {};
    transactions.forEach(t => { m[t.cat] = (m[t.cat] || 0) + t.amount; });
    return m;
  }, [transactions]);
  const catList = useMemo(() =>
    Object.entries(catTotals)
      .map(([k, v]) => ({ key: k, name: CATS[k]?.label || k, value: v, color: CATS[k]?.color || P.muted, icon: CATS[k]?.icon || "📦" }))
      .sort((a, b) => b.value - a.value),
    [catTotals]
  );
  const dailyData = useMemo(() => {
    const m = {};
    transactions.forEach(t => { m[t.day] = (m[t.day] || 0) + t.amount; });
    let cum = 0;
    return Array.from({ length: 30 }, (_, i) => {
      const d = i + 1;
      cum += (m[d] || 0);
      return { d, label: (d === 1 || d % 5 === 0) ? `${d}` : "", daily: m[d] || 0, cum };
    });
  }, [transactions]);
  const topCat = catList[0];
  const recent = useMemo(() => [...transactions].sort((a, b) => b.day - a.day).slice(0, showAll ? 16 : 6), [transactions, showAll]);
  const fmtK = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;
  const goalDeadlines = useMemo(
    () => GOALS.reduce((acc, goal) => {
      const day = Number(goal.deadlineDay);
      if (!Number.isFinite(day) || day < 1 || day > 31) return acc;
      if (!acc[day]) acc[day] = [];
      acc[day].push(goal);
      return acc;
    }, {}),
    []
  );
  const analysisInsights = useMemo(() => {
    const saveTone = savRate >= 30 ? { label: "Healthy", color: P.teal } : savRate >= 15 ? { label: "Moderate", color: P.amber } : { label: "Low", color: P.red };
    const topShare = totalExp > 0 && topCat ? Math.round((topCat.value / totalExp) * 100) : 0;
    return [
      { title: "Savings health", value: `${savRate}% (${saveTone.label})`, color: saveTone.color },
      { title: "Highest expense", value: topCat ? `${topCat.icon} ${topCat.name} (${topShare}%)` : "No transactions yet", color: P.navy },
      { title: "Goal due this month", value: Object.values(goalDeadlines).flat().length ? `${Object.values(goalDeadlines).flat().length} goal milestones` : "No goal dates set", color: P.navy },
    ];
  }, [savRate, totalExp, topCat, goalDeadlines]);

  // Selected day details
  const selectedDayInfo = selectedCalDay ? {
    login: loginDays.has(selectedCalDay) || (selectedCalDay === TODAY && todayLoggedIn),
    modules: selectedCalDay === TODAY ? todayLearnedModules : (completedModules[selectedCalDay] || []),
    goals: goalDeadlines[selectedCalDay] || [],
  } : null;

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", width: "100%", background: P.bg, padding: "16px 20px 36px" }}>
        <PointsBurst points={burstPoints} visible={showBurst} />

        {/* NAV */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg,${P.blue},${P.teal})`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <NavIcons.trend />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: P.navy, lineHeight: 1.1, letterSpacing: -0.3 }}>FinSight</p>
              <p style={{ fontSize: 9.5, color: P.muted, fontWeight: 500, letterSpacing: 0.5 }}>SMART FINANCE</p>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: P.card, borderRadius: 99, padding: "8px 10px",
            border: `1px solid ${P.border}`, boxShadow: "0 2px 8px rgba(11,27,53,.06)"
          }}>
            {NAV_ITEMS.map(({ id, label, to, Icon }) => {
              const IconComponent = NavIcons[Icon];
              return (
                <Link
                  key={id}
                  to={to}
                  title={label}
                  style={{
                    height: 34,
                    borderRadius: 999,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 11px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: activeNav === id ? "#fff" : P.slate,
                    background: activeNav === id ? P.navy : "transparent",
                    border: "none",
                  }}
                >
                  <IconComponent />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
          {/* Points badge in nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: `linear-gradient(135deg,${P.gold}18,${P.goldLight})`,
              border: `1px solid ${P.gold}44`,
              borderRadius: 99, padding: "4px 9px",
            }}>
              <span style={{ fontSize: 12 }}>{currentTier.icon}</span>
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: P.navy, lineHeight: 1 }}>{coinPoints.toLocaleString()} coins</p>
                <p style={{ fontSize: 8.5, color: P.muted, lineHeight: 1 }}>{currentTier.name}</p>
              </div>
            </div>
            <div style={{
              position: "relative", width: 42, height: 42, borderRadius: "50%",
              background: P.card, border: `1px solid ${P.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: P.slate
            }}>
              <NavIcons.bell />
              <span style={{
                position: "absolute", top: 8, right: 8, width: 8, height: 8,
                borderRadius: "50%", background: P.red, border: `2px solid ${P.card}`
              }} />
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: `linear-gradient(135deg,${P.blue},${P.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, color: "white", fontWeight: 700, cursor: "pointer"
            }}>
              {userInitial}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 16 }}>
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Welcome card */}
            <Card style={{ padding: "20px", background: `linear-gradient(135deg,${P.navy},#162B4F)`, border: "none" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.45)", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
                October 2024
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>
                Welcome back, {userName} 👋
              </h2>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.55)", marginBottom: 16 }}>
                Here's your financial snapshot
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { l: "Income", v: `₹${(income / 1000).toFixed(0)}k`, c: "rgba(255,255,255,.9)" },
                  { l: "Spent", v: fmtK(totalExp), c: "#FCA5A5" },
                  { l: "Saved", v: fmtK(Math.max(0, savings)), c: "#6EE7B7" },
                  { l: "Rate", v: `${savRate}%`, c: savRate >= 30 ? "#6EE7B7" : "#FCD34D" }
                ].map(s => (
                  <div key={s.l} style={{
                    background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "9px 11px",
                    border: "1px solid rgba(255,255,255,.08)"
                  }}>
                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,.4)", fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>
                      {s.l}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: s.c }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Card style={{ padding: "14px" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                <p style={{ fontSize: 11, color: P.muted }}>Net Savings</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: P.navy }}>{fmtK(Math.max(0, savings))}</p>
              </Card>
              <Card style={{ padding: "14px" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <p style={{ fontSize: 11, color: P.muted }}>Savings Rate</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: P.navy }}>{savRate}%</p>
              </Card>
            </div>

            {/* Top spending */}
            <Card style={{ padding: "18px" }}>
              <Lbl text="Top Spending" sub="by category" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {catList.slice(0, 5).map(c => (
                  <div key={c.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>{c.icon} {c.name}</span>
                      <span style={{ color: P.slate }}>{fmtK(c.value)}</span>
                    </div>
                    <PBar v={Math.round((c.value / totalExp) * 100)} color={c.color} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent transactions */}
            <Card style={{ padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <Lbl text="Recent Transactions" sub={`${transactions.length} total`} />
                <button
                  onClick={() => setShowAll(v => !v)}
                  style={{ fontSize: 11, fontWeight: 700, color: P.blue, background: "transparent", border: "none", cursor: "pointer" }}
                >
                  {showAll ? "Less" : "All →"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {recent.map(t => (
                  <div key={t.id} className="txn-row">
                    <div style={{
                      width: 30, height: 30, borderRadius: 9,
                      background: (t.meta?.color || P.muted) + "18",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13
                    }}>
                      {t.meta?.icon || "💳"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11.5, fontWeight: 600, color: P.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.desc}
                      </p>
                      <p style={{ fontSize: 10, color: P.muted }}>{t.date}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: P.navy }}>-₹{t.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* CENTER COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            

            {/* Category split and budget status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card style={{ padding: "18px" }}>
                <Lbl text="Category Split" sub="October 2024" />
                <div style={{ height: 150 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={catList} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={2} dataKey="value">
                        {catList.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 10 }}>
                  {catList.slice(0, 6).map((c) => (
                    <div key={`legend-${c.key}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: P.slate, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card style={{ padding: "18px" }}>
                <Lbl text="Budget Status" sub="Category overview" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {catList.slice(0, 4).map(c => {
                    const pct = Math.round((c.value / (CATS[c.key]?.budget || 50000)) * 100);
                    return (
                      <div key={c.key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: P.navy }}>
                            {c.icon} {c.name.split(" ")[0]}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: pct > 100 ? P.red : pct > 80 ? P.amber : P.teal }}>
                            {pct}%
                          </span>
                        </div>
                        <PBar v={pct} color={pct > 100 ? P.red : pct > 80 ? P.amber : c.color} h={4} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Income vs expenses */}
            <Card style={{ padding: "20px" }}>
              <Lbl text="Income vs Expenses" sub="Monthly financial health" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { l: "Income", v: income, c: P.teal, icon: "💵" },
                  { l: "Expenses", v: totalExp, c: P.red, icon: "💸" },
                  { l: "Savings", v: Math.max(0, savings), c: P.blue, icon: "💰" },
                ].map(row => (
                  <div key={row.l} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 15 }}>{row.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: P.slate }}>{row.l}</span>
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: P.navy, marginBottom: 6 }}>{fmtK(row.v)}</p>
                    <PBar v={Math.round((row.v / income) * 100)} color={row.c} h={4} />
                    <p style={{ fontSize: 9.5, color: P.muted, marginTop: 3, textAlign: "right" }}>
                      {Math.round((row.v / income) * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Learning Calendar */}
            <Card style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: P.navy, margin: 0 }}>Learning Calendar</p>
                  <p style={{ fontSize: 11, color: P.muted, margin: "2px 0 0" }}>October 2024 · click a day to see activity</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{
                    background: `linear-gradient(135deg,#FF6B35,#F59E0B)`,
                    borderRadius: 10, padding: "6px 10px",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span className="streak-flame" style={{ fontSize: 14 }}>🔥</span>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{learningStreak}d</p>
                      <p style={{ fontSize: 8.5, color: "rgba(255,255,255,.7)", lineHeight: 1 }}>streak</p>
                    </div>
                  </div>
                </div>
              </div>

              <LearningCalendar
                loginDays={new Set([...loginDays, ...(todayLoggedIn ? [TODAY] : [])])}
                learningDays={new Set([...learningDays, ...(todayLearnedModules.length > 0 ? [TODAY] : [])])}
                completedModules={{ ...completedModules, ...(todayLearnedModules.length > 0 ? { [TODAY]: todayLearnedModules } : {}) }}
                goalDeadlines={goalDeadlines}
                onDayClick={setSelectedCalDay}
                today={TODAY}
              />

              {selectedCalDay && (
                <div style={{
                  marginTop: 12, padding: "12px", borderRadius: 12,
                  background: P.borderSoft, border: `1px solid ${P.border}`,
                  animation: "fadeUp .2s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: P.navy }}>Oct {selectedCalDay}</p>
                    <button onClick={() => setSelectedCalDay(null)} style={{ background: "none", border: "none", cursor: "pointer", color: P.muted, fontSize: 14 }}>
                      ✕
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedDayInfo?.login && (
                      <span style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: P.tealLight, color: P.teal }}>
                        ✓ Logged in (+5 pts)
                      </span>
                    )}
                    {selectedDayInfo?.modules?.length > 0 ? (
                      selectedDayInfo.modules.map(mid => {
                        const mod = LEARNING_MODULES.find(m => m.id === mid);
                        return mod ? (
                          <span key={mid} style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: P.blueLight, color: P.blue }}>
                            {mod.icon} {mod.title} (+{mod.points} pts)
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span style={{ fontSize: 10.5, color: P.muted }}>No learning sessions</span>
                    )}
                    {selectedDayInfo?.goals?.map((goal) => (
                      <span key={`goal-date-${goal.id}`} style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: `${goal.color}14`, color: goal.color }}>
                        🎯 Goal target: {goal.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Today's Learning Modules */}
            <Card style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: P.navy, margin: 0 }}>Today's Learning</p>
                  <p style={{ fontSize: 11, color: P.muted, margin: "2px 0 0" }}>Oct {TODAY} · Earn points for each module</p>
                </div>
                {!todayLoggedIn ? (
                  <button onClick={handleDailyLogin} className="checkin-btn">
                    ✅ Check In +5pts
                  </button>
                ) : (
                  <span className="checkin-badge">✓ Checked In</span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {LEARNING_MODULES.map(mod => {
                  const done = todayLearnedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      className="module-btn"
                      onClick={() => handleCompleteModule(mod.id)}
                      disabled={done}
                      style={{
                        background: done
                          ? `linear-gradient(135deg,${P.blue}15,${P.purple}10)`
                          : P.borderSoft,
                        border: done ? `1.5px solid ${P.blue}44` : `1.5px solid ${P.border}`,
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{mod.icon}</div>
                      <p style={{ fontSize: 10.5, fontWeight: 700, color: done ? P.blue : P.navy, marginBottom: 2, lineHeight: 1.2 }}>
                        {mod.title}
                      </p>
                      <p style={{ fontSize: 9.5, color: P.muted, marginBottom: 6, lineHeight: 1.3 }}>{mod.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 9, color: P.muted }}>{mod.duration}</span>
                        <span style={{
                          fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 99,
                          background: done ? P.blueLight : P.goldLight,
                          color: done ? P.blue : P.gold,
                        }}>
                          {done ? "✓ Done" : `+${mod.points}pts`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Card style={{ padding: "16px" }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: P.navy, lineHeight: 1 }}>{transactions.length}</p>
                <p style={{ fontSize: 11, color: P.muted, marginTop: 4 }}>Transactions</p>
              </Card>
              <Card style={{ padding: "16px", background: `linear-gradient(135deg,${P.blue}10,${P.blueLight})` }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: P.blue, lineHeight: 1 }}>{Object.keys(catTotals).length}</p>
                <p style={{ fontSize: 11, color: P.slate, marginTop: 4 }}>Categories</p>
              </Card>
            </div>

            {/* Points & Tier Card */}
            <Card style={{ padding: "18px", background: `linear-gradient(135deg,#0B1B35,#1C2E50)`, border: "none", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${P.gold}15` }} />
              <div style={{ position: "absolute", bottom: -10, left: -10, width: 50, height: 50, borderRadius: "50%", background: `${P.purple}20` }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, position: "relative" }}>
                <div>
                  <p style={{ fontSize: 9.5, color: "rgba(255,255,255,.4)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
                    Wallet Coins
                  </p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: P.gold, lineHeight: 1 }}>{tierCoins.toLocaleString()}</p>
                  <p style={{ fontSize: 10.5, color: "rgba(255,255,255,.5)", marginTop: 2 }}>coins in profile</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{currentTier.icon}</div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: currentTier.color, marginTop: 2 }}>{currentTier.name}</p>
                </div>
              </div>

              {nextTier && (
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.4)" }}>Progress to {nextTier.icon} {nextTier.name}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: P.gold }}>{tierProgress}%</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 99, height: 5 }}>
                    <div style={{
                      height: "100%", width: `${tierProgress}%`,
                      background: `linear-gradient(90deg,${P.gold},#FDE68A)`,
                      borderRadius: 99, transition: "width 1s ease"
                    }} />
                  </div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
                    {nextTier.min - tierCoins} coins to next tier
                  </p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                {[
                  { l: "Login streak", v: `${streak}d 🔥`, c: "#FCD34D" },
                  { l: "Learn streak", v: `${learningStreak}d 📚`, c: "#6EE7B7" },
                  { l: "Days logged in", v: `${loginDays.size + (todayLoggedIn ? 1 : 0)}d`, c: "rgba(255,255,255,.8)" },
                  { l: "Sessions done", v: `${Object.values({ ...completedModules, ...(todayLearnedModules.length ? { [TODAY]: todayLearnedModules } : {}) }).flat().length}`, c: "rgba(255,255,255,.8)" },
                ].map(s => (
                  <div key={s.l} className="stat-box">
                    <p className="stat-label">{s.l}</p>
                    <p className="stat-value" style={{ color: s.c }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tier Roadmap */}
            <Card style={{ padding: "18px" }}>
              <Lbl text="Tier Roadmap" sub="Your progression path" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TIERS.map((tier, i) => {
                  const isActive = tier.name === currentTier.name;
                  const isPast = tierCoins >= tier.max;
                  return (
                    <div
                      key={tier.name}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", borderRadius: 10,
                        background: isActive ? `${tier.color}12` : isPast ? "#F0FDF4" : P.borderSoft,
                        border: isActive ? `1.5px solid ${tier.color}44` : "1.5px solid transparent",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{tier.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: isActive ? tier.color : isPast ? P.teal : P.slate }}>
                          {tier.name}
                        </p>
                        <p style={{ fontSize: 9.5, color: P.muted }}>
                          {tier.min.toLocaleString()}{tier.max < Infinity ? `–${tier.max.toLocaleString()}` : "+"} coins
                        </p>
                      </div>
                      {isPast && !isActive && <span style={{ fontSize: 12 }}>✅</span>}
                      {isActive && (
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: tier.color, background: `${tier.color}15`, padding: "2px 7px", borderRadius: 99 }}>
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Savings Goals */}
            <Card style={{ padding: "18px" }}>
              <Lbl text="Savings Goals" sub="4 active goals" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {GOALS.map(g => {
                  const pct = Math.round((g.saved / g.target) * 100);
                  return (
                    <div key={g.id} style={{ padding: "11px 13px", borderRadius: 11, border: `1px solid ${P.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: g.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                            {g.icon}
                          </div>
                          <div>
                            <p style={{ fontSize: 11.5, fontWeight: 700, color: P.navy, marginBottom: 1 }}>{g.label}</p>
                            <p style={{ fontSize: 10, color: P.muted }}>₹{g.saved.toLocaleString("en-IN")} / ₹{g.target.toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: g.color }}>{pct}%</span>
                      </div>
                      <PBar v={pct} color={g.color} h={4} />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Monthly Insight */}
            <Card style={{ padding: "18px" }}>
              <Lbl text="Monthly Analysis" sub="Auto summary from your data" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {analysisInsights.map((item) => (
                  <div key={item.title} style={{ padding: "10px 11px", borderRadius: 10, border: `1px solid ${P.border}`, background: "#F8FAFC" }}>
                    <p style={{ fontSize: 10, color: P.muted, marginBottom: 2, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.3 }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: 12, color: item.color, fontWeight: 700 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 10.5, color: P.muted, marginTop: 28, letterSpacing: 0.3 }}>
          FinSight · October 2024 · {transactions.length} transactions · All amounts in INR ₹ · {totalPoints} reward points earned
        </p>
      </div>
    </>
  );
}

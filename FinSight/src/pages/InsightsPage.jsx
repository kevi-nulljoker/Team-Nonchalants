import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import generateFinancialInsights from "../services/financialInsightsEngine";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .fin-root {
    font-family: 'DM Sans', sans-serif;
    background: #f7f6f2;
    color: #1a1a1a;
    min-height: 100vh;
  }

  /* ── Navbar ── */
  .navbar {
    background: #f7f6f2;
    padding: 14px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    cursor: pointer;
  }
  .nav-logo-icon {
    width: 42px; height: 42px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; color: white; font-weight: 700;
    box-shadow: 0 4px 12px rgba(29,78,216,0.25);
  }
  .nav-logo-name { font-weight: 700; font-size: 0.95rem; color: #1a1a1a; line-height: 1.1; letter-spacing: -0.01em; }
  .nav-logo-sub  { font-size: 0.65rem; color: #6b7280; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }

  .nav-center {
    background: white; border-radius: 999px;
    padding: 8px 10px; display: flex; align-items: center; gap: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07); border: 1px solid #e5e7eb;
  }
  .nav-btn {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 999px; cursor: pointer;
    transition: background 0.18s; color: #6b7280; font-size: 1.05rem;
    border: none; background: none;
  }
  .nav-btn:hover { background: #f3f4f6; color: #1a1a1a; }
  .nav-btn.active { background: #1a1a2e; color: white; }

  .nav-right { display: flex; align-items: center; gap: 10px; }

  .pts-badge {
    display: flex; align-items: center; gap: 6px;
    background: white; border: 1px solid #e5e7eb; border-radius: 999px;
    padding: 6px 14px 6px 10px; font-size: 0.82rem; font-weight: 600; color: #1a1a1a;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06); cursor: pointer;
    transition: box-shadow 0.18s;
  }
  .pts-badge:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.1); }
  .pts-num   { font-weight: 700; font-size: 0.82rem; }
  .pts-label { font-size: 0.68rem; color: #6b7280; font-weight: 500; }

  .nav-bell {
    position: relative; width: 40px; height: 40px;
    background: white; border: 1px solid #e5e7eb; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06); transition: box-shadow 0.18s;
  }
  .nav-bell:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.1); }
  .bell-dot {
    position: absolute; top: 8px; right: 9px;
    width: 7px; height: 7px;
    background: #dc2626; border-radius: 50%; border: 1.5px solid white;
  }
  .nav-avatar {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer;
    box-shadow: 0 2px 8px rgba(79,70,229,0.3);
  }

  /* ── Page content ── */
  .page-content { padding: 32px 24px 40px; }

  .page-header {
    max-width: 1100px; margin: 0 auto 40px;
    display: flex; align-items: flex-end; justify-content: space-between;
    border-bottom: 2px solid #1a1a1a; padding-bottom: 20px;
  }
  .page-header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 3rem; line-height: 1; letter-spacing: -0.02em;
  }
  .period {
    font-size: 0.85rem; color: #6b7280; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px;
  }

  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 999px;
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .badge-red    { background: #fee2e2; color: #dc2626; }
  .badge-amber  { background: #fef3c7; color: #d97706; }
  .badge-green  { background: #d1fae5; color: #2d6a4f; }

  /* ── Alert Banner ── */
  .alert-banner {
    max-width: 1100px; margin: 0 auto 32px;
    background: #fff5f5; border: 1.5px solid #fecaca;
    border-left: 5px solid #dc2626; border-radius: 12px;
    padding: 18px 24px; display: flex; align-items: flex-start; gap: 16px;
    animation: slideIn 0.5s ease both;
  }
  .alert-icon  { font-size: 1.4rem; margin-top: 2px; flex-shrink: 0; }
  .alert-title {
    font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: #dc2626;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .alert-tags  { display: flex; gap: 6px; margin-bottom: 8px; }
  .tag {
    background: #f3f4f6; color: #6b7280; font-size: 0.7rem; font-weight: 600;
    padding: 3px 10px; border-radius: 999px; letter-spacing: 0.04em; text-transform: lowercase;
  }
  .alert-text  { font-size: 0.88rem; color: #7f1d1d; line-height: 1.5; }
  .score-panel {
    max-width: 1100px; margin: 0 auto 20px;
    background: #ffffff; border: 1.5px solid #dbeafe; border-left: 5px solid #1d4ed8;
    border-radius: 12px; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .score-title {
    font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: #1d4ed8; margin-bottom: 4px;
  }
  .score-value {
    font-family: 'DM Serif Display', serif;
    font-size: 2.1rem; line-height: 1; color: #0f172a;
  }
  .score-subtext { font-size: 0.85rem; color: #64748b; margin-top: 4px; }

  /* ── Grid ── */
  .grid {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;
  }
  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; }
    .page-header h1 { font-size: 2rem; }
  }

  /* ── Cards ── */
  .card {
    background: white; border-radius: 16px; padding: 28px;
    border: 1.5px solid #e5e7eb; position: relative; overflow: hidden;
    animation: fadeUp 0.5s ease both;
  }
  .card:nth-child(1) { animation-delay: 0.1s; }
  .card:nth-child(2) { animation-delay: 0.2s; }
  .card:nth-child(3) { animation-delay: 0.3s; }

  .card.insights-card { background: #f0fdf4; border-color: #86efac; }
  .card.savings-card  { background: #fffbeb; border-color: #fcd34d; }
  .card.reco-card     { background: #eff6ff; border-color: #93c5fd; }

  .accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
  .insights-card .accent-bar { background: linear-gradient(90deg, #2d6a4f, #6ee7b7); }
  .savings-card  .accent-bar { background: linear-gradient(90deg, #d97706, #fde68a); }
  .reco-card     .accent-bar { background: linear-gradient(90deg, #1d4ed8, #93c5fd); }

  .card-icon     { font-size: 1.5rem; margin-bottom: 14px; display: block; }
  .card-title    {
    font-family: 'DM Serif Display', serif; font-size: 1.25rem; margin-bottom: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .card-subtitle {
    font-size: 0.78rem; color: #6b7280; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 20px;
  }

  .insight-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
  .insight-item {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 14px 16px; background: rgba(255,255,255,0.7);
    border-radius: 10px; border: 1px solid rgba(0,0,0,0.06);
    font-size: 0.875rem; line-height: 1.55; color: #374151;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .insight-item:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

  .bullet { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .insights-card .bullet { background: #2d6a4f; }
  .savings-card  .bullet { background: #d97706; }
  .reco-card     .bullet { background: #1d4ed8; }

  .saving-amount {
    display: inline-block; background: rgba(217,119,6,0.12); color: #d97706;
    font-size: 0.72rem; font-weight: 700; padding: 2px 8px;
    border-radius: 6px; margin-left: 6px; letter-spacing: 0.04em;
  }
  .surplus-highlight {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(45,106,79,0.1); color: #2d6a4f;
    font-weight: 700; padding: 1px 7px; border-radius: 5px; font-size: 0.9em;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ── Data ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "📊", label: "Transactions" },
  { icon: "🎯", label: "Goals" },
  { icon: "📖", label: "Learn" },
  { icon: "✦", label: "Insights" },
  { icon: "👤", label: "Profile" },
];
const NAV_ROUTE_BY_LABEL = {
  Dashboard: "/dashboard",
  Transactions: "/transactions",
  Goals: "/goals",
  Learn: "/learning",
  Insights: "/insights",
  Profile: "/signup",
};

const MONGO_SAMPLE_INPUT = {
  quizData: {
    income: 120000,
    stabilityScore: 72,
    fixedExpenses: { rent: 25000, emi: 35000, other: 12000 },
    behavior: { foodScore: 68, impulseScore: 62, trackingScore: 58, moneyStress: 64 },
    riskProfile: { riskTolerance: 45 },
  },
  transactions: [
    { amount: 120000, category: "salary", type: "credit", date: new Date("2026-02-01") },
    { amount: 32000, category: "food", type: "debit", date: new Date("2026-02-05") },
    { amount: 18000, category: "shopping", type: "debit", date: new Date("2026-02-08") },
    { amount: 21000, category: "emi", type: "debit", date: new Date("2026-02-10") },
    { amount: 9000, category: "travel", type: "debit", date: new Date("2026-02-12") },
    { amount: 6500, category: "entertainment", type: "debit", date: new Date("2026-02-14") },
  ],
  budgets: {
    food: 25000,
    shopping: 12000,
    emi: 30000,
    travel: 15000,
    entertainment: 10000,
  },
  goals: [
    { name: "Emergency Fund", targetAmount: 150000, currentAmount: 65000, deadline: new Date("2026-10-31") },
    { name: "Goa Vacation", targetAmount: 50000, currentAmount: 14000, deadline: new Date("2026-07-31") },
    { name: "New Laptop", targetAmount: 90000, currentAmount: 30000, deadline: new Date("2026-09-30") },
  ],
};

const buildCardsFromReport = (report) => [
  {
    id: "insights",
    cardClass: "insights-card",
    icon: "💡",
    title: "🟢 Spending Insights",
    subtitle: "Where your money is going",
    items: [...report.insights, ...report.spendingInsights].slice(0, 5),
  },
  {
    id: "savings",
    cardClass: "savings-card",
    icon: "🐷",
    title: "🌟 Saving Opportunities",
    subtitle: "Quick wins to cut costs",
    items: report.savingOpportunities.slice(0, 5),
  },
  {
    id: "reco",
    cardClass: "reco-card",
    icon: "🏆",
    title: "⭐ Recommendations",
    subtitle: "Action plan for your goals",
    items: report.recommendations.slice(0, 5),
  },
];

// ── Sub-components ────────────────────────────────────────────────────
function Navbar({ activeNav, setActiveNav, navigate }) {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="nav-logo" onClick={() => navigate("/")}>
        <div className="nav-logo-icon">📈</div>
        <div>
          <div className="nav-logo-name">FinSight</div>
          <div className="nav-logo-sub">Smart Finance</div>
        </div>
      </div>

      {/* Center pill */}
      <div className="nav-center">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`nav-btn${activeNav === item.label ? " active" : ""}`}
            title={item.label}
            onClick={() => {
              setActiveNav(item.label);
              const route = NAV_ROUTE_BY_LABEL[item.label];
              if (route) navigate(route);
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="nav-right">
        <div className="pts-badge">
          <span>🎓</span>
          <div>
            <div className="pts-num">415 pts</div>
            <div className="pts-label">Scholar</div>
          </div>
        </div>
        <div className="nav-bell">
          🔔
          <span className="bell-dot" />
        </div>
        <div className="nav-avatar">D</div>
      </div>
    </nav>
  );
}

function AlertBanner({ report }) {
  const alertText = report.insights[0] || "No major risk alerts for the selected period.";

  return (
    <div className="alert-banner">
      <div className="alert-icon">🚨</div>
      <div>
        <div className="alert-title">
          Financial Risk Alert
          <span className="badge badge-red">LOWSAVINGS</span>
        </div>
        <div className="alert-tags">
          {(report.metrics.topSavingsImpactCategories || []).map((cat) => (
            <span key={cat} className="tag">{cat}</span>
          ))}
        </div>
        <p className="alert-text">{alertText}</p>
      </div>
    </div>
  );
}

function InsightCard({ cardClass, icon, title, subtitle, items }) {
  return (
    <div className={`card ${cardClass}`}>
      <div className="accent-bar" />
      <span className="card-icon">{icon}</span>
      <h2 className="card-title">{title}</h2>
      <p className="card-subtitle">{subtitle}</p>
      <ul className="insight-list">
        {items.map((item, i) => (
          <li key={i} className="insight-item">
            <span className="bullet" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function InsightsPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Insights");
  const report = useMemo(() => generateFinancialInsights(MONGO_SAMPLE_INPUT), []);
  const safeScore = Number.isFinite(report?.financialScore) ? report.financialScore : 0;
  const cards = useMemo(() => buildCardsFromReport(report), [report]);

  return (
    <>
      <style>{styles}</style>
      <div className="fin-root">
        <Navbar activeNav={activeNav} setActiveNav={setActiveNav} navigate={navigate} />

        <div className="page-content">
          {/* Page header */}
          <div className="page-header">
            <div>
              <p className="period">February 2026 · Monthly Report</p>
              <h1>Insights</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="badge badge-red" style={{ marginBottom: 8, display: "inline-flex" }}>
                ⚠ Score {safeScore}/100
              </span>
              <p className="period" style={{ marginTop: 4 }}>Darshan Khapekar</p>
            </div>
          </div>

          <div className="score-panel">
            <div>
              <p className="score-title">Financial Health Score</p>
              <p className="score-value">{safeScore}/100</p>
              <p className="score-subtext">Calculated from savings, EMI load, emergency fund, goals, discipline, and stability.</p>
            </div>
            <span className={`badge ${safeScore >= 75 ? "badge-green" : safeScore >= 50 ? "badge-amber" : "badge-red"}`}>
              {safeScore >= 75 ? "Healthy" : safeScore >= 50 ? "Moderate" : "Needs Attention"}
            </span>
          </div>

          {/* Alert */}
          <AlertBanner report={report} />

          {/* Cards grid */}
          <div className="grid">
            {cards.map((card) => (
              <InsightCard key={card.id} {...card} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

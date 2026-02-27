import { useState } from "react";

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

const CARDS = [
  {
    id: "insights",
    cardClass: "insights-card",
    icon: "💡",
    title: "🟢 Spending Insights",
    subtitle: "Where your money is going",
    items: [
      <>You have a healthy net surplus of <span className="surplus-highlight">≈₹97,100</span> over the past two months, but a large share (≈55%) is on frequent food delivery, transportation rides, and entertainment subscriptions.</>,
      <>Your effective savings rate is about <strong>79%</strong> of total income, indicating strong cash-flow discipline — yet the combined shortfall for all three goals (≈₹1,43,000) exceeds the current surplus.</>,
      <>The Emergency Fund is only <strong>45% funded</strong>. Completing this safety net should be the top priority before allocating funds to discretionary goals.</>,
    ],
  },
  {
    id: "savings",
    cardClass: "savings-card",
    icon: "🐷",
    title: "🌟 Saving Opportunities",
    subtitle: "Quick wins to cut costs",
    items: [
      <>Reduce food-delivery orders (Swiggy / Zomato) by cooking at home — potential saving of ≈₹2,000 / month.<span className="saving-amount">save ₹2,000</span></>,
      <>Consolidate entertainment subscriptions (Netflix, movies) to a single plan — potential saving of ≈₹200 / month.<span className="saving-amount">save ₹200</span></>,
      <>Switch to a monthly public-transport pass or car-pooling to cut ride-share costs — potential saving of ≈₹300 / month.<span className="saving-amount">save ₹300</span></>,
    ],
  },
  {
    id: "reco",
    cardClass: "reco-card",
    icon: "🏆",
    title: "⭐ Recommendations",
    subtitle: "Action plan for your goals",
    items: [
      <>Direct a fixed <strong>≈₹20,000 / month</strong> to the Emergency Fund until it reaches the ₹1,00,000 target (≈5 months).</>,
      <>Once the emergency fund is complete, allocate <strong>≈₹12,000</strong> monthly to the iPhone 16 goal and <strong>≈₹10,000</strong> monthly to the Goa vacation to meet both targets within 5–6 months.</>,
      <>Invest any remaining surplus in low-risk instruments (e.g., 1–2 year fixed deposit or short-term debt mutual funds) to earn interest and accelerate all goal timelines.</>,
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────
function Navbar({ activeNav, setActiveNav }) {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="nav-logo">
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
            onClick={() => setActiveNav(item.label)}
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

function AlertBanner() {
  return (
    <div className="alert-banner">
      <div className="alert-icon">🚨</div>
      <div>
        <div className="alert-title">
          Irregular Spending / Savings Alert
          <span className="badge badge-red">LOWSAVINGS</span>
        </div>
        <div className="alert-tags">
          <span className="tag">entertainment</span>
          <span className="tag">food</span>
        </div>
        <p className="alert-text">
          Your current savings are <strong>₹–74,193</strong> vs expected{" "}
          <strong>₹–20,674</strong> (–259%). Consider controlling discretionary
          expenses to get back on track.
        </p>
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
  const [activeNav, setActiveNav] = useState("Insights");

  return (
    <>
      <style>{styles}</style>
      <div className="fin-root">
        <Navbar activeNav={activeNav} setActiveNav={setActiveNav} />

        <div className="page-content">
          {/* Page header */}
          <div className="page-header">
            <div>
              <p className="period">October 2024 · Monthly Report</p>
              <h1>Insights</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="badge badge-red" style={{ marginBottom: 8, display: "inline-flex" }}>
                ⚠ Low Savings
              </span>
              <p className="period" style={{ marginTop: 4 }}>Darshan Khapekar</p>
            </div>
          </div>

          {/* Alert */}
          <AlertBanner />

          {/* Cards grid */}
          <div className="grid">
            {CARDS.map((card) => (
              <InsightCard key={card.id} {...card} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

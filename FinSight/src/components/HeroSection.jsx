import React from "react";

const styles = `
:root {
  --bg: #f4f6f9;
  --text: #0b1736;
  --muted: #6f7c95;
  --line: #e6ebf3;
  --white: #ffffff;
  --teal: #07a587;
  --teal-dark: #028f73;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #edf3f2;
  color: var(--text);
  font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  width: 100%;
  overflow-x: hidden;
}

a {
  text-decoration: none;
  color: inherit;
}

.page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.top-border {
  height: 6px;
  background: #6195ff;
  width: 100%;
}

.nav-wrap {
  background: #f8fbff;
  border-bottom: 1px solid var(--line);
  width: 100%;
}

.nav {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  height: 74px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 30px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #0ea67f;
  color: white;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.nav-links {
  display: flex;
  gap: 38px;
  color: #4f5f7c;
  font-weight: 600;
  font-size: 15px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.signin {
  font-weight: 700;
  color: #162445;
}

.moon {
  color: #26344f;
  font-size: 18px;
}

.get-started-nav {
  border: none;
  background: #08a878;
  color: #fff;
  border-radius: 999px;
  padding: 13px 24px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(5, 156, 121, 0.25);
}

.hero-bg {
  background: linear-gradient(180deg, #f6fbff 0%, #f2f8f7 72%, #edf3f2 100%);
  width: 100%;
  flex: 1;
}

.hero {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 56px 32px 0;
  text-align: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 20px;
  background: #c9f4e2;
  color: #167e66;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.hero h1 {
  margin: 30px auto 18px;
  font-size: 64px;
  line-height: 1.04;
  letter-spacing: -0.03em;
  max-width: 940px;
  font-weight: 900;
}

.hero h1 span {
  color: #00a79f;
}

.sub {
  max-width: 760px;
  margin: 0 auto;
  color: #70809a;
  font-size: 28px;
  line-height: 1.45;
  font-weight: 600;
}

.hero-btns {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-main {
  border: 0;
  background: #06a878;
  color: #fff;
  border-radius: 999px;
  height: 58px;
  padding: 0 34px;
  font-size: 24px;
  font-weight: 800;
  box-shadow: 0 12px 28px rgba(5, 166, 126, 0.28);
  cursor: pointer;
}

.btn-ghost {
  border: 1px solid #dbe2ec;
  background: #fff;
  color: #1f2e4d;
  border-radius: 999px;
  height: 58px;
  padding: 0 32px;
  font-size: 24px;
  font-weight: 800;
  cursor: pointer;
}

.dashboard-wrap {
  margin-top: 40px;
  padding-bottom: 54px;
  position: relative;
  width: 100%;
}

.dashboard {
  position: relative;
  margin: 0 auto;
  width: min(1130px, calc(100vw - 64px));
  background: #fff;
  border: 1px solid #e4ebf3;
  border-radius: 18px;
  box-shadow: 0 22px 40px rgba(20, 44, 84, 0.12);
  overflow: hidden;
}

.dash-url {
  height: 52px;
  border-bottom: 1px solid #edf1f6;
  display: grid;
  place-items: center;
  color: #98a5bb;
  font-size: 14px;
  font-weight: 600;
}

.dash-content {
  padding: 30px;
}

.dash-title-sm {
  color: #9eb0c9;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.dash-title {
  margin-top: 6px;
  font-size: 34px;
  font-weight: 900;
}

.switches {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.switch {
  border-radius: 999px;
  border: 1px solid #dbe3ef;
  background: #fff;
  padding: 6px 16px;
  color: #55688b;
  font-size: 13px;
  font-weight: 700;
}

.switch.active {
  background: #06a878;
  color: #fff;
  border-color: transparent;
}

.chart-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.panel {
  border: 1px solid #edf1f6;
  border-radius: 14px;
  padding: 20px;
}

.panel-title {
  color: #8695ad;
  font-size: 14px;
  font-weight: 700;
}

.panel-amount {
  margin-top: 4px;
  font-size: 30px;
  font-weight: 900;
}

.bars {
  margin-top: 22px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 108px;
}

.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: #e9eef5;
}

.bar:nth-child(2) { height: 65%; }
.bar:nth-child(1), .bar:nth-child(3) { height: 50%; }
.bar:nth-child(4) { height: 74%; }
.bar:nth-child(5) { height: 82%; background: #a7ddcc; }
.bar:nth-child(6) { height: 100%; background: #08a97e; }

.ring-wrap {
  display: flex;
  gap: 24px;
  align-items: center;
  height: 100%;
}

.ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#08a97e 0 46%, #17a8db 46% 70%, #b8d0f6 70% 100%);
  position: relative;
}

.ring::after {
  content: "Categories";
  position: absolute;
  inset: 16px;
  background: #fff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #8b9ab1;
  font-size: 12px;
  font-weight: 700;
}

.legend {
  display: grid;
  gap: 10px;
  font-size: 14px;
  color: #576a8d;
  font-weight: 700;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.recent {
  margin-top: 16px;
  border: 1px solid #edf1f6;
  border-radius: 14px;
  overflow: hidden;
}

.recent-head {
  height: 48px;
  border-bottom: 1px solid #edf1f6;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: #334566;
  font-weight: 800;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f4f8;
}

.item:last-child {
  border-bottom: 0;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 14px;
}

.item-icon.orange { background: #ffe9d6; color: #f27621; }
.item-icon.green { background: #d8faec; color: #0da87e; }

.item-name {
  font-weight: 800;
  color: #243455;
}

.item-meta {
  font-size: 12px;
  color: #93a2b8;
  font-weight: 700;
}

.item-amt {
  font-weight: 800;
  color: #223454;
}

.float-card {
  position: absolute;
  background: #fff;
  border: 1px solid #e8edf4;
  border-radius: 12px;
  box-shadow: 0 14px 24px rgba(25, 49, 91, 0.14);
}

.budget {
  width: 180px;
  left: -70px;
  top: 72px;
  padding: 14px;
}

.budget-title {
  color: #7f90aa;
  font-size: 11px;
  font-weight: 800;
}

.budget-value {
  margin: 10px 0 6px;
  color: #06a87a;
  font-size: 26px;
  font-weight: 900;
}

.budget-bar {
  height: 8px;
  border-radius: 999px;
  background: #dfe8f2;
  overflow: hidden;
}

.budget-bar > span {
  display: block;
  width: 85%;
  height: 100%;
  background: #07b07f;
}

.dining {
  width: 210px;
  right: -68px;
  top: 172px;
  padding: 14px;
}

.dining-mini {
  color: #95a4b9;
  font-size: 11px;
  font-weight: 800;
}

.dining-name {
  margin-top: 3px;
  color: #1e2f4d;
  font-weight: 900;
}

.dining-note {
  margin-top: 2px;
  color: #32a9f0;
  font-size: 12px;
  font-weight: 700;
}

.dining-foot {
  margin-top: 8px;
  font-weight: 900;
  color: #1f304f;
}

.shared {
  width: 180px;
  left: 58%;
  transform: translateX(-50%);
  bottom: -24px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-stack {
  display: flex;
}

.avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #fff;
  margin-right: -7px;
}

.avatar.one { background: #6e78ff; }
.avatar.two { background: #f13995; }

.shared-text {
  color: #7e8da6;
  font-size: 12px;
  font-weight: 800;
}

.features {
  background: #f9fbff;
  border-top: 1px solid #e5ebf3;
  border-bottom: 1px solid #e5ebf3;
  padding: 90px 32px;
  width: 100%;
}

.features-inner {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.features h2 {
  text-align: center;
  font-size: 48px;
  font-weight: 900;
}

.features p {
  margin: 14px auto 46px;
  text-align: center;
  max-width: 740px;
  color: #6f7e97;
  font-size: 24px;
  line-height: 1.4;
  font-weight: 600;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
}

.card {
  background: #f3f6fb;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 30px;
}

.iconbox {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 22px;
  margin-bottom: 18px;
}

.iconbox.blue { background: #dce8ff; color: #4b82ff; }
.iconbox.green { background: #d7f7e8; color: #13a779; }
.iconbox.purple { background: #efdeff; color: #9a57ff; }

.card h3 {
  font-size: 30px;
  margin-bottom: 10px;
}

.card p {
  margin: 0;
  text-align: left;
  font-size: 22px;
  max-width: none;
}

.footer {
  background: #f8fbff;
  padding: 22px 32px;
  width: 100%;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 70px;
  border-top: 1px solid #e6ebf3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7a8aa5;
  font-weight: 700;
  width: 100%;
}

.footer-center {
  font-size: 13px;
}

.footer-icons {
  display: flex;
  gap: 14px;
  color: #91a1ba;
}

@media (max-width: 980px) {
  .nav-links {
    display: none;
  }

  .hero h1 {
    font-size: 44px;
  }

  .sub {
    font-size: 20px;
  }

  .btn-main,
  .btn-ghost {
    font-size: 22px;
    height: 52px;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .float-card {
    display: none;
  }

  .nav, .hero, .features-inner, .footer-inner {
    padding-left: 20px;
    padding-right: 20px;
  }
}
`;

function HeroSection() {     
  return (
    <div className="page">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      />
      <style>{styles}</style>

      <div className="top-border"></div>
      <div className="nav-wrap">
        <header className="nav">
          <div className="brand">
            <div className="brand-mark">
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
            <span>Finsight</span>
          </div>

          <nav className="nav-links">
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Blog</a>
          </nav>

          <div className="nav-actions">
            <span className="moon">
              <i className="fa-regular fa-moon"></i>
            </span>
            <a href="#" className="signin">
              Sign In
            </a>
            <button className="get-started-nav">
              Get Started <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </header>
      </div>

      <section className="hero-bg">
        <div className="hero">
          <div className="pill">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            AI-POWERED FINANCIAL INSIGHTS
          </div>
          <h1>
            Your Money, <span>Visualized</span>
            <br />
            and Mastered
          </h1>
          <p className="sub">
            Easily track expenses, set smart budgets, and gain deep insights into your spending habits with our
            high-fidelity interactive dashboard.
          </p>

          <div className="hero-btns">
            <button className="btn-main">
              Get Started for Free <i className="fa-solid fa-arrow-right"></i>
            </button>
            <button className="btn-ghost">
              <i className="fa-regular fa-circle-play"></i> Watch Demo
            </button>
          </div>

          <div className="dashboard-wrap">
            <div className="dashboard">
              <div className="dash-url">app.finsight.io/dashboard</div>
              <div className="dash-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="dash-title-sm">OVERVIEW</div>
                    <div className="dash-title">Spending Analytics</div>
                  </div>
                  <div className="switches">
                    <span className="switch">Monthly</span>
                    <span className="switch active">Weekly</span>
                  </div>
                </div>

                <div className="chart-grid">
                  <div className="panel">
                    <div className="panel-title">Monthly Savings</div>
                    <div className="panel-amount">$3,240.00</div>
                    <div className="bars">
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="ring-wrap">
                      <div className="ring"></div>
                      <div className="legend">
                        <div>
                          <span className="dot" style={{ background: "#08a97e" }}></span>
                          Housing
                        </div>
                        <div>
                          <span className="dot" style={{ background: "#18a6df" }}></span>
                          Dining
                        </div>
                        <div>
                          <span className="dot" style={{ background: "#b7cef4" }}></span>
                          Travel
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="recent">
                  <div className="recent-head">Recent Activity</div>
                  <div className="item">
                    <div className="item-left">
                      <div className="item-icon orange">
                        <i className="fa-solid fa-utensils"></i>
                      </div>
                      <div>
                        <div className="item-name">Blue Bottle Coffee</div>
                        <div className="item-meta">Food & Drinks • 2h ago</div>
                      </div>
                    </div>
                    <div className="item-amt">-$12.50</div>
                  </div>
                  <div className="item">
                    <div className="item-left">
                      <div className="item-icon green">
                        <i className="fa-solid fa-cart-shopping"></i>
                      </div>
                      <div>
                        <div className="item-name">Apple Store</div>
                        <div className="item-meta">Electronics • 5h ago</div>
                      </div>
                    </div>
                    <div className="item-amt">-$1,299.00</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="float-card budget">
              <div className="budget-title">MONTHLY BUDGET</div>
              <div className="budget-value">85%</div>
              <div className="budget-bar">
                <span></span>
              </div>
            </div>

            <div className="float-card dining">
              <div className="dining-mini">TOP EXPENSE</div>
              <div className="dining-name">Dining Out</div>
              <div className="dining-note">15% more than usual</div>
              <div className="dining-foot">30%</div>
            </div>

            <div className="float-card shared">
              <div className="avatar-stack">
                <span className="avatar one"></span>
                <span className="avatar two"></span>
              </div>
              <div className="shared-text">Shared with 3 others</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <h2>Everything you need to grow</h2>
          <p>Powerful features designed to give you complete control over your financial journey.</p>

          <div className="cards">
            <article className="card">
              <div className="iconbox blue">
                <i className="fa-regular fa-rectangle-list"></i>
              </div>
              <h3>Expense Tracking</h3>
              <p>Automatically categorize and track every cent across all your accounts in real-time.</p>
            </article>
            <article className="card">
              <div className="iconbox green">
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <h3>Smart Budgeting</h3>
              <p>Set monthly limits and get notified before you overspend. We help you stay on track.</p>
            </article>
            <article className="card">
              <div className="iconbox purple">
                <i className="fa-solid fa-brain"></i>
              </div>
              <h3>AI Predictions</h3>
              <p>Our AI analyzes your habits to predict future expenses and suggests saving opportunities.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="brand" style={{ fontSize: 31 }}>
            <div className="brand-mark" style={{ width: 32, height: 32, fontSize: 14 }}>
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
            <span>Finsight</span>
          </div>
          <div className="footer-center">© 2024 Finsight. All rights reserved. Built for financial freedom.</div>
          <div className="footer-icons">
            <i className="fa-solid fa-volume-high"></i>
            <i className="fa-solid fa-globe"></i>
            <i className="fa-solid fa-sun"></i>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HeroSection;
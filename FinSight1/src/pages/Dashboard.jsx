import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from "recharts";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const T = {
  green:       "#22A96A",
  greenDark:   "#178050",
  greenLight:  "#EAF6F0",
  greenMid:    "#B2DEC8",
  navy:        "#0E1E2E",
  navyMid:     "#1C3043",
  slate:       "#475569",
  muted:       "#8898AA",
  faint:       "#D0DDED",
  bg:          "#F3F8F5",
  card:        "#FFFFFF",
  border:      "#DDE9E3",
  borderSoft:  "#ECF4EF",
  red:         "#E8404A",
  redLight:    "#FDF0F1",
  amber:       "#E8900A",
  amberLight:  "#FEF7EC",
  blue:        "#2E74D9",
  blueLight:   "#EEF5FD",
  purple:      "#7C5CFC",
  purpleLight: "#F4F1FF",
};

/* ─── EXACT CATEGORIES from OCR scanner ─────────────────────── */
const CATS = {
  food:          { label: "Food & Dining",  color: "#22A96A", icon: "🍜", budget: 25000 },
  shopping:      { label: "Shopping",       color: "#7C5CFC", icon: "🛍",  budget: 20000 },
  education:     { label: "Education",      color: "#2E74D9", icon: "📖",  budget: 20000 },
  emi:           { label: "EMI / Loans",    color: "#E8404A", icon: "🏦",  budget: 30000 },
  investment:    { label: "Investment",     color: "#14B8A6", icon: "📈",  budget: 35000 },
  travel:        { label: "Travel",         color: "#E8900A", icon: "✈",  budget: 20000 },
  healthcare:    { label: "Healthcare",     color: "#EF4444", icon: "💊",  budget: 15000 },
  utilities:     { label: "Utilities",      color: "#06B6D4", icon: "⚡",  budget: 15000 },
  entertainment: { label: "Entertainment",  color: "#F59E0B", icon: "🎬",  budget: 10000 },
};

/* ─── MOCK TRANSACTIONS (shaped like CSV OCR output) ─────────── */
const RAW = [
  { text:"Swiggy order INR 1240 TXNa1b2c3",      cat:"food",          day:1  },
  { text:"Mobile recharge INR 299 TXNd4e5f6",     cat:"utilities",     day:1  },
  { text:"Mutual fund SIP INR 5000 TXNg7h8i9",    cat:"investment",    day:2  },
  { text:"Uber ride INR 320 TXNj0k1l2",           cat:"travel",        day:2  },
  { text:"Amazon purchase INR 2850 TXNm3n4o5",    cat:"shopping",      day:3  },
  { text:"Credit card EMI INR 8500 TXNp6q7r8",    cat:"emi",           day:3  },
  { text:"Doctor consultation INR 800 TXNs9t0u1", cat:"healthcare",    day:4  },
  { text:"Netflix subscription INR 649 TXNv2w3x4",cat:"entertainment", day:4  },
  { text:"Online course subscription INR 1999 TXNy5z6a7", cat:"education", day:5 },
  { text:"Electricity bill payment INR 1240 TXNb8c9d0",   cat:"utilities",  day:5 },
  { text:"Zomato dinner INR 580 TXNe1f2g3",       cat:"food",          day:6  },
  { text:"Flipkart order INR 3200 TXNh4i5j6",     cat:"shopping",      day:6  },
  { text:"Ola cab INR 220 TXNk7l8m9",             cat:"travel",        day:7  },
  { text:"Home loan EMI INR 18000 TXNn0o1p2",     cat:"emi",           day:8  },
  { text:"Stock purchase INR 10000 TXNq3r4s5",    cat:"investment",    day:8  },
  { text:"Cafe coffee INR 460 TXNt6u7v8",         cat:"food",          day:9  },
  { text:"Pharmacy medicine purchase INR 540 TXNw9x0y1", cat:"healthcare", day:9 },
  { text:"Bus ticket INR 180 TXNz2a3b4",          cat:"travel",        day:10 },
  { text:"Water bill INR 320 TXNc5d6e7",          cat:"utilities",     day:10 },
  { text:"Exam fee INR 1500 TXNf8g9h0",           cat:"education",     day:11 },
  { text:"Movie ticket booking INR 680 TXNi1j2k3",cat:"entertainment", day:11 },
  { text:"Pizza delivery INR 720 TXNl4m5n6",      cat:"food",          day:12 },
  { text:"Online shopping payment INR 1890 TXNo7p8q9", cat:"shopping", day:12 },
  { text:"Hotel booking INR 4500 TXNr0s1t2",      cat:"travel",        day:13 },
  { text:"Medical test charges INR 1100 TXNu3v4w5",cat:"healthcare",   day:13 },
  { text:"PPF contribution INR 5000 TXNx6y7z8",   cat:"investment",    day:14 },
  { text:"Gas bill payment INR 850 TXNa9b0c1",    cat:"utilities",     day:14 },
  { text:"Bike loan EMI INR 6200 TXNd2e3f4",      cat:"emi",           day:15 },
  { text:"Restaurant bill INR 1340 TXNg5h6i7",    cat:"food",          day:15 },
  { text:"Library fee INR 500 TXNj8k9l0",         cat:"education",     day:16 },
  { text:"Concert ticket INR 1200 TXNm1n2o3",     cat:"entertainment", day:16 },
  { text:"Train ticket IRCTC INR 890 TXNp4q5r6",  cat:"travel",        day:17 },
  { text:"Clothing store bill INR 2100 TXNs7t8u9",cat:"shopping",      day:17 },
  { text:"Fixed deposit investment INR 10000 TXNv0w1x2", cat:"investment", day:18 },
  { text:"Hospital bill INR 2800 TXNy3z4a5",      cat:"healthcare",    day:18 },
  { text:"Internet recharge INR 999 TXNb6c7d8",   cat:"utilities",     day:19 },
  { text:"Swiggy order INR 640 TXNe9f0g1",        cat:"food",          day:19 },
  { text:"Personal loan installment INR 7000 TXNh2i3j4", cat:"emi",    day:20 },
  { text:"Online course subscription INR 2499 TXNk5l6m7", cat:"education", day:20 },
  { text:"Flipkart order INR 4100 TXNn8o9p0",     cat:"shopping",      day:21 },
  { text:"Flight ticket booking INR 5200 TXNq1r2s3", cat:"travel",     day:21 },
  { text:"Game purchase INR 499 TXNt4u5v6",        cat:"entertainment",day:22 },
  { text:"Crypto investment INR 3000 TXNw7x8y9",   cat:"investment",   day:22 },
  { text:"Food court payment INR 920 TXNz0a1b2",   cat:"food",         day:23 },
  { text:"Electronics shopping INR 6800 TXNc3d4e5",cat:"shopping",     day:23 },
  { text:"Car loan EMI INR 9500 TXNf6g7h8",        cat:"emi",          day:24 },
  { text:"Pharmacy medicine purchase INR 380 TXNi9j0k1", cat:"healthcare", day:24 },
  { text:"Electricity bill payment INR 1100 TXNl2m3n4", cat:"utilities", day:25 },
  { text:"College fees payment INR 8000 TXNo5p6q7",cat:"education",    day:25 },
  { text:"Ola cab INR 340 TXNr8s9t0",              cat:"travel",        day:26 },
  { text:"Lunch at hotel INR 1100 TXNu1v2w3",      cat:"food",         day:26 },
  { text:"Mutual fund SIP INR 3000 TXNx4y5z6",     cat:"investment",   day:27 },
  { text:"Concert ticket INR 1500 TXNa7b8c9",      cat:"entertainment",day:27 },
  { text:"Amazon purchase INR 1650 TXNd0e1f2",     cat:"shopping",     day:28 },
  { text:"Doctor consultation INR 600 TXNg3h4i5",  cat:"healthcare",   day:28 },
  { text:"Swiggy order INR 480 TXNj6k7l8",         cat:"food",         day:29 },
  { text:"Mobile recharge INR 239 TXNm9n0o1",      cat:"utilities",    day:29 },
  { text:"Hotel booking INR 3200 TXNp2q3r4",       cat:"travel",       day:30 },
  { text:"Stock purchase INR 8000 TXNs5t6u7",      cat:"investment",   day:30 },
];

const INCOME = 75000;

/* ─── PARSE + ENRICH ─────────────────────────────────────────── */
function parseAmt(text) {
  const m = text.match(/INR (\d+)/);
  return m ? parseInt(m[1]) : 0;
}
function cleanDesc(text) {
  return text.replace(/TXN[a-f0-9]+/gi, "").replace(/INR \d+/, "").trim();
}

const TRANSACTIONS = RAW.map((r, i) => ({
  id: i,
  text: r.text,
  desc: cleanDesc(r.text),
  txnId: r.text.match(/TXN[a-f0-9]+/i)?.[0] || "—",
  cat: r.cat,
  amount: parseAmt(r.text),
  day: r.day,
  date: `Oct ${String(r.day).padStart(2, "0")}`,
  meta: CATS[r.cat] || CATS.shopping,
}));

/* ─── SAVINGS GOALS ──────────────────────────────────────────── */
const GOALS = [
  { id:"emergency", label:"Emergency Fund", target:150000, saved:62000,  icon:"🛡", color:T.green,  desc:"3–6 months coverage" },
  { id:"vacation",  label:"Goa Trip Fund",  target:40000,  saved:28500,  icon:"🏖", color:T.amber,  desc:"December 2024 travel" },
  { id:"gadget",    label:"New Laptop",      target:80000,  saved:45000,  icon:"💻", color:T.blue,   desc:"Upgrade goal" },
  { id:"invest",    label:"Annual SIP Goal", target:60000,  saved:36000,  icon:"📈", color:T.purple, desc:"Equity investments" },
];

/* ─── SMART TIPS ENGINE ──────────────────────────────────────── */
function genTips(catTotals, totalExp, income) {
  const tips = [];
  const savRate = Math.round(((income - totalExp) / income) * 100);

  Object.entries(catTotals).forEach(([key, spent]) => {
    const meta = CATS[key];
    if (!meta) return;
    const pct = Math.round((spent / meta.budget) * 100);
    if (pct > 115) {
      tips.push({ type:"warning", icon:"⚠", title:`${meta.label} over budget by ${pct-100}%`, body:`Spent ₹${spent.toLocaleString("en-IN")} vs ₹${meta.budget.toLocaleString("en-IN")} budget. Review recurring charges here.` });
    } else if (pct < 55 && spent > 0) {
      tips.push({ type:"positive", icon:"✓", title:`Good control on ${meta.label}`, body:`Only ${pct}% of budget used. You freed up ₹${(meta.budget-spent).toLocaleString("en-IN")} — consider redirecting to savings.` });
    }
  });

  if (savRate < 20) {
    tips.push({ type:"alert", icon:"↓", title:`Savings rate at ${savRate}% — below 20% threshold`, body:"Consider reducing discretionary spend (entertainment, shopping) by 10–15% to meet the 20% savings benchmark." });
  } else {
    tips.push({ type:"positive", icon:"↑", title:`Strong savings rate of ${savRate}%`, body:"You're exceeding the 20% savings goal. Channel the surplus into equity SIPs or your emergency fund for compounding gains." });
  }

  const emiPct = Math.round(((catTotals.emi || 0) / income) * 100);
  if (emiPct > 35) {
    tips.push({ type:"alert", icon:"!", title:`EMI burden: ${emiPct}% of monthly income`, body:"Debt-to-income above 35% is high risk. Prioritise prepaying the highest-interest loan to reduce pressure." });
  }

  return tips.slice(0, 4);
}

/* ─── REUSABLE COMPONENTS ────────────────────────────────────── */
function Card({ children, style = {} }) {
  return (
    <div style={{ background:T.card, borderRadius:13, border:`1px solid ${T.border}`, boxShadow:"0 1px 6px rgba(14,30,46,0.05)", ...style }}>
      {children}
    </div>
  );
}

function SecHead({ title, sub, right }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
      <div>
        <p style={{ fontSize:13.5, fontWeight:700, color:T.navy, letterSpacing:-0.1, margin:0 }}>{title}</p>
        {sub && <p style={{ fontSize:11, color:T.muted, margin:"2px 0 0" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function PBar({ value, color, h = 5 }) {
  return (
    <div style={{ background:T.borderSoft, borderRadius:99, height:h, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${Math.min(value,100)}%`, background:color, borderRadius:99, transition:"width 1s ease" }} />
    </div>
  );
}

function Chip({ label, color, bg, border }) {
  return (
    <span style={{ fontSize:10.5, fontWeight:700, color, background:bg, border:`1px solid ${border||bg}`, padding:"2px 8px", borderRadius:5, letterSpacing:0.2 }}>
      {label}
    </span>
  );
}

function RTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", boxShadow:"0 6px 20px rgba(0,0,0,0.08)", fontSize:12, fontFamily:"inherit" }}>
      {label && <p style={{ fontWeight:700, color:T.navy, marginBottom:5 }}>{label}</p>}
      {payload.map((p,i) => (
        <p key={i} style={{ display:"flex", alignItems:"center", gap:6, margin:"2px 0" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:p.color||T.green, display:"inline-block" }} />
          <span style={{ color:T.muted }}>{p.name}:</span>
          <strong style={{ color:T.navy }}>₹{Number(p.value).toLocaleString("en-IN")}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── MAIN DASHBOARD ─────────────────────────────────────────── */
export default function Dashboard({ transactions = TRANSACTIONS, income = INCOME }) {

  const [expandGoal, setExpandGoal]   = useState(null);
  const [showAllTxns, setShowAllTxns] = useState(false);

  /* totals */
  const totalExp  = useMemo(() => transactions.reduce((s,t) => s + t.amount, 0), [transactions]);
  const savings   = income - totalExp;
  const savRate   = Math.max(0, Math.round((savings / income) * 100));

  /* per-category */
  const catTotals = useMemo(() => {
    const m = {};
    transactions.forEach(t => { m[t.cat] = (m[t.cat]||0) + t.amount; });
    return m;
  }, [transactions]);

  const catList = useMemo(() =>
    Object.entries(catTotals)
      .map(([k,v]) => ({ key:k, name:CATS[k]?.label||k, value:v, color:CATS[k]?.color||T.muted, icon:CATS[k]?.icon||"📦" }))
      .sort((a,b) => b.value - a.value),
  [catTotals]);

  /* daily trend */
  const daily = useMemo(() => {
    const m = {};
    transactions.forEach(t => { m[t.day] = (m[t.day]||0) + t.amount; });
    let cum = 0;
    return Array.from({length:30},(_,i)=>{
      const d = i+1;
      cum += m[d]||0;
      return { d, label: (d===1||d%5===0) ? `${d}` : "", daily:m[d]||0, cumulative:cum };
    });
  }, [transactions]);

  /* budget data */
  const budgetRows = useMemo(() =>
    Object.entries(CATS).map(([key,meta]) => ({
      key, name:meta.label, color:meta.color, icon:meta.icon,
      budget:meta.budget, spent:catTotals[key]||0,
      pct: Math.round(((catTotals[key]||0) / meta.budget) * 100),
    })).sort((a,b)=>b.pct-a.pct),
  [catTotals]);

  const tips    = useMemo(() => genTips(catTotals, totalExp, income), [catTotals, totalExp, income]);
  const topCat  = catList[0];
  const recent  = useMemo(() => [...transactions].sort((a,b)=>b.day-a.day).slice(0, showAllTxns ? 20 : 8), [transactions, showAllTxns]);

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'DM Sans','Inter','Segoe UI',sans-serif", padding:"24px 28px 64px", color:T.navy }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .rh:hover{background:${T.bg}!important}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${T.greenMid};border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .au{animation:fadeUp .38s cubic-bezier(.4,0,.2,1) both}
        .goal-item{transition:all .15s}
        .goal-item:hover{border-color:var(--gc)!important}
      `}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <div className="au" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22, animationDelay:"0ms" }}>
        <div>
          <p style={{ fontSize:10.5, fontWeight:600, color:T.green, letterSpacing:1.8, textTransform:"uppercase", marginBottom:5 }}>
            October 2024 · Monthly Report
          </p>
          <h1 style={{ fontSize:22, fontWeight:700, color:T.navy, letterSpacing:-0.4, fontFamily:"'DM Serif Display',serif" }}>
            Financial Overview
          </h1>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:"8px 13px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:T.green, boxShadow:`0 0 0 2.5px ${T.greenLight}`, flexShrink:0 }} />
            <span style={{ fontSize:11.5, fontWeight:600, color:T.slate }}>Income: <strong style={{ color:T.navy }}>₹{income.toLocaleString("en-IN")}</strong></span>
          </div>
          <button style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 15px", borderRadius:9, background:`linear-gradient(135deg,${T.green},${T.greenDark})`, color:"#fff", border:"none", fontSize:11.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            ↓ Export
          </button>
        </div>
      </div>

      {/* ═══ KPI CARDS ════════════════════════════════════════════ */}
      <div className="au" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16, animationDelay:"50ms" }}>
        {[
          { label:"Total Expenses",  value:`₹${totalExp.toLocaleString("en-IN")}`,           sub:`${transactions.length} transactions`,      icon:"💳", accent:T.red,    accentBg:T.redLight,    badge:"this month" },
          { label:"Net Savings",     value:`₹${Math.max(0,savings).toLocaleString("en-IN")}`, sub:`After all outflows`,                       icon:"💰", accent:T.green,  accentBg:T.greenLight,  badge:`${savRate}% saved` },
          { label:"Savings Rate",    value:`${savRate}%`,                                       sub:`Target 30% · Avg 18%`,                     icon:"📊", accent:savRate>=30?T.green:T.amber, accentBg:savRate>=30?T.greenLight:T.amberLight, badge:savRate>=30?"On Track":"Below Target" },
          { label:"Top Category",    value:topCat?`₹${topCat.value.toLocaleString("en-IN")}`:"—", sub:topCat?.name||"—",                       icon:topCat?.icon||"📦", accent:T.purple, accentBg:T.purpleLight, badge:"highest spend" },
        ].map((c,i) => (
          <Card key={i} style={{ padding:"18px 19px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:13 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:c.accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{c.icon}</div>
              <Chip label={c.badge} color={c.accent} bg={c.accentBg} />
            </div>
            <p style={{ fontSize:10.5, color:T.muted, fontWeight:500, marginBottom:3 }}>{c.label}</p>
            <p style={{ fontSize:20, fontWeight:700, color:T.navy, letterSpacing:-0.4, marginBottom:2 }}>{c.value}</p>
            <p style={{ fontSize:10.5, color:T.muted }}>{c.sub}</p>
          </Card>
        ))}
      </div>

      {/* ═══ ROW: AREA CHART + PIE ════════════════════════════════ */}
      <div className="au" style={{ display:"grid", gridTemplateColumns:"1.65fr 1fr", gap:12, marginBottom:12, animationDelay:"90ms" }}>

        {/* Daily trend */}
        <Card style={{ padding:"20px 20px 14px" }}>
          <SecHead title="Daily Spending Trend" sub="Cumulative & daily outflows — October 2024" />
          <ResponsiveContainer width="100%" height={195}>
            <AreaChart data={daily} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.green} stopOpacity={0.17}/>
                  <stop offset="100%" stopColor={T.green} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.blue} stopOpacity={0.12}/>
                  <stop offset="100%" stopColor={T.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderSoft} vertical={false}/>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill:T.muted, fontSize:10 }} interval={0}/>
              <YAxis tickLine={false} axisLine={false} tick={{ fill:T.muted, fontSize:10 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<RTooltip/>}/>
              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke={T.green} strokeWidth={2} fill="url(#gc)" dot={false}/>
              <Area type="monotone" dataKey="daily" name="Daily" stroke={T.blue} strokeWidth={1.5} fill="url(#gd)" dot={false} strokeDasharray="4 3"/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:16, marginTop:8 }}>
            {[{c:T.green,l:"Cumulative"},{c:T.blue,l:"Daily"}].map(x=>(
              <div key={x.l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:10.5, color:T.muted }}>
                <span style={{ width:16, height:2, background:x.c, borderRadius:2, display:"inline-block" }}/>
                {x.l}
              </div>
            ))}
          </div>
        </Card>

        {/* Donut */}
        <Card style={{ padding:"20px" }}>
          <SecHead title="Spend Distribution" sub="By category" />
          <div style={{ height:160, width:"100%" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catList} cx="50%" cy="50%" innerRadius={46} outerRadius={74} paddingAngle={2} dataKey="value" labelLine={false}>
                  {catList.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={({active,payload})=>{
                  if(!active||!payload?.[0]) return null;
                  const d=payload[0].payload;
                  return <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:"8px 12px", fontSize:11.5, boxShadow:"0 4px 14px rgba(0,0,0,0.07)" }}>
                    <p style={{ fontWeight:700, color:T.navy, marginBottom:2 }}>{d.name}</p>
                    <p style={{ color:d.color }}>₹{d.value.toLocaleString("en-IN")}</p>
                    <p style={{ color:T.muted, fontSize:10.5 }}>{Math.round((d.value/totalExp)*100)}% of total</p>
                  </div>;
                }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px 10px", marginTop:6 }}>
            {catList.map(c=>(
              <div key={c.key} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:c.color, flexShrink:0 }}/>
                <span style={{ fontSize:10, color:T.slate, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ═══ ROW: BUDGET + INCOME-vs-EXPENSE ═════════════════════ */}
      <div className="au" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12, animationDelay:"125ms" }}>

        {/* Budget utilisation */}
        <Card style={{ padding:"20px" }}>
          <SecHead title="Budget Utilisation" sub="Monthly limits per category" />
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            {budgetRows.map(b=>(
              <div key={b.key}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:13 }}>{b.icon}</span>
                    <span style={{ fontSize:11.5, fontWeight:600, color:T.navy }}>{b.name}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:10.5, color:T.muted }}>₹{b.spent.toLocaleString("en-IN")} / ₹{b.budget.toLocaleString("en-IN")}</span>
                    <Chip
                      label={`${b.pct}%`}
                      color={b.pct>100?T.amber:b.pct>80?T.red:T.green}
                      bg={b.pct>100?T.amberLight:b.pct>80?T.redLight:T.greenLight}
                    />
                  </div>
                </div>
                <PBar value={b.pct} color={b.pct>100?T.amber:b.pct>80?T.red:b.color} h={4}/>
              </div>
            ))}
          </div>
        </Card>

        {/* Income vs Expense */}
        <Card style={{ padding:"20px" }}>
          <SecHead title="Income vs Expenses" sub="Monthly financial health" />
          <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
            {[
              { label:"Monthly Income",  val:income,                   color:T.green,  icon:"💵" },
              { label:"Total Expenses",  val:totalExp,                 color:T.red,    icon:"💸" },
              { label:"Net Savings",     val:Math.max(0,savings),      color:T.blue,   icon:"💰" },
            ].map(row=>(
              <div key={row.label}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontSize:14 }}>{row.icon}</span>
                    <span style={{ fontSize:11.5, fontWeight:600, color:T.slate }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:T.navy }}>₹{row.val.toLocaleString("en-IN")}</span>
                </div>
                <PBar value={Math.round((row.val/income)*100)} color={row.color} h={6}/>
                <div style={{ textAlign:"right", marginTop:2 }}>
                  <span style={{ fontSize:10, color:T.muted }}>{Math.round((row.val/income)*100)}% of income</span>
                </div>
              </div>
            ))}
            {/* savings rate badge */}
            <div style={{
              background:savRate>=20?T.greenLight:T.amberLight,
              border:`1px solid ${savRate>=20?T.greenMid:"#F9D29A"}`,
              borderRadius:10, padding:"12px 15px",
              display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2,
            }}>
              <div>
                <p style={{ fontSize:10, color:T.muted, marginBottom:2, fontWeight:500 }}>Savings Rate</p>
                <p style={{ fontSize:19, fontWeight:700, color:T.navy }}>{savRate}%</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:10, color:T.muted, marginBottom:4 }}>Target: 30%</p>
                <Chip
                  label={savRate>=30?"✓ On Track":`${30-savRate}% to target`}
                  color={savRate>=30?T.green:T.amber}
                  bg={savRate>=30?T.greenLight:T.amberLight}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ═══ ROW: GOALS + TIPS ════════════════════════════════════ */}
      <div className="au" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12, animationDelay:"160ms" }}>

        {/* Savings Goals */}
        <Card style={{ padding:"20px" }}>
          <SecHead
            title="Savings Goals"
            sub="Track your financial milestones"
            right={
              <button style={{ padding:"5px 11px", borderRadius:7, background:T.greenLight, border:`1px solid ${T.greenMid}`, color:T.green, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                + New Goal
              </button>
            }
          />
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {GOALS.map(g=>{
              const pct = Math.round((g.saved/g.target)*100);
              const rem = g.target - g.saved;
              const open = expandGoal === g.id;
              return (
                <div
                  key={g.id}
                  className="goal-item"
                  style={{ "--gc":g.color, padding:"13px 14px", borderRadius:10, border:`1.5px solid ${open?g.color+"55":T.border}`, background:open?g.color+"06":"transparent", cursor:"pointer" }}
                  onClick={()=>setExpandGoal(open?null:g.id)}
                >
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:g.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{g.icon}</div>
                      <div>
                        <p style={{ fontSize:12.5, fontWeight:700, color:T.navy, marginBottom:1 }}>{g.label}</p>
                        <p style={{ fontSize:10, color:T.muted }}>{g.desc}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:g.color, marginBottom:1 }}>{pct}%</p>
                      <p style={{ fontSize:9.5, color:T.muted }}>₹{rem.toLocaleString("en-IN")} left</p>
                    </div>
                  </div>
                  <PBar value={pct} color={g.color} h={4}/>
                  {open && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:10 }}>
                      {[
                        { l:"Saved",     v:`₹${g.saved.toLocaleString("en-IN")}` },
                        { l:"Target",    v:`₹${g.target.toLocaleString("en-IN")}` },
                        { l:"Progress",  v:`${pct}% complete` },
                        { l:"Remaining", v:`₹${rem.toLocaleString("en-IN")}` },
                      ].map(s=>(
                        <div key={s.l} style={{ background:T.bg, borderRadius:8, padding:"8px 10px", border:`1px solid ${T.borderSoft}` }}>
                          <p style={{ fontSize:9.5, color:T.muted, marginBottom:2 }}>{s.l}</p>
                          <p style={{ fontSize:12.5, fontWeight:700, color:T.navy }}>{s.v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Smart Insights */}
        <Card style={{ padding:"20px" }}>
          <SecHead title="Smart Insights" sub="Auto-generated from your October transactions" />
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {tips.map((tip,i)=>{
              const s = {
                warning:  { border:"#F9D29A", bg:T.amberLight, dot:T.amber  },
                alert:    { border:"#FBBBBD", bg:T.redLight,   dot:T.red    },
                positive: { border:T.greenMid,bg:T.greenLight, dot:T.green  },
                info:     { border:"#BAD5F9", bg:T.blueLight,  dot:T.blue   },
              }[tip.type] || { border:T.border, bg:T.bg, dot:T.muted };
              return (
                <div key={i} style={{ border:`1px solid ${s.border}`, background:s.bg, borderRadius:10, padding:"12px 13px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:9 }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:s.dot+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, color:s.dot, fontWeight:700 }}>
                      {tip.icon}
                    </div>
                    <div>
                      <p style={{ fontSize:12, fontWeight:700, color:T.navy, marginBottom:3 }}>{tip.title}</p>
                      <p style={{ fontSize:11, color:T.slate, lineHeight:1.55 }}>{tip.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Monthly summary chip */}
            <div style={{ background:T.navyMid, borderRadius:10, padding:"14px 15px", marginTop:2 }}>
              <p style={{ fontSize:9.5, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 }}>
                Month at a Glance
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                {[
                  { l:"Biggest expense",  v:`${CATS[topCat?.key]?.icon||""} ${topCat?.name||"—"}` },
                  { l:"Under budget",     v:`${budgetRows.filter(b=>b.pct<=100).length}/${budgetRows.length} categories` },
                  { l:"Savings target",   v:savRate>=30?"✓ Met":"✗ Not met" },
                  { l:"Total categories", v:`${catList.length} active` },
                ].map(s=>(
                  <div key={s.l}>
                    <p style={{ fontSize:9.5, color:"rgba(255,255,255,0.35)", marginBottom:2 }}>{s.l}</p>
                    <p style={{ fontSize:11.5, fontWeight:700, color:"rgba(255,255,255,0.88)" }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ═══ BAR CHART ════════════════════════════════════════════ */}
      <div className="au" style={{ marginBottom:12, animationDelay:"190ms" }}>
        <Card style={{ padding:"20px 20px 14px" }}>
          <SecHead title="Category-wise Spending" sub="Total spend per category — October 2024" />
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={catList} margin={{ top:4, right:40, left:0, bottom:0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderSoft} vertical={false}/>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill:T.muted, fontSize:10 }}/>
              <YAxis tickLine={false} axisLine={false} tick={{ fill:T.muted, fontSize:10 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<RTooltip/>} cursor={{ fill:T.bg }}/>
              <Bar dataKey="value" name="Spent" radius={[4,4,0,0]}>
                {catList.map((e,i)=><Cell key={i} fill={e.color}/>)}
                <LabelList dataKey="value" position="top" formatter={v=>`₹${(v/1000).toFixed(1)}k`} style={{ fill:T.slate, fontSize:9.5, fontWeight:700 }}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ═══ TRANSACTIONS TABLE ═══════════════════════════════════ */}
      <div className="au" style={{ animationDelay:"220ms" }}>
        <Card>
          {/* header */}
          <div style={{ padding:"17px 20px 13px", borderBottom:`1px solid ${T.borderSoft}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:13.5, fontWeight:700, color:T.navy, marginBottom:1 }}>Recent Transactions</p>
              <p style={{ fontSize:11, color:T.muted }}>Showing {recent.length} of {transactions.length} · OCR-categorised</p>
            </div>
            <button
              onClick={()=>setShowAllTxns(v=>!v)}
              style={{ padding:"6px 13px", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.green, fontSize:11.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
            >{showAllTxns?"Show Less":"View All →"}</button>
          </div>

          {/* col headers */}
          <div style={{ display:"grid", gridTemplateColumns:"68px 1fr 145px 78px 88px", padding:"9px 20px", background:T.bg, borderBottom:`1px solid ${T.borderSoft}` }}>
            {["Date","Description","Category","Type","Amount"].map(h=>(
              <span key={h} style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:0.7, textTransform:"uppercase" }}>{h}</span>
            ))}
          </div>

          {/* rows */}
          {recent.map((txn,i)=>{
            const meta = txn.meta || CATS[txn.cat] || {};
            const txType = {
              emi:"Bank", investment:"UPI", utilities:"Bank", education:"Bank",
              entertainment:"Card", travel:"Card", food:"UPI", shopping:"Card", healthcare:"UPI",
            }[txn.cat] || "UPI";
            const typeStyle = {
              UPI:  { color:T.green,  bg:T.greenLight  },
              Card: { color:T.purple, bg:T.purpleLight  },
              Bank: { color:T.blue,   bg:T.blueLight    },
            }[txType];
            return (
              <div
                key={txn.id}
                className="rh"
                style={{ display:"grid", gridTemplateColumns:"68px 1fr 145px 78px 88px", padding:"11px 20px", alignItems:"center", borderBottom:i<recent.length-1?`1px solid ${T.borderSoft}`:"none", background:T.card, transition:"background .12s" }}
              >
                <span style={{ fontSize:11, fontWeight:500, color:T.muted }}>{txn.date}</span>

                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:(meta.color||T.muted)+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>
                    {meta.icon||"💳"}
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:T.navy, marginBottom:1, lineHeight:1.3 }}>{txn.desc}</p>
                    <p style={{ fontSize:10, color:T.faint }}>{txn.txnId}</p>
                  </div>
                </div>

                <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:(meta.color||T.muted)+"14", color:meta.color||T.muted, border:`1px solid ${(meta.color||T.muted)+"30"}`, fontSize:10.5, fontWeight:700, padding:"3px 8px", borderRadius:5 }}>
                  {meta.icon} {meta.label||txn.cat}
                </span>

                <Chip label={txType} color={typeStyle.color} bg={typeStyle.bg}/>

                <span style={{ fontSize:12.5, fontWeight:700, color:T.navy, textAlign:"right" }}>
                  −₹{txn.amount.toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </Card>
      </div>

      {/* footer */}
      <p style={{ textAlign:"center", fontSize:10.5, color:T.faint, marginTop:28, letterSpacing:0.3 }}>
        FinSight · October 2024 · {transactions.length} transactions auto-categorised via OCR · All amounts in INR ₹
      </p>
    </div>
  );
}

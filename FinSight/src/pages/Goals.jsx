/**
 * FinSight — Goals Section
 * Three tiers: Short-term · Mid-term · Long-term
 * Features: Add Goal modal, Add Money inline, live progress, status badges
 */
import { useState, useMemo } from "react";
import AppNavbar from "../components/AppNavbar";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — Finsight brand palette
───────────────────────────────────────────────────────────────*/
const G = {
  primary:      "#2563EB",
  primaryDk:    "#1D4ED8",
  primaryLt:    "#EBF0FE",
  primaryMd:    "#BFDBFE",
  navy:         "#0E1E2E",
  navyMid:      "#1C3043",
  slate:        "#475569",
  muted:        "#8898AA",
  faint:        "#CBD5E1",
  bg:           "#E9EEF6",
  card:         "#FFFFFF",
  border:       "#E2E8F0",
  borderSoft:   "#F1F5F9",
  red:          "#E8404A",
  redLt:        "#FDF0F1",
  amber:        "#E8900A",
  amberLt:      "#FEF7EC",
  amberMd:      "#F9D29A",
  blue:         "#2E74D9",
  blueLt:       "#EEF5FD",
  shadow:       "0 1px 8px rgba(11,27,53,0.06)",
  shadowMd:     "0 4px 24px rgba(11,27,53,0.10)",
  greenMid:     "#93C5FD",
};

/* ─────────────────────────────────────────────────────────────
   INITIAL GOAL DATA
───────────────────────────────────────────────────────────────*/
let _uid = 100;
const uid = () => ++_uid;

const INITIAL_GOALS = {
  short: [
    { id:uid(), name:"Trip to Goa",      type:"Personal",   months:3,  target:25000,  saved:14500,  icon:"🏖" },
    { id:uid(), name:"New Phone",        type:"Personal",   months:5,  target:40000,  saved:22000,  icon:"📱" },
    { id:uid(), name:"Gift for Parents", type:"Personal",   months:2,  target:8000,   saved:5500,   icon:"🎁" },
    { id:uid(), name:"Birthday Party",   type:"Personal",   months:1,  target:12000,  saved:3200,   icon:"🎉" },
  ],
  mid: [
    { id:uid(), name:"New Laptop",          type:"Personal",   months:14, target:80000,  saved:45000,  icon:"💻" },
    { id:uid(), name:"Buy a Bike",           type:"Personal",   months:18, target:120000, saved:38000,  icon:"🏍" },
    { id:uid(), name:"Professional Courses", type:"Investment", months:10, target:30000,  saved:18000,  icon:"📚" },
    { id:uid(), name:"Bike Down Payment",    type:"Investment", months:12, target:50000,  saved:21000,  icon:"💰" },
  ],
  long: [
    { id:uid(), name:"Higher Education", type:"Investment", months:36, target:500000, saved:120000, icon:"🎓" },
    { id:uid(), name:"Wedding Fund",     type:"Personal",   months:48, target:800000, saved:95000,  icon:"💍" },
    { id:uid(), name:"Emergency Fund",   type:"Investment", months:24, target:200000, saved:62000,  icon:"🛡" },
    { id:uid(), name:"Buying a Home",    type:"Investment", months:72, target:2500000,saved:280000, icon:"🏠" },
  ],
};

const SECTION_META = {
  short: {
    key:    "short",
    label:  "Short-term Goals",
    sub:    "Within the next 6 months",
    accent: G.primary,
    accentLt: G.primaryLt,
    accentMd: G.primaryMd,
    badge:  { bg: G.primaryLt, color: G.primary, border: G.primaryMd },
  },
  mid: {
    key:    "mid",
    label:  "Mid-term Goals",
    sub:    "6 months to 2 years",
    accent: G.blue,
    accentLt: G.blueLt,
    accentMd: "#BAD5F9",
    badge:  { bg: G.blueLt, color: G.blue, border: "#BAD5F9" },
  },
  long: {
    key:    "long",
    label:  "Long-term Goals",
    sub:    "2 years and beyond",
    accent: G.amber,
    accentLt: G.amberLt,
    accentMd: G.amberMd,
    badge:  { bg: G.amberLt, color: G.amber, border: G.amberMd },
  },
};

/* ─────────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────────────*/
const pct  = (s, t) => t > 0 ? Math.min(100, Math.round((s / t) * 100)) : 0;
const fmt  = (n)    => "₹" + Number(n).toLocaleString("en-IN");
const fmtM = (m)    => m < 12 ? `${m}mo` : m % 12 === 0 ? `${m/12}yr` : `${Math.floor(m/12)}yr ${m%12}mo`;

function goalStatus(g) {
  const p = pct(g.saved, g.target);
  const monthlyNeeded = (g.target - g.saved) / Math.max(g.months, 1);
  if (p >= 100) return { label: "Completed!", color: G.primary, bg: G.primaryLt };
  if (p >= 70)  return { label: "On Track",   color: G.primary, bg: G.primaryLt };
  if (p >= 40)  return { label: "Progressing",color: G.blue,    bg: G.blueLt    };
  return           { label: "Needs Attention", color: G.amber,  bg: G.amberLt   };
}

function motiveCopy(p) {
  if (p >= 100) return "🎉 Goal achieved!";
  if (p >= 80)  return `Almost there — just ${100-p}% to go!`;
  if (p >= 60)  return `You're ${p}% there. Keep going!`;
  if (p >= 40)  return `Solid progress — ${p}% complete.`;
  if (p >= 20)  return `${p}% saved. Every rupee counts!`;
  return `${p}% saved. Great things take time.`;
}

const GOAL_ICONS = ["🏖","📱","🎁","🎉","💻","🏍","📚","💰","🎓","💍","🛡","🏠","✈","🚗","📷","🎸","🎮","🏋","🌏","🍕"];

/* ─────────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────────────*/
function ProgressBar({ value, color, height = 6 }) {
  return (
    <div style={{ background: G.borderSoft, borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width:  `${value}%`,
        background: value >= 100 ? G.primary : color,
        borderRadius: 99,
        transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

function Pill({ label, color, bg, border }) {
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
      color, background: bg,
      border: `1px solid ${border || bg}`,
      padding: "2px 8px", borderRadius: 5,
      display: "inline-block",
    }}>{label}</span>
  );
}

function Btn({ children, onClick, variant = "primary", style: sx = {}, disabled = false }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
    padding: "8px 15px", borderRadius: 9, fontSize: 12, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    fontFamily: "inherit", transition: "opacity 0.15s, box-shadow 0.15s",
    opacity: disabled ? 0.5 : 1,
    ...sx,
  };
  const variants = {
    primary:  { background: `linear-gradient(135deg,${G.primary},${G.primaryDk})`, color: "#fff", boxShadow: "0 2px 8px rgba(34,169,106,0.25)" },
    ghost:    { background: "transparent", color: G.slate, border: `1px solid ${G.border}` },
    soft:     { background: G.primaryLt,   color: G.primary, border: `1px solid ${G.primaryMd}` },
    danger:   { background: G.redLt,       color: G.red,    border: `1px solid #FBBBBD` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADD GOAL MODAL
───────────────────────────────────────────────────────────────*/
function AddGoalModal({ sectionKey, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "", type: "Personal", spanValue: "", spanUnit: "months",
    target: "", saved: "", icon: "🎯",
  });
  const [errors, setErrors] = useState({});
  const [iconOpen, setIconOpen] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name   = "Goal name is required";
    if (!form.target || isNaN(+form.target) || +form.target <= 0) e.target = "Enter a valid target amount";
    if (!form.spanValue || isNaN(+form.spanValue) || +form.spanValue <= 0) e.span  = "Enter a valid time span";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const months = form.spanUnit === "years" ? +form.spanValue * 12 : +form.spanValue;
    onSave({
      id:     uid(),
      name:   form.name.trim(),
      type:   form.type,
      months,
      target: +form.target,
      saved:  +form.saved || 0,
      icon:   form.icon,
    });
  };

  const inputStyle = (err) => ({
    width: "100%", padding: "10px 13px", borderRadius: 9, fontSize: 13,
    border: `1.5px solid ${err ? G.red : G.border}`,
    outline: "none", fontFamily: "inherit", color: G.navy,
    background: G.card, transition: "border-color 0.15s",
  });

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(14,30,46,0.45)", backdropFilter:"blur(5px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-pop" style={{ background:G.card, borderRadius:18, width:"100%", maxWidth:480, boxShadow:G.shadowMd, overflow:"hidden" }}>
        {/* Modal header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${G.borderSoft}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:16, fontWeight:700, color:G.navy, margin:0 }}>Add New Goal</p>
            <p style={{ fontSize:11, color:G.muted, margin:"2px 0 0" }}>{SECTION_META[sectionKey].label}</p>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${G.border}`, background:"transparent", fontSize:14, cursor:"pointer", color:G.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Icon picker */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.slate, display:"block", marginBottom:6 }}>Goal Icon</label>
            <div style={{ position:"relative" }}>
              <button
                onClick={() => setIconOpen(o => !o)}
                style={{ width:"100%", padding:"9px 13px", borderRadius:9, border:`1.5px solid ${G.border}`, background:G.card, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, fontSize:13, color:G.navy }}
              >
                <span style={{ fontSize:20 }}>{form.icon}</span>
                <span>Choose icon</span>
                <span style={{ marginLeft:"auto", color:G.muted, fontSize:11 }}>▾</span>
              </button>
              {iconOpen && (
                <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:G.card, border:`1px solid ${G.border}`, borderRadius:10, padding:10, display:"flex", flexWrap:"wrap", gap:6, zIndex:10, boxShadow:G.shadowMd }}>
                  {GOAL_ICONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => { set("icon", ic); setIconOpen(false); }}
                      style={{ width:36, height:36, borderRadius:8, border:`1.5px solid ${form.icon===ic?G.primary:G.border}`, background:form.icon===ic?G.primaryLt:"transparent", fontSize:18, cursor:"pointer" }}
                    >{ic}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Goal name */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.slate, display:"block", marginBottom:6 }}>Goal Name *</label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="e.g. New Laptop"
              style={inputStyle(errors.name)}
              onFocus={e => { e.target.style.borderColor = G.primary; }}
              onBlur={e  => { e.target.style.borderColor = errors.name ? G.red : G.border; }}
            />
            {errors.name && <p style={{ fontSize:10.5, color:G.red, marginTop:3 }}>{errors.name}</p>}
          </div>

          {/* Type */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.slate, display:"block", marginBottom:6 }}>Goal Type *</label>
            <div style={{ display:"flex", gap:8 }}>
              {["Personal","Investment"].map(t => (
                <button
                  key={t}
                  onClick={() => set("type", t)}
                  style={{
                    flex:1, padding:"9px 0", borderRadius:9, fontSize:12.5, fontWeight:700,
                    border:`1.5px solid ${form.type===t?G.primary:G.border}`,
                    background:form.type===t?G.primaryLt:G.card,
                    color:form.type===t?G.primary:G.slate,
                    cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Time Span */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.slate, display:"block", marginBottom:6 }}>Time Span *</label>
            <div style={{ display:"flex", gap:8 }}>
              <input
                type="number" min="1"
                value={form.spanValue}
                onChange={e => set("spanValue", e.target.value)}
                placeholder="e.g. 12"
                style={{ ...inputStyle(errors.span), flex:1 }}
                onFocus={e => { e.target.style.borderColor = G.primary; }}
                onBlur={e  => { e.target.style.borderColor = errors.span ? G.red : G.border; }}
              />
              <select
                value={form.spanUnit}
                onChange={e => set("spanUnit", e.target.value)}
                style={{ ...inputStyle(false), width:110, flex:"none" }}
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            {errors.span && <p style={{ fontSize:10.5, color:G.red, marginTop:3 }}>{errors.span}</p>}
          </div>

          {/* Target + Saved */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:G.slate, display:"block", marginBottom:6 }}>Target Amount (₹) *</label>
              <input
                type="number" min="1"
                value={form.target}
                onChange={e => set("target", e.target.value)}
                placeholder="100000"
                style={inputStyle(errors.target)}
                onFocus={e => { e.target.style.borderColor = G.primary; }}
                onBlur={e  => { e.target.style.borderColor = errors.target ? G.red : G.border; }}
              />
              {errors.target && <p style={{ fontSize:10.5, color:G.red, marginTop:3 }}>{errors.target}</p>}
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:G.slate, display:"block", marginBottom:6 }}>Initial Saved (₹)</label>
              <input
                type="number" min="0"
                value={form.saved}
                onChange={e => set("saved", e.target.value)}
                placeholder="0"
                style={inputStyle(false)}
                onFocus={e => { e.target.style.borderColor = G.primary; }}
                onBlur={e  => { e.target.style.borderColor = G.border; }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <Btn variant="ghost" onClick={onClose} style={{ flex:1 }}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave} style={{ flex:2 }}>
              ✦ Add Goal
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GOAL CARD
───────────────────────────────────────────────────────────────*/
function GoalCard({ goal, accentColor, onUpdate, onDelete }) {
  const [addOpen,  setAddOpen]  = useState(false);
  const [addValue, setAddValue] = useState("");
  const [addError, setAddError] = useState("");
  const [editing,  setEditing]  = useState(false);
  const [editTarget, setEditTarget] = useState(goal.target);

  const progress = pct(goal.saved, goal.target);
  const status   = goalStatus(goal);
  const motive   = motiveCopy(progress);
  const remaining = Math.max(0, goal.target - goal.saved);

  const handleAdd = () => {
    const v = parseFloat(addValue);
    if (!addValue || isNaN(v) || v <= 0) {
      setAddError("Enter a valid amount");
      return;
    }
    onUpdate({ ...goal, saved: Math.min(goal.target, goal.saved + v) });
    setAddValue("");
    setAddError("");
    setAddOpen(false);
  };

  const handleEditTarget = () => {
    const v = parseFloat(editTarget);
    if (!isNaN(v) && v > 0) {
      onUpdate({ ...goal, target: v, saved: Math.min(goal.saved, v) });
    }
    setEditing(false);
  };

  return (
    <div
      className="goal-card"
      style={{
        background: G.card,
        border: `1px solid ${G.border}`,
        borderRadius: 14,
        padding: "18px 19px",
        boxShadow: G.shadow,
        transition: "box-shadow 0.2s, border-color 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
      }}
    >
      {/* top row */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{
          width:42, height:42, borderRadius:11,
          background: `${accentColor}14`,
          border: `1px solid ${accentColor}30`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:20, flexShrink:0,
        }}>{goal.icon}</div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:3 }}>
            <p style={{ fontSize:14, fontWeight:700, color:G.navy, margin:0, lineHeight:1.3 }}>{goal.name}</p>
            <Pill label={goal.type} color={G.muted} bg={G.bg} border={G.border}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Pill label={status.label} color={status.color} bg={status.bg} border={`${status.color}30`}/>
            <span style={{ fontSize:10.5, color:G.muted }}>· {fmtM(goal.months)} span</span>
          </div>
        </div>

        <button
          onClick={onDelete}
          style={{ width:26, height:26, borderRadius:7, border:`1px solid ${G.border}`, background:"transparent", cursor:"pointer", fontSize:11, color:G.muted, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}
          title="Remove goal"
        >✕</button>
      </div>

      {/* amounts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[
          { label:"Target",    value: editing ? null : fmt(goal.target), editable:true },
          { label:"Saved",     value: fmt(goal.saved),    editable:false },
          { label:"Remaining", value: fmt(remaining),     editable:false },
        ].map((item, i) => (
          <div key={i} style={{ background:G.bg, borderRadius:9, padding:"9px 10px", border:`1px solid ${G.borderSoft}` }}>
            <p style={{ fontSize:10, color:G.muted, fontWeight:500, marginBottom:3 }}>{item.label}</p>
            {item.editable && editing ? (
              <div style={{ display:"flex", gap:4 }}>
                <input
                  autoFocus
                  type="number"
                  value={editTarget}
                  onChange={e => setEditTarget(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter") handleEditTarget(); if(e.key==="Escape") setEditing(false); }}
                  style={{ width:"100%", fontSize:11, fontWeight:700, color:G.navy, background:"transparent", border:"none", outline:"none", fontFamily:"inherit" }}
                />
                <button onClick={handleEditTarget} style={{ fontSize:10, color:G.primary, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>✓</button>
              </div>
            ) : (
              <p
                style={{ fontSize:12.5, fontWeight:700, color:G.navy, margin:0, cursor: item.editable ? "text" : "default" }}
                onClick={() => item.editable && setEditing(true)}
                title={item.editable ? "Click to edit" : undefined}
              >
                {item.value}
                {item.editable && !editing && <span style={{ fontSize:9, color:G.faint, marginLeft:4 }}>✏</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* progress */}
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <p style={{ fontSize:11, color:G.muted, margin:0 }}>{motive}</p>
          <span style={{ fontSize:13, fontWeight:800, color: progress>=100?G.primary:accentColor }}>{progress}%</span>
        </div>
        <ProgressBar value={progress} color={accentColor} height={7}/>
      </div>

      {/* add money */}
      <div>
        {!addOpen ? (
          <Btn
            variant="soft"
            onClick={() => setAddOpen(true)}
            style={{ width:"100%", fontSize:12 }}
          >
            + Add Money
          </Btn>
        ) : (
          <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:6 }}>
                <div style={{ position:"relative", flex:1 }}>
                  <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:12, color:G.muted, fontWeight:600 }}>₹</span>
                  <input
                    autoFocus
                    type="number" min="1"
                    value={addValue}
                    onChange={e => { setAddValue(e.target.value); setAddError(""); }}
                    onKeyDown={e => { if(e.key==="Enter") handleAdd(); if(e.key==="Escape") { setAddOpen(false); setAddValue(""); setAddError(""); } }}
                    placeholder="Amount"
                    style={{
                      width:"100%", padding:"9px 10px 9px 26px",
                      border:`1.5px solid ${addError?G.red:G.border}`, borderRadius:9,
                      fontSize:13, color:G.navy, outline:"none", fontFamily:"inherit",
                    }}
                  />
                </div>
                <Btn variant="primary" onClick={handleAdd} style={{ padding:"9px 14px", fontSize:12 }}>Add</Btn>
                <Btn variant="ghost" onClick={() => { setAddOpen(false); setAddValue(""); setAddError(""); }} style={{ padding:"9px 12px", fontSize:12 }}>✕</Btn>
              </div>
              {addError && <p style={{ fontSize:10.5, color:G.red, marginTop:3 }}>{addError}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER + STATS BAR
───────────────────────────────────────────────────────────────*/
function SectionHeader({ meta, goals, onAddClick }) {
  const totalTarget = goals.reduce((s,g) => s+g.target, 0);
  const totalSaved  = goals.reduce((s,g) => s+g.saved, 0);
  const overall     = pct(totalSaved, totalTarget);

  return (
    <div style={{ marginBottom:18 }}>
      {/* label row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:4, height:24, borderRadius:2, background:meta.accent }}/>
          <div>
            <h2 style={{ fontSize:16, fontWeight:700, color:G.navy, margin:0, letterSpacing:-0.2 }}>{meta.label}</h2>
            <p style={{ fontSize:11, color:G.muted, margin:0 }}>{meta.sub}</p>
          </div>
        </div>
        <Btn variant="soft" onClick={onAddClick} style={{ fontSize:11.5, padding:"7px 13px" }}>
          + Add Goal
        </Btn>
      </div>

      {/* mini stats strip */}
      <div style={{
        display:"flex", alignItems:"center", gap:16,
        background:G.bg, border:`1px solid ${G.borderSoft}`,
        borderRadius:10, padding:"10px 14px",
      }}>
        {[
          { label:"Goals",        value: goals.length },
          { label:"Total Target", value: fmt(totalTarget) },
          { label:"Total Saved",  value: fmt(totalSaved) },
          { label:"Overall",      value: `${overall}%` },
        ].map((s,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
            {i>0 && <span style={{ width:1, height:20, background:G.border, flexShrink:0 }}/>}
            <div>
              <p style={{ fontSize:9.5, color:G.muted, fontWeight:500, margin:0, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</p>
              <p style={{ fontSize:13, fontWeight:700, color:G.navy, margin:0 }}>{s.value}</p>
            </div>
          </div>
        ))}
        {/* overall mini bar */}
        <div style={{ flex:1, marginLeft:6 }}>
          <ProgressBar value={overall} color={meta.accent} height={4}/>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN GOALS SECTION COMPONENT
───────────────────────────────────────────────────────────────*/
export default function GoalsSection() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [modal, setModal] = useState(null); // "short" | "mid" | "long" | null

  /* open add-goal modal for a section */
  const openModal  = (key) => setModal(key);
  const closeModal = ()    => setModal(null);

  /* add a new goal to a section */
  const addGoal = (key, goal) => {
    setGoals(prev => ({ ...prev, [key]: [...prev[key], goal] }));
    closeModal();
  };

  /* update a goal in-place */
  const updateGoal = (key, updated) => {
    setGoals(prev => ({
      ...prev,
      [key]: prev[key].map(g => g.id === updated.id ? updated : g),
    }));
  };

  /* delete a goal */
  const deleteGoal = (key, id) => {
    setGoals(prev => ({
      ...prev,
      [key]: prev[key].filter(g => g.id !== id),
    }));
  };

  /* grand totals */
  const allGoals   = useMemo(() => Object.values(goals).flat(), [goals]);
  const grandSaved  = allGoals.reduce((s,g) => s+g.saved,  0);
  const grandTarget = allGoals.reduce((s,g) => s+g.target, 0);
  const grandPct    = pct(grandSaved, grandTarget);

  return (
    <div style={{ minHeight:"100vh", width:"100vw", background:G.bg, fontFamily:"'Manrope','DM Sans','Segoe UI',sans-serif", padding:"24px 24px 72px", color:G.navy }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <AppNavbar />

      {/* ── FONTS + GLOBAL STYLES ─────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        ::placeholder { color: ${G.faint}; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${G.primaryMd}; border-radius:99px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        select { appearance:none; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; }                             to { opacity:1; }                          }
        @keyframes popIn    { from { opacity:0; transform:scale(0.94); }      to { opacity:1; transform:scale(1); }      }
        @keyframes barFill  { from { width:0%; }                              to { width:var(--w); }                     }

        .au { animation: fadeUp 0.4s cubic-bezier(.4,0,.2,1) both; }
        .modal-pop { animation: popIn 0.28s cubic-bezier(.34,1.56,.64,1) both; }
        .goal-card:hover { box-shadow: 0 4px 20px rgba(14,30,46,0.10) !important; border-color: ${G.greenMid} !important; }
        .section-wrap { animation: fadeUp 0.4s cubic-bezier(.4,0,.2,1) both; }
      `}</style>

      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <div className="au" style={{ marginBottom:28, animationDelay:"0ms" }}>
        {/* breadcrumb-style label */}
        <p style={{ fontSize:10.5, fontWeight:600, color:G.primary, letterSpacing:1.8, textTransform:"uppercase", marginBottom:6 }}>
          My Financial Journey
        </p>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:G.navy, letterSpacing:-0.4, fontFamily:"'Manrope','DM Sans','Segoe UI',sans-serif", marginBottom:4 }}>
              Savings Goals
            </h1>
            <p style={{ fontSize:13, color:G.muted }}>
              {allGoals.length} goals · {fmt(grandSaved)} saved of {fmt(grandTarget)} target
            </p>
          </div>

          {/* grand overall pill */}
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            background:G.card, border:`1px solid ${G.border}`,
            borderRadius:12, padding:"10px 16px", boxShadow:G.shadow,
          }}>
            <div>
              <p style={{ fontSize:10, color:G.muted, marginBottom:2, fontWeight:500, letterSpacing:0.5, textTransform:"uppercase" }}>Overall Progress</p>
              <p style={{ fontSize:18, fontWeight:800, color:G.primary }}>{grandPct}%</p>
            </div>
            <div style={{ width:80, display:"flex", flexDirection:"column", gap:4 }}>
              <ProgressBar value={grandPct} color={G.primary} height={6}/>
              <p style={{ fontSize:9.5, color:G.muted, textAlign:"right" }}>across all goals</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTIONS ──────────────────────────────────────────── */}
      {(["short","mid","long"]).map((key, si) => {
        const meta   = SECTION_META[key];
        const sGoals = goals[key];

        return (
          <div
            key={key}
            className="section-wrap"
            style={{ marginBottom:36, animationDelay:`${si * 70 + 60}ms` }}
          >
            <SectionHeader meta={meta} goals={sGoals} onAddClick={() => openModal(key)} />

            {sGoals.length === 0 ? (
              /* Empty state */
              <div style={{
                background:G.card, border:`1.5px dashed ${meta.accentMd}`,
                borderRadius:14, padding:"32px 24px",
                textAlign:"center",
              }}>
                <p style={{ fontSize:28, marginBottom:8 }}>✦</p>
                <p style={{ fontSize:14, fontWeight:600, color:G.slate, marginBottom:4 }}>No goals yet</p>
                <p style={{ fontSize:12, color:G.muted, marginBottom:14 }}>Start by adding your first {meta.label.toLowerCase().replace(" goals","").trim()} goal</p>
                <Btn variant="soft" onClick={() => openModal(key)}>+ Add Your First Goal</Btn>
              </div>
            ) : (
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
                gap:14,
              }}>
                {sGoals.map((goal, gi) => (
                  <div key={goal.id} className="au" style={{ animationDelay:`${si*70 + gi*45 + 100}ms` }}>
                    <GoalCard
                      goal={goal}
                      accentColor={meta.accent}
                      onUpdate={updated => updateGoal(key, updated)}
                      onDelete={() => deleteGoal(key, goal.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* ── FOOTER NOTE ───────────────────────────────────────── */}
      <p style={{ textAlign:"center", fontSize:11, color:G.faint, letterSpacing:0.3, marginTop:16 }}>
        FinSight · Goals are stored locally · No external data is shared
      </p>

      {/* ── ADD GOAL MODAL ────────────────────────────────────── */}
      {modal && (
        <AddGoalModal
          sectionKey={modal}
          onSave={goal => addGoal(modal, goal)}
          onClose={closeModal}
        />
      )}
      </div>
    </div>
  );
}

/**
 * FinancialQuiz.jsx — Redesigned with LearnIQ-inspired aesthetics
 * Self-contained adaptive financial profiling quiz.
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  // Background
  bg:          "#ECF6F2",
  bgCard:      "#FFFFFF",
  bgDeep:      "#0F2233",

  // Primary – FinSight green/teal
  orange:      "#0E9F79",
  orangeLight: "#E9F8F2",
  orangeDark:  "#0B7D61",
  orangeGlow:  "rgba(14,159,121,0.22)",

  // Accent – teal
  teal:        "#0B8A8A",
  tealLight:   "#E2F5F5",
  tealMid:     "#7ECECE",

  // Neutrals
  navy:        "#0D2535",
  slate:       "#3D586A",
  muted:       "#7A93A3",
  faint:       "#C5D7DE",
  border:      "#DDE8EF",
  white:       "#FFFFFF",
  offWhite:    "#F5F9FC",

  // Option card accent colours (like LearnIQ pastel cards)
  mint:        "#E8F8F4",
  mintBorder:  "#9EDDD0",
  peach:       "#EDF9F6",
  peachBorder: "#A7DED1",
  lavender:    "#F0FAF7",
  lavBorder:   "#B6E7DA",
  sky:         "#E8F3FF",
  skyBorder:   "#A9C8F5",
  lemon:       "#F5FCF9",
  lemonBorder: "#C7EBDD",

  green:       "#15803D",
  greenLight:  "#DCFCE7",
};

const CARD_PALETTES = [
  { bg: T.mint,     border: T.mintBorder     },
  { bg: T.peach,    border: T.peachBorder    },
  { bg: T.lavender, border: T.lavBorder      },
  { bg: T.sky,      border: T.skyBorder      },
  { bg: T.lemon,    border: T.lemonBorder    },
];

const CONFIGURED_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const DIRECT_API_BASE_URL = (import.meta.env.VITE_API_TARGET || "http://127.0.0.1:8001").replace(/\/$/, "");
const API_BASE_URLS = Array.from(new Set([CONFIGURED_API_BASE_URL, DIRECT_API_BASE_URL].filter(Boolean)));

const postJson = async (path, payload, fallbackMessage) => {
  for (const baseUrl of API_BASE_URLS) {
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      continue;
    }

    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }
    }

    if (!response.ok) {
      const shouldTryFallback =
        baseUrl.startsWith("/") &&
        API_BASE_URLS.length > 1 &&
        [404, 502, 503].includes(response.status);
      if (shouldTryFallback) continue;
      throw new Error(data?.detail || fallbackMessage);
    }
    return data || {};
  }
  throw new Error(fallbackMessage);
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${T.bg}; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1);    }
  }
  @keyframes checkBounce {
    0%   { transform: scale(0);    opacity: 0; }
    60%  { transform: scale(1.2);  opacity: 1; }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(4deg); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-8px) rotate(-3deg); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 ${T.orangeGlow}; }
    50%       { box-shadow: 0 0 0 10px transparent; }
  }
  @keyframes orb {
    0%, 100% { transform: scale(1) translate(0,0); }
    33%       { transform: scale(1.05) translate(5%,-5%); }
    66%       { transform: scale(0.97) translate(-3%,3%); }
  }

  .quiz-fade   { animation: fadeSlideUp 0.42s cubic-bezier(.4,0,.2,1) both; }
  .quiz-scale  { animation: scaleIn     0.34s cubic-bezier(.34,1.3,.64,1) both; }
  .quiz-fadein { animation: fadeIn      0.3s ease both; }
  .float-a     { animation: floatA 5s ease-in-out infinite; }
  .float-b     { animation: floatB 7s ease-in-out infinite; }

  .option-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 15px 18px;
    border-radius: 14px;
    border: 1.5px solid ${T.border};
    background: ${T.white};
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.18s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .option-card:hover {
    border-color: ${T.orange};
    transform: translateY(-2px) scale(1.005);
    box-shadow: 0 4px 20px ${T.orangeGlow};
  }
  .option-card.selected {
    border-color: ${T.orange};
    box-shadow: 0 4px 20px ${T.orangeGlow};
    transform: translateY(-1px);
  }
  .option-card.selected .opt-check {
    background: ${T.orange};
    border-color: ${T.orange};
    animation: checkBounce 0.3s cubic-bezier(.34,1.56,.64,1) both;
  }
  .option-card.selected .opt-check::after {
    opacity: 1;
  }
  .option-card:focus-visible {
    outline: 2px solid ${T.orange};
    outline-offset: 2px;
  }

  .opt-check {
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 2px solid ${T.faint};
    background: ${T.offWhite};
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    position: relative;
  }
  .opt-check::after {
    content: '';
    width: 9px; height: 9px;
    border-radius: 50%;
    background: white;
    opacity: 0;
    transition: opacity 0.18s;
  }

  .emoji-badge {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
    transition: transform 0.2s;
  }
  .option-card:hover .emoji-badge,
  .option-card.selected .emoji-badge {
    transform: scale(1.12);
  }

  .cta-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 30px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, ${T.orange} 0%, ${T.orangeDark} 100%);
    color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer;
    transition: opacity 0.18s, transform 0.18s, box-shadow 0.18s;
    box-shadow: 0 4px 16px ${T.orangeGlow};
    letter-spacing: 0.01em;
  }
  .cta-btn:hover:not(:disabled) {
    opacity: 0.93;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${T.orangeGlow};
  }
  .cta-btn:active:not(:disabled) { transform: translateY(0); }
  .cta-btn:disabled {
    background: ${T.faint}; color: ${T.muted};
    cursor: not-allowed; box-shadow: none; transform: none;
  }

  .back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none;
    color: ${T.muted};
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer; padding: 6px 10px;
    border-radius: 8px;
    transition: color 0.18s, background 0.18s;
  }
  .back-btn:hover { color: ${T.slate}; background: ${T.offWhite}; }

  .step-pill {
    background: ${T.orangeLight};
    border: 1px solid rgba(249,115,22,0.2);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px; font-weight: 700;
    color: ${T.orange};
    font-family: 'Outfit', sans-serif;
    letter-spacing: 0.5px;
  }

  .progress-dot {
    height: 8px; border-radius: 99px;
    transition: all 0.35s cubic-bezier(.4,0,.2,1);
  }
  .progress-dot.done    { background: ${T.orange}; width: 8px; }
  .progress-dot.current { background: ${T.orange}; width: 28px; animation: pulse 1.8s ease infinite; }
  .progress-dot.upcoming{ background: ${T.faint};  width: 8px; }

  .summary-card {
    background: ${T.offWhite};
    border: 1px solid ${T.border};
    border-radius: 14px;
    padding: 14px 16px;
    text-align: left;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(11,110,110,0.08);
  }

  .logo-mark {
    width: 38px; height: 38px; border-radius: 11px;
    background: linear-gradient(135deg, ${T.orange} 0%, ${T.orangeDark} 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px ${T.orangeGlow};
    flex-shrink: 0;
  }

  /* Decorative orbs */
  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(60px); pointer-events: none; z-index: 0;
    animation: orb 12s ease-in-out infinite;
  }

  .quiz-shell {
    position: relative;
    z-index: 1;
    width: min(1220px, 96vw);
    min-height: calc(100vh - 170px);
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 20px;
    align-items: stretch;
  }

  .quiz-side {
    background: linear-gradient(160deg, #0F2233 0%, #16364B 100%);
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 28px 24px;
    color: #d6e7f3;
    box-shadow: 0 4px 32px rgba(15,34,51,0.24);
  }

  .quiz-main {
    display: flex;
    align-items: stretch;
    justify-content: center;
  }

  @media (max-width: 980px) {
    .quiz-shell {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .quiz-side { display: none; }
  }
`;

// ─── QUESTIONS (same logic, kept intact) ─────────────────────────────────────
const QUESTIONS = {
  situation: {
    id: "situation",
    q: "Let's start simple — which best describes you right now?",
    subtext: "This helps us tailor everything just for you.",
    tag: "situation",
    options: [
      { label: "Student",                   value: "student",      emoji: "🎓" },
      { label: "Just started working",       value: "first_job",    emoji: "💼" },
      { label: "Working professional",       value: "professional", emoji: "📊" },
      { label: "Freelancer / Self-employed", value: "freelancer",   emoji: "🖥️" },
    ],
    next: (ans) => ans === "student" ? "expense_tracking" : "income_range",
  },
  income_range: {
    id: "income_range",
    q: "What's your approximate monthly income?",
    subtext: "We won't store this — it just helps personalise your insights.",
    tag: "incomeRange",
    options: [
      { label: "Under ₹15,000",      value: "<15k",    emoji: "💰" },
      { label: "₹15,000 – ₹30,000",  value: "15k-30k", emoji: "💵" },
      { label: "₹30,000 – ₹60,000",  value: "30k-60k", emoji: "💳" },
      { label: "Above ₹60,000",      value: "60k+",    emoji: "🏦" },
    ],
    next: () => "expense_tracking",
  },
  expense_tracking: {
    id: "expense_tracking",
    q: "How do you usually keep track of your expenses?",
    subtext: "Be honest — there's no wrong answer here.",
    tag: "spendingBehavior",
    options: [
      { label: "Actively — daily or weekly",     value: "planned",    emoji: "📋" },
      { label: "Occasionally, when I remember",  value: "occasional", emoji: "🔔" },
      { label: "Rarely, only big purchases",     value: "reactive",   emoji: "🤷" },
      { label: "I don't track at all",           value: "untracked",  emoji: "🌀" },
    ],
    next: () => "overspend_category",
  },
  overspend_category: {
    id: "overspend_category",
    q: "Where do you tend to overspend the most?",
    subtext: "Most people have at least one! Pick the biggest one.",
    tag: "overspendCategory",
    options: [
      { label: "Food & dining out",        value: "food",          emoji: "🍔" },
      { label: "Shopping & fashion",       value: "shopping",      emoji: "🛍️" },
      { label: "Travel & outings",         value: "travel",        emoji: "✈️" },
      { label: "Subscriptions & apps",     value: "subscriptions", emoji: "📱" },
      { label: "I usually stay on budget", value: "none",          emoji: "✅" },
    ],
    next: () => "savings_habit",
  },
  savings_habit: {
    id: "savings_habit",
    q: "How do you usually save money?",
    subtext: "Pick what fits your current routine best.",
    tag: "savingsConsistency",
    options: [
      { label: "Fixed amount every month",                      value: "consistent", emoji: "📅" },
      { label: "Whatever's left at month end",                  value: "leftover",   emoji: "🪣" },
      { label: "Only when saving for something specific",       value: "goal_based", emoji: "🎯" },
      { label: "I don't save consistently",                     value: "irregular",  emoji: "😬" },
    ],
    next: (ans) => ans === "irregular" ? "savings_blocker" : "goal_check",
  },
  savings_blocker: {
    id: "savings_blocker",
    q: "What makes it hard to save regularly?",
    subtext: "Understanding the barrier is the first step to fixing it.",
    tag: "savingsBlocker",
    options: [
      { label: "My income doesn't leave much room",       value: "low_income",    emoji: "💸" },
      { label: "Expenses are just too high",              value: "high_expenses", emoji: "📈" },
      { label: "I know I should, but haven't planned",    value: "no_plan",       emoji: "📝" },
      { label: "Honestly, haven't thought about it",      value: "no_thought",    emoji: "💭" },
    ],
    next: () => "goal_check",
  },
  goal_check: {
    id: "goal_check",
    q: "Do you have any financial goals right now?",
    subtext: "Goals can be anything — a trip, a gadget, a home, retirement.",
    tag: "goalClarity",
    options: [
      { label: "Yes — clearly defined goals",  value: "clear", emoji: "🎯" },
      { label: "Some idea, nothing specific",  value: "vague", emoji: "🌫️" },
      { label: "Not really thinking about it", value: "none",  emoji: "🤔" },
    ],
    next: (ans) => (ans === "clear" || ans === "vague") ? "goal_type" : "risk_comfort",
  },
  goal_type: {
    id: "goal_type",
    q: "What kind of goals matter most to you right now?",
    subtext: "Pick the one closest to your priority.",
    tag: "goalType",
    options: [
      { label: "Near-term purchases (phone, bike, etc.)", value: "short_term", emoji: "🛒" },
      { label: "Education or career growth",             value: "career",      emoji: "📚" },
      { label: "Big life milestones (home, wedding)",    value: "life_goals",  emoji: "🏡" },
      { label: "Building an emergency safety net",       value: "emergency",   emoji: "🛡️" },
    ],
    next: () => "risk_comfort",
  },
  risk_comfort: {
    id: "risk_comfort",
    q: "If your savings temporarily dropped, how would you feel?",
    subtext: "Imagine a small market dip or unexpected expense.",
    tag: "riskComfort",
    options: [
      { label: "Very uncomfortable — I'd lose sleep", value: "low",    emoji: "😰" },
      { label: "Uneasy, but I'd manage for a while",  value: "medium", emoji: "😐" },
      { label: "Fine — it's part of managing money",  value: "high",   emoji: "😌" },
    ],
    next: () => "knowledge_level",
  },
  knowledge_level: {
    id: "knowledge_level",
    q: "How confident are you with financial concepts?",
    subtext: "Things like SIPs, tax deductions, or investment risk.",
    tag: "knowledgeLevel",
    options: [
      { label: "Beginner — still learning the basics",  value: "beginner",     emoji: "🌱" },
      { label: "Some knowledge, still unsure at times", value: "intermediate", emoji: "📖" },
      { label: "Confident — I know my way around",      value: "advanced",     emoji: "💡" },
    ],
    next: () => "stress_level",
  },
  stress_level: {
    id: "stress_level",
    q: "How often do you find yourself worrying about money?",
    subtext: "This helps us surface the right support for you.",
    tag: "stressLevel",
    options: [
      { label: "Rarely — I feel fairly in control",      value: "low",    emoji: "😊" },
      { label: "Sometimes, especially near month end",    value: "medium", emoji: "😶" },
      { label: "Quite often — it weighs on me",          value: "high",   emoji: "😔" },
    ],
    next: () => null,
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function buildSequence(answers) {
  const seq = [];
  let current = "situation";
  const tempAnswers = { ...answers };
  while (current) {
    seq.push(current);
    const q = QUESTIONS[current];
    if (!q) break;
    const ans = tempAnswers[q.tag] ?? tempAnswers[current];
    current = q.next(ans, tempAnswers);
  }
  return seq;
}

function computeProfile(answers) {
  return {
    situation:          answers.situation          ?? null,
    incomeRange:        answers.incomeRange         ?? "none",
    spendingBehavior:   answers.spendingBehavior    ?? null,
    overspendCategory:  answers.overspendCategory   ?? null,
    savingsConsistency: answers.savingsConsistency  ?? null,
    savingsBlocker:     answers.savingsBlocker       ?? null,
    goalClarity:        answers.goalClarity          ?? null,
    goalType:           answers.goalType             ?? null,
    riskComfort:        answers.riskComfort          ?? null,
    knowledgeLevel:     answers.knowledgeLevel       ?? null,
    stressLevel:        answers.stressLevel          ?? null,
  };
}

function buildSummaryItems(profile) {
  const items = [];
  const map = (obj, key, label, icon) => {
    if (profile[key]) items.push({ icon, label, value: obj[profile[key]] || profile[key] });
  };
  map({ planned:"Disciplined tracker", occasional:"Casual tracker", reactive:"Reactive spender", untracked:"Flying blind" },
      "spendingBehavior", "Spending style", "📊");
  map({ consistent:"Consistently saving", leftover:"Saving leftovers", goal_based:"Goal-driven saver", irregular:"Irregular saver" },
      "savingsConsistency", "Savings habit", "💰");
  map({ low:"Risk-averse", medium:"Balanced", high:"Risk-comfortable" },
      "riskComfort", "Risk comfort", "⚖️");
  map({ clear:"Well-defined goals", vague:"Goals in progress", none:"Exploring" },
      "goalClarity", "Goal clarity", "🎯");
  map({ beginner:"Beginner", intermediate:"Intermediate", advanced:"Advanced" },
      "knowledgeLevel", "Financial knowledge", "📚");
  map({ low:"Low stress", medium:"Moderate stress", high:"High stress" },
      "stressLevel", "Money mindset", "🧘");
  return items;
}

// ─── PROGRESS DOTS ────────────────────────────────────────────────────────────
function ProgressDots({ total, currentIndex }) {
  const count = Math.min(total, 12);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
      {Array.from({ length: count }).map((_, i) => {
        let cls = "progress-dot";
        if (i < currentIndex)       cls += " done";
        else if (i === currentIndex) cls += " current";
        else                         cls += " upcoming";
        return <div key={i} className={cls} />;
      })}
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  return (
    <div style={{ width: "100%", height: 6, borderRadius: 99, background: T.border, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 99,
        background: `linear-gradient(90deg, #FBBF24, ${T.orange})`,
        width: `${pct}%`,
        transition: "width 0.55s cubic-bezier(.4,0,.2,1)",
        boxShadow: `0 2px 6px ${T.orangeGlow}`,
      }} />
    </div>
  );
}

// ─── QUESTION CARD ────────────────────────────────────────────────────────────
function QuestionCard({ question, selectedValue, onSelect, questionIndex, totalQuestions, onBack, canGoBack }) {
  const pct = Math.round((questionIndex / totalQuestions) * 100);

  return (
    <div className="quiz-fade" style={{
      background: T.bgCard,
      borderRadius: 24,
      padding: "36px 40px",
      boxShadow: "0 4px 40px rgba(13,37,53,0.1), 0 1px 0 rgba(255,255,255,0.8) inset",
      width: "100%", maxWidth: 840, minHeight: "70vh",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, #FBBF24, ${T.orange})`,
        borderRadius: "24px 24px 0 0",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        {canGoBack ? (
          <button className="back-btn" onClick={onBack} aria-label="Go back">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        ) : <div />}
        <span className="step-pill">
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 30 }}>
        <ProgressBar pct={pct} />
      </div>

      {/* Question */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 21,
          fontWeight: 800,
          color: T.navy,
          fontFamily: "'Outfit', sans-serif",
          lineHeight: 1.3,
          marginBottom: question.subtext ? 8 : 0,
          letterSpacing: -0.3,
        }}>
          {question.q}
        </h2>
        {question.subtext && (
          <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, fontWeight: 500 }}>
            {question.subtext}
          </p>
        )}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((opt, i) => {
          const isSelected = selectedValue === opt.value;
          const pal = CARD_PALETTES[i % CARD_PALETTES.length];
          return (
            <button
              key={opt.value}
              className={`option-card${isSelected ? " selected" : ""}`}
              style={isSelected ? {
                background: T.orangeLight,
                borderColor: T.orange,
              } : {
                background: T.white,
                borderColor: T.border,
              }}
              onClick={() => onSelect(opt.value)}
              aria-pressed={isSelected}
            >
              {/* Emoji badge */}
              {opt.emoji && (
                <span
                  className="emoji-badge"
                  style={{
                    background: isSelected ? T.orangeLight : pal.bg,
                    border: `1px solid ${isSelected ? T.orange : pal.border}`,
                  }}
                >
                  {opt.emoji}
                </span>
              )}

              {/* Label */}
              <span style={{
                flex: 1,
                fontSize: 14,
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? T.orange : T.navy,
                lineHeight: 1.4,
                transition: "color 0.18s",
              }}>
                {opt.label}
              </span>

              {/* Check circle */}
              <div className="opt-check" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {/* Progress dots */}
      <div style={{ marginTop: 28 }}>
        <ProgressDots total={totalQuestions} currentIndex={questionIndex} />
      </div>
    </div>
  );
}

// ─── COMPLETION SCREEN ────────────────────────────────────────────────────────
function CompletionScreen({ profile, onContinue, saving }) {
  const items = useMemo(() => buildSummaryItems(profile), [profile]);
  const situationLabel = {
    student:      "Student",
    first_job:    "Early-career Professional",
    professional: "Working Professional",
    freelancer:   "Freelancer / Self-employed",
  }[profile.situation] ?? "Professional";

  return (
    <div className="quiz-fade" style={{
      background: T.bgCard,
      borderRadius: 24,
      padding: "44px 40px",
      boxShadow: "0 4px 40px rgba(13,37,53,0.1)",
      width: "100%", maxWidth: 840, minHeight: "70vh",
      textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, #FBBF24, ${T.orange})`,
        borderRadius: "24px 24px 0 0",
      }} />

      {/* Decorative confetti circles */}
      {["#F97316","#0B8A8A","#FBBF24","#6366F1"].map((c,i) => (
        <div key={i} style={{
          position: "absolute",
          width: 8, height: 8, borderRadius: "50%",
          background: c, opacity: 0.35,
          top:  `${15 + i*18}%`,
          left: i % 2 === 0 ? `${8 + i*3}%` : `${85 - i*3}%`,
          animation: `floatA ${4+i}s ease-in-out infinite`,
          animationDelay: `${i*0.5}s`,
        }} />
      ))}

      {/* Success badge */}
      <div className="quiz-scale" style={{
        width: 76, height: 76, borderRadius: "50%",
        background: `linear-gradient(135deg, ${T.orange}, ${T.orangeDark})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        boxShadow: `0 8px 28px ${T.orangeGlow}`,
      }}>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path d="M8 17.5L14 23.5L26 11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 style={{
        fontSize: 26, fontWeight: 800, fontFamily: "'Outfit', sans-serif",
        color: T.navy, marginBottom: 8, letterSpacing: -0.5,
      }}>
        You're all set! 🎉
      </h2>
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 10 }}>
        Thanks for sharing. Your profile as a{" "}
        <strong style={{ color: T.orange }}>{situationLabel}</strong>{" "}
        has been created.
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: T.border, margin: "20px 0" }} />

      {/* Summary label */}
      <p style={{
        fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 1.2,
        textTransform: "uppercase", marginBottom: 14, fontFamily: "'Outfit', sans-serif",
      }}>
        Your Financial Profile
      </p>

      {/* Profile cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24,
      }}>
        {items.map((item, i) => {
          const pal = CARD_PALETTES[i % CARD_PALETTES.length];
          return (
            <div
              key={i}
              className="summary-card quiz-fadein"
              style={{
                background: pal.bg,
                border: `1px solid ${pal.border}`,
                animationDelay: `${i * 70}ms`,
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 13, color: T.navy, fontWeight: 700 }}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* What's next banner */}
      <div style={{
        background: `linear-gradient(135deg, ${T.orangeLight} 0%, #FFF8F0 100%)`,
        border: `1px solid rgba(249,115,22,0.2)`,
        borderRadius: 14,
        padding: "16px 18px",
        fontSize: 13.5, color: T.slate, lineHeight: 1.65,
        textAlign: "left", marginBottom: 24,
      }}>
        <strong style={{ color: T.orange, fontSize: 14 }}>✨ What's next?</strong><br />
        Based on your answers, we'll show you personalised insights, relevant learning modules, and smart nudges — all designed for your financial goals.
      </div>

      <button
        className="cta-btn"
        style={{ width: "100%", justifyContent: "center", fontSize: 15.5, padding: "15px" }}
        onClick={onContinue}
        disabled={saving}
      >
        {saving ? "Saving profile..." : "Go to my Dashboard"}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── DECORATIVE BG SHAPES ─────────────────────────────────────────────────────
function BgOrbs() {
  return (
    <>
      <div className="orb" style={{
        width: 320, height: 320,
        background: "rgba(249,115,22,0.08)",
        top: "-80px", right: "-60px",
      }} />
      <div className="orb" style={{
        width: 260, height: 260,
        background: "rgba(11,138,138,0.08)",
        bottom: "-40px", left: "-60px",
        animationDelay: "4s",
      }} />
      <div className="orb" style={{
        width: 180, height: 180,
        background: "rgba(251,191,36,0.07)",
        top: "40%", left: "50%",
        animationDelay: "2s",
      }} />
    </>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function FinancialQuiz({ onComplete }) {
  const navigate = useNavigate();
  const [currentId, setCurrentId]       = useState("situation");
  const [answers, setAnswers]           = useState({});
  const [pendingValue, setPendingValue] = useState(null);
  const [history, setHistory]           = useState([]);
  const [done, setDone]                 = useState(false);
  const [profile, setProfile]           = useState(null);
  const [saveError, setSaveError]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [animKey, setAnimKey]           = useState(0);

  const currentQuestion = QUESTIONS[currentId];

  const estimatedSequence = useMemo(
    () => buildSequence(answers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(answers)]
  );

  const questionIndex = estimatedSequence.indexOf(currentId);
  const totalEstimated = estimatedSequence.length;
  const savedValue = answers[currentQuestion?.tag] ?? null;
  const displayValue = pendingValue ?? savedValue;

  const handleSelect = (value) => {
    setPendingValue(value);
    setTimeout(() => advance(value), 260);
  };

  const advance = (value) => {
    const q = QUESTIONS[currentId];
    if (!q) return;
    const newAnswers = { ...answers, [q.tag]: value };
    setAnswers(newAnswers);
    setPendingValue(null);
    const nextId = q.next(value, newAnswers);
    if (!nextId) {
      const p = computeProfile(newAnswers);
      setProfile(p);
      setDone(true);
      if (typeof onComplete === "function") onComplete(p);
      return;
    }
    setHistory(h => [...h, currentId]);
    setCurrentId(nextId);
    setAnimKey(k => k + 1);
  };

  const handleBack = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentId(prev);
    setPendingValue(null);
    setAnimKey(k => k + 1);
  };

  const handleContinue = async () => {
    if (!profile) return;

    const userId = localStorage.getItem("auth_user_id");
    setSaving(true);
    setSaveError("");

    try {
      if (userId) {
        await postJson(
          `/users/${userId}/quiz-results`,
          { profile, answers },
          "Unable to save quiz results"
        );
      }
      window.dispatchEvent(new CustomEvent("finsight:quiz:complete", { detail: profile }));
      navigate("/dashboard");
    } catch (error) {
      setSaveError(error?.message || "Unable to save quiz results");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        minHeight: "100vh", width: "100vw",
        background: `radial-gradient(ellipse at 70% 10%, rgba(249,115,22,0.06) 0%, transparent 50%),
                     radial-gradient(ellipse at 10% 80%, rgba(11,138,138,0.07) 0%, transparent 50%),
                     ${T.bg}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        <BgOrbs />

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 32,
          animation: "fadeIn 0.45s ease both", position: "relative", zIndex: 1,
        }}>
          <div className="logo-mark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 14.5L8 9L11.5 12.5L17 5.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="17" cy="5.5" r="2" fill="white"/>
            </svg>
          </div>
          <div>
            <span style={{
              fontSize: 18, fontWeight: 800,
              color: T.navy,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: -0.4, display: "block", lineHeight: 1.1,
            }}>
              Fin<span style={{ color: T.orange }}>Sight</span>
            </span>
            <span style={{ fontSize: 10.5, color: T.muted, fontWeight: 600, letterSpacing: 0.5 }}>
              FINANCIAL PROFILER
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="quiz-shell">
          <aside className="quiz-side">
            <p style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.7, marginBottom: 14 }}>Profile Setup</p>
            <h3 style={{ fontSize: 26, lineHeight: 1.2, color: "#fff", fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>
              Build your personal financial DNA
            </h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, opacity: 0.86, marginBottom: 18 }}>
              We use your selections to personalize dashboard insights, learning paths, and spending nudges.
            </p>
            <div style={{ height: 1, background: "rgba(255,255,255,0.14)", marginBottom: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Adaptive question flow",
                "Stores profile under your account",
                "Immediate dashboard personalization",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#d2e5ef" }}>
                  <span style={{ color: "#0E9F79", fontWeight: 800 }}>●</span>
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="quiz-main">
            {done && profile ? (
              <CompletionScreen profile={profile} onContinue={handleContinue} saving={saving} key="done" />
            ) : currentQuestion ? (
              <QuestionCard
                key={animKey}
                question={currentQuestion}
                selectedValue={displayValue}
                onSelect={handleSelect}
                questionIndex={Math.max(0, questionIndex)}
                totalQuestions={Math.max(totalEstimated, questionIndex + 1)}
                onBack={handleBack}
                canGoBack={history.length > 0}
              />
            ) : null}
          </div>
        </div>

        {done && saveError && (
          <p style={{ marginTop: 10, color: "#b91c1c", fontSize: 13, fontWeight: 600, zIndex: 2 }}>{saveError}</p>
        )}
        {done && saving && (
          <p style={{ marginTop: 10, color: T.teal, fontSize: 13, fontWeight: 700, zIndex: 2 }}>Saving your profile...</p>
        )}

        {/* ── Footer ── */}
        <p style={{
          marginTop: 22, fontSize: 12, color: T.muted,
          textAlign: "center", lineHeight: 1.6, maxWidth: 340,
          animation: "fadeIn 0.5s ease both", position: "relative", zIndex: 1,
        }}>
          🔒 Your answers are private and never shared.
          They're only used to personalise your FinSight experience.
        </p>
      </div>
    </>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import AppNavbar from "../components/AppNavbar";
import { awardPoints, getPointsSummary, getStoredPoints } from "../services/pointsApi";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  // Finsight primary greens
  teal:       "#0E9F79",
  tealDark:   "#0B7D61",
  tealLight:  "#E9F8F2",
  tealMid:    "#BFEADB",
  // Text
  navy:       "#0F2233",
  navyLight:  "#1F3C55",
  slate:      "#4B6279",
  muted:      "#8094A9",
  faint:      "#C6D3DE",
  // Points/gold
  gold:       "#B67F10",
  goldLight:  "#FFF3D8",
  goldBorder: "#E6B547",
  // Status
  green:      "#17976E",
  greenLight: "#E8F7F0",
  red:        "#DC4E4E",
  redLight:   "#FFF2F2",
  // Keep non-purple accents for CTAs
  indigo:     "#148B7E",
  indigoLight:"#DCF4EF",
  amber:      "#CC7A17",
  white:      "#FFFFFF",
  // Backgrounds
  bg:         "#E9EEF6",
  bgCard:     "#FFFFFF",
  border:     "#D5E8DF",
  borderSoft: "#EAF4EF",
};

// ─── CURRICULUM DATA ──────────────────────────────────────────────────────────
const CURRICULUM = [
  {
    id: "foundations",
    title: "Financial Foundations",
    subtitle: "Start your journey here",
    icon: "🏗️",
    color: "#2A9D6A",
    gradient: "linear-gradient(135deg, #1E7A50 0%, #2A9D6A 100%)",
    level: "Beginner",
    totalPts: 375,
    lock: { type: "open" },
    courses: [
      {
        id: "ff1", title: "What is Personal Finance?", duration: "8 min", pts: 75, minScore: 60,
        video: { url: "#", thumb: "💰", desc: "Understand the core pillars of personal finance — income, saving, investing, insurance, and tax planning — and why managing them matters in India's evolving economy." },
        quiz: [
          { q: "Which is NOT a pillar of personal finance?", opts: ["Saving","Entertainment spending","Insurance","Tax Planning"], ans: 1 },
          { q: "Personal finance is primarily about?", opts: ["Making the most money","Managing your money wisely","Avoiding all debt","Only investing in stocks"], ans: 1 },
          { q: "What percentage of Indians lack structured financial planning?", opts: ["20%","45%","Over 70%","10%"], ans: 2 },
        ],
      },
      {
        id: "ff2", title: "Understanding Income & Expenses", duration: "10 min", pts: 100, minScore: 60,
        video: { url: "#", thumb: "📊", desc: "Learn to classify every rupee that comes in and goes out — salary, freelance income, EMIs, groceries, and more — using simple categorization frameworks." },
        quiz: [
          { q: "Fixed expenses are best described as?", opts: ["Expenses that change monthly","Expenses that stay constant","Only luxury items","Tax-related costs"], ans: 1 },
          { q: "A UPI transfer for groceries is classified as?", opts: ["Fixed expense","Variable expense","Investment","Income"], ans: 1 },
          { q: "Net income equals?", opts: ["Gross income + taxes","Gross income − deductions","Total spending","All bank credits"], ans: 1 },
        ],
      },
      {
        id: "ff3", title: "Reading Your Bank Statement", duration: "12 min", pts: 100, minScore: 70,
        video: { url: "#", thumb: "🏦", desc: "Decode every line of your bank statement — debits, credits, NEFT, RTGS, UPI, ATM withdrawals — and spot hidden charges and patterns in your spending." },
        quiz: [
          { q: "NEFT stands for?", opts: ["National Electronic Funds Transfer","Net Electronic Finance Transfer","National Emergency Fund Transfer","None"], ans: 0 },
          { q: "A debit in your bank statement means?", opts: ["Money received","Money sent out","Interest earned","Tax deducted"], ans: 1 },
          { q: "Minimum balance charges appear as?", opts: ["Credit entries","Debit entries","Neither","Both"], ans: 1 },
        ],
      },
      {
        id: "ff4", title: "Setting Your Financial Goals", duration: "9 min", pts: 100, minScore: 60,
        video: { url: "#", thumb: "🎯", desc: "Use the SMART goal framework to define short-term (emergency fund), medium-term (home down payment), and long-term (retirement) financial targets tailored to Indian life stages." },
        quiz: [
          { q: "SMART goals stands for?", opts: ["Simple, Measurable, Achievable, Relevant, Timely","Specific, Measurable, Achievable, Relevant, Time-bound","Specific, Manageable, Accurate, Realistic, Timely","Simple, Manageable, Achievable, Reliable, Timely"], ans: 1 },
          { q: "An emergency fund should ideally cover?", opts: ["1 month expenses","3–6 months expenses","12 months expenses","Only rent"], ans: 1 },
          { q: "Which goal is long-term?", opts: ["Buying a phone in 3 months","Vacation in 6 months","Retirement corpus","Clearing credit card this month"], ans: 2 },
        ],
      },
    ],
  },
  {
    id: "budgeting",
    title: "Budgeting & Expense Tracking",
    subtitle: "Build iron-clad money habits",
    icon: "📋",
    color: "#1A8C5A",
    gradient: "linear-gradient(135deg, #0F6640 0%, #1A8C5A 100%)",
    level: "Beginner",
    totalPts: 425,
    lock: { type: "open" },
    courses: [
      {
        id: "bu1", title: "The 50/30/20 Budgeting Rule", duration: "10 min", pts: 75, minScore: 60,
        video: { url: "#", thumb: "📐", desc: "Apply the globally proven 50/30/20 framework to your Indian income — 50% for needs (rent, groceries, EMIs), 30% for wants, 20% for savings and investments." },
        quiz: [
          { q: "In 50/30/20, what does '20' represent?", opts: ["Needs","Wants","Savings & Investments","Taxes"], ans: 2 },
          { q: "If your salary is ₹60,000, how much should go to needs?", opts: ["₹18,000","₹30,000","₹12,000","₹20,000"], ans: 1 },
          { q: "A gym membership is typically classified as?", opts: ["Need","Want","Savings","Investment"], ans: 1 },
        ],
      },
      {
        id: "bu2", title: "Zero-Based Budgeting", duration: "11 min", pts: 100, minScore: 70,
        video: { url: "#", thumb: "🔢", desc: "In zero-based budgeting every rupee has a job. Income minus all allocations = ₹0. Learn to assign purpose to every rupee before the month begins." },
        quiz: [
          { q: "Zero-based budgeting means?", opts: ["Spending nothing","Every rupee is allocated a purpose","Saving 100% of income","Starting savings from zero"], ans: 1 },
          { q: "What happens to leftover money in ZBB?", opts: ["Ignored","Assigned to a category","Spent freely","Returned to bank"], ans: 1 },
          { q: "ZBB is most useful for?", opts: ["People with irregular income","People with no income","Only salaried employees","Business owners only"], ans: 0 },
        ],
      },
      {
        id: "bu3", title: "Tracking UPI & Digital Transactions", duration: "13 min", pts: 100, minScore: 70,
        video: { url: "#", thumb: "📱", desc: "Master the art of auto-categorizing PhonePe, Google Pay, Paytm, and IMPS transactions. Build a dashboard from raw UPI statement data in minutes." },
        quiz: [
          { q: "UPI stands for?", opts: ["Unified Payment Interface","Universal Payment Integration","Unified Purchase Index","United Payment Interface"], ans: 0 },
          { q: "Which statement format contains UPI transactions?", opts: ["Credit card statement only","Bank account statement","Demat statement","Loan statement"], ans: 1 },
          { q: "Auto-categorization of transactions helps in?", opts: ["Reducing taxes","Identifying spending patterns","Increasing income","Avoiding EMIs"], ans: 1 },
        ],
      },
      {
        id: "bu4", title: "Managing Credit Card Bills", duration: "10 min", pts: 75, minScore: 60,
        video: { url: "#", thumb: "💳", desc: "Understand statement cycles, minimum due vs. full payment, credit utilization, and how to avoid the revolving credit trap that costs lakhs in interest annually." },
        quiz: [
          { q: "Paying only the minimum due on a credit card?", opts: ["Saves money","Incurs heavy interest charges","Improves credit score greatly","Is same as full payment"], ans: 1 },
          { q: "Ideal credit utilization ratio is?", opts: ["Below 30%","Above 70%","Exactly 50%","100%"], ans: 0 },
          { q: "Credit card billing cycle is typically?", opts: ["7 days","15 days","30 days","90 days"], ans: 2 },
        ],
      },
      {
        id: "bu5", title: "Identifying Hidden & Recurring Expenses", duration: "9 min", pts: 75, minScore: 60,
        video: { url: "#", thumb: "🔍", desc: "Uncover subscription traps, auto-renewed services, and dormant memberships draining your account. A forensic audit approach to finding leaked money." },
        quiz: [
          { q: "A subscription you forgot about is a type of?", opts: ["Productive expense","Hidden recurring expense","Investment","Income"], ans: 1 },
          { q: "The best way to find hidden expenses is?", opts: ["Asking friends","Auditing 3 months of bank statements","Guessing","Checking only cash transactions"], ans: 1 },
          { q: "Which is an example of a recurring expense?", opts: ["One-time laptop purchase","Monthly Netflix subscription","Cash gift","Annual bonus"], ans: 1 },
        ],
      },
    ],
  },
  {
    id: "tax",
    title: "Tax Planning India",
    subtitle: "Save more, pay exactly right",
    icon: "📑",
    color: "#2D8C74",
    gradient: "linear-gradient(135deg, #1A6654 0%, #2D8C74 100%)",
    level: "Intermediate",
    totalPts: 600,
    lock: { type: "points", required: 350, label: "Earn 350 pts to unlock" },
    courses: [
      {
        id: "tx1", title: "Income Tax Basics in India", duration: "14 min", pts: 125, minScore: 70,
        video: { url: "#", thumb: "📜", desc: "Understand taxable income, assessment year vs. financial year, TDS, Form 16, and why you might get a refund — or owe money — despite employer deductions." },
        quiz: [
          { q: "Financial Year in India runs from?", opts: ["Jan 1 – Dec 31","April 1 – March 31","July 1 – June 30","Oct 1 – Sep 30"], ans: 1 },
          { q: "TDS stands for?", opts: ["Tax Deducted at Source","Total Due Sum","Tax Deposit Statement","Transfer Debit Service"], ans: 0 },
          { q: "Form 16 is issued by?", opts: ["Income Tax Dept","Your employer","Bank","SEBI"], ans: 1 },
        ],
      },
      {
        id: "tx2", title: "Old vs New Tax Regime", duration: "16 min", pts: 150, minScore: 70,
        video: { url: "#", thumb: "⚖️", desc: "A side-by-side comparison: which regime saves more for your income slab? Understand exemptions, deductions lost in the new regime, and breakeven analysis." },
        quiz: [
          { q: "The new tax regime offers?", opts: ["Higher exemptions","Lower rates but fewer deductions","HRA deductions","Standard deduction of ₹50,000"], ans: 1 },
          { q: "Section 80C deductions are available in?", opts: ["New regime only","Old regime only","Both regimes","Neither regime"], ans: 1 },
          { q: "You can switch tax regime?", opts: ["Never","Every year","Only once","Every 5 years"], ans: 1 },
        ],
      },
      {
        id: "tx3", title: "Deductions: 80C, 80D & Beyond", duration: "18 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "💊", desc: "Maximize your deductions: PPF, ELSS, LIC premiums under 80C; health insurance under 80D; home loan interest under 24(b); NPS under 80CCD(1B)." },
        quiz: [
          { q: "Maximum deduction under Section 80C is?", opts: ["₹1 lakh","₹1.5 lakh","₹2 lakh","₹50,000"], ans: 1 },
          { q: "Section 80D covers?", opts: ["Home loan","Health insurance premium","Life insurance","Education loan"], ans: 1 },
          { q: "NPS extra deduction under 80CCD(1B) is?", opts: ["₹50,000","₹1 lakh","₹1.5 lakh","₹25,000"], ans: 0 },
        ],
      },
      {
        id: "tx4", title: "ITR Filing Step-by-Step", duration: "20 min", pts: 150, minScore: 70,
        video: { url: "#", thumb: "🖥️", desc: "A complete walkthrough of filing ITR-1 and ITR-2 on the income tax portal — uploading Form 16, entering capital gains, verifying via Aadhaar OTP." },
        quiz: [
          { q: "ITR-1 (Sahaj) is for?", opts: ["Business owners","Salaried with income up to ₹50L","NRIs","Companies"], ans: 1 },
          { q: "Deadline for salaried ITR filing is?", opts: ["31 March","31 July","30 September","31 December"], ans: 1 },
          { q: "e-Verification of ITR can be done via?", opts: ["Physical signature only","Aadhaar OTP","Bank visit","Courier"], ans: 1 },
        ],
      },
    ],
  },
  {
    id: "investing",
    title: "Investment Fundamentals",
    subtitle: "Make your money work for you",
    icon: "📈",
    color: "#25967A",
    gradient: "linear-gradient(135deg, #17705A 0%, #25967A 100%)",
    level: "Intermediate",
    totalPts: 550,
    lock: { type: "points", required: 700, label: "Earn 700 pts to unlock" },
    courses: [
      {
        id: "iv1", title: "Mutual Funds Basics", duration: "14 min", pts: 125, minScore: 60,
        video: { url: "#", thumb: "🎯", desc: "What is a mutual fund? NAV, AUM, expense ratio, direct vs regular plans, growth vs IDCW — the complete vocabulary and mechanics for Indian investors." },
        quiz: [
          { q: "NAV stands for?", opts: ["Net Asset Value","New Annual Value","National Asset Verification","Net Annual Volume"], ans: 0 },
          { q: "Direct mutual fund plans have?", opts: ["Higher expense ratio","Lower expense ratio","Same expense ratio","No expense ratio"], ans: 1 },
          { q: "SEBI regulates mutual funds in India. True or False?", opts: ["True","False","Partially true","RBI regulates them"], ans: 0 },
        ],
      },
      {
        id: "iv2", title: "SIP vs Lump Sum Investing", duration: "12 min", pts: 125, minScore: 60,
        video: { url: "#", thumb: "🔄", desc: "Rupee cost averaging with SIPs vs one-time lump sum. Which strategy wins over 10 years with Indian market volatility? Real numbers, real analysis." },
        quiz: [
          { q: "SIP helps with?", opts: ["Timing the market","Rupee cost averaging","Avoiding all losses","Guaranteed returns"], ans: 1 },
          { q: "Lump sum investing is better when?", opts: ["Market is at peak","Market has just corrected sharply","You have no money","Markets are uncertain"], ans: 1 },
          { q: "SIP stands for?", opts: ["Systematic Investment Plan","Standard Interest Payment","Secured Investment Policy","Sequential Income Plan"], ans: 0 },
        ],
      },
      {
        id: "iv3", title: "Understanding Stocks & Equity", duration: "16 min", pts: 150, minScore: 70,
        video: { url: "#", thumb: "📉", desc: "BSE, NSE, Sensex, Nifty 50 — demystified. How to open a demat account, read a stock chart, understand P/E ratios, and spot overvalued stocks." },
        quiz: [
          { q: "Sensex tracks the top ___ companies?", opts: ["50","30","100","500"], ans: 1 },
          { q: "A high P/E ratio generally indicates?", opts: ["Undervalued stock","Overvalued or growth stock","No earnings","Dividend stock"], ans: 1 },
          { q: "Demat account is required for?", opts: ["Holding mutual funds","Holding shares electronically","Fixed deposits","Savings account"], ans: 1 },
        ],
      },
      {
        id: "iv4", title: "ELSS & Tax-Saving Investments", duration: "14 min", pts: 150, minScore: 60,
        video: { url: "#", thumb: "🛡️", desc: "ELSS funds: the only 80C investment with market-linked returns and the shortest lock-in of 3 years. Compare with PPF, NSC, and ULIP for informed decisions." },
        quiz: [
          { q: "ELSS lock-in period is?", opts: ["1 year","3 years","5 years","7 years"], ans: 1 },
          { q: "ELSS falls under which section?", opts: ["80D","80C","24(b)","10(10D)"], ans: 1 },
          { q: "PPF maturity period is?", opts: ["3 years","5 years","10 years","15 years"], ans: 3 },
        ],
      },
    ],
  },
  {
    id: "debt",
    title: "Debt & Loan Management",
    subtitle: "Break free from the debt trap",
    icon: "🔓",
    color: "#1B9060",
    gradient: "linear-gradient(135deg, #0F6844 0%, #1B9060 100%)",
    level: "Intermediate",
    totalPts: 525,
    lock: { type: "points", required: 900, buyPoints: { price: 99, pts: 500, label: "Buy 500 pts for ₹99" }, label: "Earn 900 pts to unlock" },
    courses: [
      {
        id: "db1", title: "Understanding EMI & Interest", duration: "12 min", pts: 100, minScore: 60,
        video: { url: "#", thumb: "🧮", desc: "How EMI is calculated using reducing balance method. Why the first years of a home loan pay mostly interest. The true cost of a ₹50L loan at different rates." },
        quiz: [
          { q: "EMI stands for?", opts: ["Easy Money Installment","Equated Monthly Installment","Equal Money Income","Electronic Money Interface"], ans: 1 },
          { q: "In early loan years, EMI payments are mostly?", opts: ["Principal","Interest","Equal split","Neither"], ans: 1 },
          { q: "A lower interest rate means?", opts: ["Higher EMI","Lower total cost of loan","Longer tenure always","Same total cost"], ans: 1 },
        ],
      },
      {
        id: "db2", title: "CIBIL Score & Credit Health", duration: "14 min", pts: 150, minScore: 70,
        video: { url: "#", thumb: "⭐", desc: "What makes up your 300–900 CIBIL score — payment history (35%), credit utilization (30%), length (15%), new credit (10%), mix (10%). How to improve it in 6 months." },
        quiz: [
          { q: "A good CIBIL score is typically?", opts: ["Below 600","600–700","Above 750","Exactly 900"], ans: 2 },
          { q: "Highest impact factor on CIBIL score is?", opts: ["Credit mix","Credit utilization","Payment history","New credit inquiries"], ans: 2 },
          { q: "Hard inquiries occur when?", opts: ["You check your score","A lender checks for loan application","You pay EMI","You close a credit card"], ans: 1 },
        ],
      },
      {
        id: "db3", title: "Debt Snowball vs Avalanche", duration: "13 min", pts: 125, minScore: 60,
        video: { url: "#", thumb: "🌨️", desc: "Two battle-tested debt payoff strategies: Snowball (smallest balance first, psychological wins) vs Avalanche (highest interest first, mathematically optimal). Which fits your mindset?" },
        quiz: [
          { q: "Debt Avalanche method targets?", opts: ["Smallest balance first","Highest interest rate first","Oldest debt first","Largest balance first"], ans: 1 },
          { q: "Debt Snowball is preferred by people who need?", opts: ["Mathematical optimization","Psychological motivation","Highest savings","Lowest total interest"], ans: 1 },
          { q: "Both methods require?", opts: ["Extra income","Making minimum payments on all debts except target","Debt consolidation first","Bank approval"], ans: 1 },
        ],
      },
      {
        id: "db4", title: "Loan Prepayment Strategies", duration: "11 min", pts: 150, minScore: 70,
        video: { url: "#", thumb: "🚀", desc: "Prepaying even ₹10,000 extra on your home loan in year 3 can save ₹1.2L in interest. Partial prepayment vs foreclosure, and how to negotiate prepayment penalty waivers." },
        quiz: [
          { q: "Prepaying a home loan is most beneficial in?", opts: ["Last year of tenure","Early years of tenure","Middle years","Any time equally"], ans: 1 },
          { q: "Foreclosure means?", opts: ["Missing an EMI","Paying off entire loan early","Extending loan tenure","Transferring loan"], ans: 1 },
          { q: "RBI mandates no prepayment penalty on?", opts: ["All loans","Floating rate home loans","Fixed rate loans","Auto loans"], ans: 1 },
        ],
      },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Portfolio Strategy",
    subtitle: "Professional-grade wealth building",
    icon: "🏆",
    color: "#1A9E6E",
    gradient: "linear-gradient(135deg, #0E7A52 0%, #1A9E6E 100%)",
    level: "Advanced",
    totalPts: 700,
    lock: { type: "points", required: 1100, buyPoints: { price: 199, pts: 700, label: "Buy 700 pts for ₹199" }, label: "Earn 1,100 pts to unlock" },
    courses: [
      {
        id: "ap1", title: "Asset Allocation & Diversification", duration: "18 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "🎲", desc: "Modern Portfolio Theory in plain language. Age-based allocation (100 minus age rule), correlation between asset classes, and building a portfolio that weathers every market cycle." },
        quiz: [
          { q: "The '100 minus age' rule determines allocation to?", opts: ["Debt","Equity","Real estate","Gold"], ans: 1 },
          { q: "Diversification reduces?", opts: ["Systemic risk","Unsystemic/specific risk","Both equally","Neither"], ans: 1 },
          { q: "Which assets typically move opposite to equities?", opts: ["More equities","Gold & bonds","Real estate","Cryptocurrencies"], ans: 1 },
        ],
      },
      {
        id: "ap2", title: "Index Funds & ETFs", duration: "15 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "📊", desc: "Why 90% of active fund managers underperform the index over 10 years. Nifty 50 ETF, Nifty Next 50, International index funds — building a passive portfolio at minimal cost." },
        quiz: [
          { q: "Index funds aim to?", opts: ["Beat the market","Match market returns","Outperform all mutual funds","Only invest in gold"], ans: 1 },
          { q: "Lower expense ratio means?", opts: ["Less returns","More of returns stay with investor","Worse fund manager","Higher risk"], ans: 1 },
          { q: "ETF differs from mutual fund because?", opts: ["ETFs can't invest in stocks","ETFs trade on exchanges like stocks","ETFs have no expense ratio","ETFs only track bonds"], ans: 1 },
        ],
      },
      {
        id: "ap3", title: "Real Estate as Investment", duration: "20 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "🏠", desc: "Buy vs rent analysis for Indian metros. REITs as an alternative to direct property. Calculating actual rental yield, understanding stamp duty, registration costs, and hidden ownership costs." },
        quiz: [
          { q: "REIT allows investment in real estate?", opts: ["Only by buying property","Through stock exchange-listed units","Only through banks","Via government bonds"], ans: 1 },
          { q: "Rental yield in Indian metros is typically?", opts: ["8–10%","15–20%","2–4%","0.5–1%"], ans: 2 },
          { q: "Stamp duty is paid during?", opts: ["Property rental","Property purchase registration","Property renovation","Annual property tax"], ans: 1 },
        ],
      },
      {
        id: "ap4", title: "International Investing for Indians", duration: "16 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "🌍", desc: "LRS (Liberalised Remittance Scheme), $250,000 annual limit, US ETFs via direct or feeder funds, currency hedging, and how international diversification protects against rupee depreciation." },
        quiz: [
          { q: "LRS annual limit for overseas investment is?", opts: ["$50,000","$100,000","$250,000","Unlimited"], ans: 2 },
          { q: "Investing internationally protects against?", opts: ["Market crash only","Rupee depreciation","Both","Neither"], ans: 1 },
          { q: "Feeder funds allow Indian investors to access?", opts: ["Only domestic stocks","International funds without LRS","Government bonds","Cryptocurrency"], ans: 1 },
        ],
      },
    ],
  },
  {
    id: "retirement",
    title: "Retirement & Long-Term Planning",
    subtitle: "Secure your future self",
    icon: "🌅",
    color: "#248C6E",
    gradient: "linear-gradient(135deg, #166854 0%, #248C6E 100%)",
    level: "Advanced",
    totalPts: 600,
    lock: { type: "points", required: 1200, label: "Earn 1,200 pts to unlock" },
    courses: [
      {
        id: "rt1", title: "NPS & EPF: India's Retirement Pillars", duration: "16 min", pts: 150, minScore: 70,
        video: { url: "#", thumb: "🏛️", desc: "NPS Tier 1 & Tier 2 accounts, fund manager choices (SBI, LIC, HDFC, ICICI), EPF vs VPF, and how to calculate your retirement corpus from these government-backed schemes." },
        quiz: [
          { q: "NPS withdrawal at retirement allows lump sum of?", opts:["25%","40%","60%","100%"], ans: 2 },
          { q: "EPF interest rate is set by?", opts: ["RBI","SEBI","EPFO","Finance Ministry"], ans: 2 },
          { q: "NPS Tier 2 account is?", opts: ["Mandatory","Voluntary with no tax benefit","Has lock-in","Only for government employees"], ans: 1 },
        ],
      },
      {
        id: "rt2", title: "Calculating Your Retirement Corpus", duration: "18 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "🔭", desc: "Using inflation-adjusted calculations, determine how much corpus you need. If you're 30 today wanting ₹1L/month at 60, accounting for 6% inflation — the math that changes how you save." },
        quiz: [
          { q: "Inflation's biggest impact on retirement planning is?", opts: ["Reduces investment returns","Erodes purchasing power of saved corpus","Increases EPF returns","Reduces tax liability"], ans: 1 },
          { q: "The 4% rule for retirement states?", opts: ["Save 4% of income","Withdraw 4% of corpus annually safely","Invest 4% in equity","Pay 4% tax"], ans: 1 },
          { q: "Starting retirement savings at 25 vs 35 creates a difference due to?", opts: ["Tax benefits","Power of compounding over more years","Government incentives","Employer match"], ans: 1 },
        ],
      },
      {
        id: "rt3", title: "PPF: The Tax-Free Compounder", duration: "12 min", pts: 125, minScore: 60,
        video: { url: "#", thumb: "💎", desc: "PPF's EEE (Exempt-Exempt-Exempt) tax status is unmatched. ₹1.5L/year for 15 years at current 7.1% rate — the guaranteed, risk-free, tax-free wealth builder every Indian should use." },
        quiz: [
          { q: "PPF stands for?", opts: ["Public Provident Fund","Personal Pension Fund","Private Provident Finance","Public Pension Fund"], ans: 0 },
          { q: "PPF maturity period is?", opts: ["10 years","12 years","15 years","20 years"], ans: 2 },
          { q: "PPF interest is?", opts: ["Fully taxable","Partially taxable","Fully tax-exempt","Taxed at withdrawal"], ans: 2 },
        ],
      },
      {
        id: "rt4", title: "Estate Planning & Nominations", duration: "14 min", pts: 150, minScore: 60,
        video: { url: "#", thumb: "📋", desc: "Wills, nominations in bank accounts, demat accounts, mutual funds, and insurance. Why nomination ≠ legal heir, and the simple steps to ensure your wealth transfers smoothly." },
        quiz: [
          { q: "Nomination in a bank account means the nominee?", opts: ["Automatically becomes owner","Acts as trustee to receive funds","Cannot touch the money","Gets 50% of funds"], ans: 1 },
          { q: "A registered Will overrides?", opts: ["Bank nominations","Investment nominations","Neither","Both in some states"], ans: 3 },
          { q: "Estate planning is relevant?", opts: ["Only for the wealthy","Only at retirement age","For everyone with assets","Only for business owners"], ans: 2 },
        ],
      },
    ],
  },
  {
    id: "business",
    title: "GST, Business & Freelance Finance",
    subtitle: "For the self-employed & entrepreneurs",
    icon: "💼",
    color: "#1F8C62",
    gradient: "linear-gradient(135deg, #126645 0%, #1F8C62 100%)",
    level: "Advanced",
    totalPts: 675,
    lock: { type: "points", required: 1500, buyPoints: { price: 299, pts: 1000, label: "Buy 1,000 pts for ₹299" }, label: "Earn 1,500 pts to unlock" },
    courses: [
      {
        id: "bz1", title: "GST Basics for Individuals & Freelancers", duration: "16 min", pts: 150, minScore: 70,
        video: { url: "#", thumb: "📊", desc: "When do you need GST registration? ₹20L threshold, mandatory cases, composition scheme, input tax credit, and quarterly GSTR-1 filing — all in plain language." },
        quiz: [
          { q: "GST registration is mandatory above annual turnover of?", opts: ["₹10 lakh","₹20 lakh","₹50 lakh","₹1 crore"], ans: 1 },
          { q: "ITC stands for?", opts: ["Individual Tax Credit","Input Tax Credit","Internal Tax Collection","Income Tax Calculation"], ans: 1 },
          { q: "GSTR-1 is filed?", opts: ["Daily","Weekly","Monthly or quarterly","Annually"], ans: 2 },
        ],
      },
      {
        id: "bz2", title: "Freelancer Tax Planning Guide", duration: "18 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "💻", desc: "Section 44ADA presumptive taxation, advance tax quarterly payments, deductible business expenses (internet, equipment, office), and avoiding penalties as a freelancer." },
        quiz: [
          { q: "Section 44ADA presumptive taxation applies to?", opts: ["All businesses","Professionals with up to ₹50L revenue","Only doctors","Salaried employees"], ans: 1 },
          { q: "Advance tax is due in how many instalments?", opts: ["1","2","3","4"], ans: 3 },
          { q: "Which freelance expense is generally deductible?", opts: ["Personal food","Family vacation","Home internet used for work","Personal clothing"], ans: 2 },
        ],
      },
      {
        id: "bz3", title: "Invoice Management & Cash Flow", duration: "14 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "🧾", desc: "Professional invoicing for Indian freelancers: GST invoice format, 30-day payment terms, late payment interest, and managing the feast-or-famine cash flow cycle." },
        quiz: [
          { q: "A GST invoice must include?", opts: ["GSTIN of supplier","Client's personal phone number","Handwritten signature","Bank statement"], ans: 0 },
          { q: "Cash flow management is important for freelancers because?", opts: ["Income is irregular","All income is same monthly","Banks require it","GST mandates it"], ans: 0 },
          { q: "Payment terms on an invoice refer to?", opts: ["GST rate","Time within which payment is expected","Refund policy","Currency used"], ans: 1 },
        ],
      },
      {
        id: "bz4", title: "Business Expense Tracking & Audit-Proofing", duration: "16 min", pts: 175, minScore: 70,
        video: { url: "#", thumb: "🗂️", desc: "Digital receipt management, how long to retain business records per IT Act, expense claim documentation that survives a scrutiny notice, and building an organized financial paper trail." },
        quiz: [
          { q: "Business records should be retained for at least?", opts: ["2 years","5 years","7 years","10 years"], ans: 2 },
          { q: "A scrutiny notice from Income Tax requires you to?", opts: ["Ignore it","Provide documentary evidence","Only verbal explanation","Close your business"], ans: 1 },
          { q: "Best practice for expense receipts is?", opts: ["Keep only big ones","Discard all after payment","Store digitally with categorization","Keep only cash receipts"], ans: 2 },
        ],
      },
    ],
  },
];

// ─── GLOBAL STATE HELPERS ──────────────────────────────────────────────────────
const initProgress = () => {
  const prog = {};
  CURRICULUM.forEach(cat => {
    cat.courses.forEach(c => { prog[c.id] = { videoWatched: false, quizScore: null, passed: false }; });
  });
  return prog;
};

const initUnlocked = () => {
  const u = {};
  CURRICULUM.forEach(cat => { u[cat.id] = cat.lock.type === "open"; });
  return u;
};

// ─── UTILS ─────────────────────────────────────────────────────────────────────
const pct = (n, d) => d === 0 ? 0 : Math.round((n / d) * 100);
const levelColor = l => ({ Beginner: C.teal, Intermediate: "#127D66", Advanced: "#0C5D4E" }[l] || C.teal);
const levelBg    = l => ({ Beginner: C.tealLight, Intermediate: "#D8F2E8", Advanced: "#C1E8DB" }[l] || C.tealLight);

// ─── ANIMATIONS CSS ────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box }
  body {
    margin: 0;
    background: #E9EEF6;
    font-family: 'Manrope', 'DM Sans', 'Segoe UI', sans-serif;
  }
  .learn-page {
    min-height: 100vh;
    color: #102132;
    width: 100vw;
  }
  ::placeholder { color: #8A9BB0; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb { background: rgba(42,157,106,0.22); border-radius: 99px; }
  ::-webkit-scrollbar-track { background: transparent; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes popIn    { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
  @keyframes shimmer  { 0%{background-position:-400% 0} 100%{background-position:400% 0} }
  @keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes fill     { from{width:0%} to{width:var(--w)} }
  @keyframes bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  .fade-up   { animation: fadeUp  0.45s cubic-bezier(.4,0,.2,1) both; }
  .fade-in   { animation: fadeIn  0.35s ease both; }
  .slide-in  { animation: slideIn 0.4s cubic-bezier(.4,0,.2,1) both; }
  .pop-in    { animation: popIn   0.35s cubic-bezier(.34,1.56,.64,1) both; }
`;

// ─── COMPONENTS: PROGRESS BAR ──────────────────────────────────────────────────
function Bar({ value, color, height = 6, animated = true }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 200); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ background: C.borderSoft, borderRadius: 99, height, overflow: "hidden", width: "100%" }}>
      <div style={{
        height: "100%", borderRadius: 99, background: color || C.teal,
        width: animated ? `${w}%` : `${value}%`,
        transition: animated ? "width 1s cubic-bezier(.4,0,.2,1)" : "none",
      }} />
    </div>
  );
}

// ─── COMPONENT: POINTS BADGE ───────────────────────────────────────────────────
function PtsBadge({ pts, size = "sm" }) {
  const sz = size === "lg" ? { px: "10px 18px", fs: 15 } : { px: "3px 10px", fs: 11 };
  return (
    <span style={{
      background: C.goldLight, border: `1.5px solid ${C.goldBorder}`,
      borderRadius: 99, padding: sz.px, fontSize: sz.fs,
      fontWeight: 700, color: C.gold, display: "inline-flex", alignItems: "center", gap: 4,
    }}>⭐ {pts} pts</span>
  );
}

// ─── COMPONENT: LEVEL CHIP ─────────────────────────────────────────────────────
function LevelChip({ level }) {
  return (
    <span style={{
      background: levelBg(level), color: levelColor(level),
      fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
      letterSpacing: 0.5,
    }}>{level}</span>
  );
}

// ─── SVG CATEGORY ILLUSTRATIONS ───────────────────────────────────────────────
const CatIllus = ({ gradient, icon, locked }) => (
  <svg viewBox="0 0 360 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id={`g_${icon}`} x1="0" y1="0" x2="360" y2="130" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={gradient.split(",")[1]?.trim().replace("0%)", "").trim().replace(" ", "") || "#0B6E6E"} />
        <stop offset="100%" stopColor={gradient.split(",")[2]?.trim().replace("100%)", "").trim() || "#074F4F"} />
      </linearGradient>
    </defs>
    <rect width="360" height="130" fill={gradient.includes("135") ? "url(#g_"+icon+")" : gradient} />
    {/* Decorative grid */}
    {[0,1,2,3,4].map(i => <line key={i} x1={i*90} y1="0" x2={i*90} y2="130" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
    {[0,1,2].map(i => <line key={i} x1="0" y1={i*65} x2="360" y2={i*65} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
    {/* Circles */}
    <circle cx="310" cy="20" r="70" fill="rgba(255,255,255,0.04)"/>
    <circle cx="50" cy="110" r="60" fill="rgba(255,255,255,0.04)"/>
    {/* Icon */}
    <text x="180" y="78" textAnchor="middle" fontSize="44" dominantBaseline="middle">{icon}</text>
    {locked && (
      <g>
        <rect x="296" y="8" width="52" height="28" rx="8" fill="rgba(0,0,0,0.35)" />
        <text x="322" y="26" textAnchor="middle" fontSize="14">🔒</text>
      </g>
    )}
  </svg>
);

// ─── COMPONENT: TOAST ─────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  const bg = type === "success" ? C.green : type === "warn" ? C.amber : C.red;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: "white", borderRadius: 12, padding: "14px 22px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontSize: 14, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 10, maxWidth: 360,
      animation: "popIn 0.3s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <span style={{ fontSize: 20 }}>{type === "success" ? "✅" : type === "warn" ? "⚠️" : "❌"}</span>
      {msg}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LearningSection() {
  const userId = localStorage.getItem("auth_user_id");
  const [points, setPoints]     = useState(() => {
    const stored = userId ? getStoredPoints(userId) : null;
    return typeof stored === "number" ? stored : 480;
  });
  const [progress, setProgress] = useState(initProgress);
  const [unlocked, setUnlocked] = useState(initUnlocked);
  const [view, setView]         = useState("categories"); // categories | detail | lesson
  const [activeCat, setActiveCat]       = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [toast, setToast]       = useState(null);
  const [payModal, setPayModal] = useState(null);   // category
  const [unlockModal, setUnlockModal] = useState(null); // category
  const [search, setSearch]     = useState("");

  useEffect(() => {
    let mounted = true;
    if (!userId) return () => { mounted = false; };
    (async () => {
      try {
        const summary = await getPointsSummary(userId);
        if (mounted && typeof summary?.total_points === "number") setPoints(summary.total_points);
      } catch {
        // Keep current local points if backend unavailable
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); };

  // ── Point-based unlock check ──────────────────────────────────────────────
  const canUnlockWithPoints = (cat) =>
    cat.lock.type === "points" && points >= cat.lock.required && !unlocked[cat.id];

  const doPointsUnlock = (cat) => {
    setPoints(p => p - cat.lock.required);
    setUnlocked(u => ({ ...u, [cat.id]: true }));
    showToast(`"${cat.title}" unlocked! 🎉`);
    setUnlockModal(null);
  };

  const doBuyPoints = (cat, pts) => {
    setPoints(p => p + pts);
    showToast(`+${pts} pts added to your account! 💰`);
  };

  const doPayUnlock = (cat) => {
    setUnlocked(u => ({ ...u, [cat.id]: true }));
    showToast(`Payment successful! "${cat.title}" unlocked! 🎉`);
    setPayModal(null);
  };

  // ── Progress helpers ──────────────────────────────────────────────────────
  const catProgress = (cat) => {
    const total = cat.courses.length * 2; // video + quiz each count
    const done = cat.courses.reduce((acc, c) => {
      const p = progress[c.id];
      return acc + (p.videoWatched ? 1 : 0) + (p.passed ? 1 : 0);
    }, 0);
    return pct(done, total);
  };

  const totalEarned = () =>
    Object.entries(progress).reduce((acc, [id, p]) => {
      const course = CURRICULUM.flatMap(c => c.courses).find(c => c.id === id);
      if (!course) return acc;
      let pts = 0;
      if (p.videoWatched) pts += Math.round(course.pts * 0.4);
      if (p.passed) pts += Math.round(course.pts * 0.6);
      return acc + pts;
    }, 0);

  // ── Navigation ────────────────────────────────────────────────────────────
  const openCategory = (cat) => {
    if (!unlocked[cat.id]) {
      setUnlockModal(cat);
      return;
    }
    setActiveCat(cat);
    setView("detail");
  };

  const openLesson = (cat, course) => {
    setActiveCat(cat);
    setActiveCourse(course);
    setView("lesson");
  };

  const goBack = () => {
    if (view === "lesson") { setView("detail"); setActiveCourse(null); }
    else { setView("categories"); setActiveCat(null); }
  };

  // filtered categories
  const filtered = search.trim()
    ? CURRICULUM.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        c.courses.some(lc => lc.title.toLowerCase().includes(search.toLowerCase()))
      )
    : CURRICULUM;

  return (
    <div className="learn-page" style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>
      <style>{STYLES}</style>
      <div style={{ padding: "16px clamp(14px,2.8vw,28px) 0" }}>
        <AppNavbar />
      </div>

      <div style={{ padding: "0 clamp(14px,2.8vw,28px) 10px", display: "flex", justifyContent: "flex-end" }}>
        {view !== "categories" && (
          <button onClick={goBack} style={{
            background: C.tealLight, border: `1px solid ${C.border}`,
            color: C.teal, borderRadius: 8, padding: "6px 14px",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            ← Back
          </button>
        )}
      </div>

      {/* ── VIEWS ───────────────────────────────────────────── */}
      {view === "categories" && (
        <CategoriesView
          categories={filtered}
          search={search}
          setSearch={setSearch}
          unlocked={unlocked}
          progress={progress}
          points={points}
          catProgress={catProgress}
          onOpen={openCategory}
          onUnlockPoints={cat => setUnlockModal(cat)}
          onUnlockPay={cat => setPayModal(cat)}
          canUnlockWithPoints={canUnlockWithPoints}
        />
      )}

      {view === "detail" && activeCat && (
        <CategoryDetailView
          cat={unlocked[activeCat.id]
            ? CURRICULUM.find(c => c.id === activeCat.id) || activeCat
            : activeCat}
          progress={progress}
          unlocked={unlocked[activeCat.id]}
          onLesson={openLesson}
          catProgress={catProgress}
        />
      )}

      {view === "lesson" && activeCat && activeCourse && (
        <LessonView
          cat={CURRICULUM.find(c => c.id === activeCat.id) || activeCat}
          course={activeCourse}
          prog={progress[activeCourse.id]}
          allCourses={CURRICULUM.find(c => c.id === activeCat.id)?.courses || []}
          onVideoComplete={() => {
            const cid = activeCourse.id;
            const cat = CURRICULUM.find(c => c.id === activeCat.id);
            const course = cat?.courses.find(c => c.id === cid);
            if (!progress[cid].videoWatched && course) {
              setProgress(p => ({ ...p, [cid]: { ...p[cid], videoWatched: true } }));
              showToast("Video marked complete ✅");
            }
          }}
          onQuizPass={async (score) => {
            const cid = activeCourse.id;
            const cat = CURRICULUM.find(c => c.id === activeCat.id);
            const course = cat?.courses.find(c => c.id === cid);
            if (!progress[cid].passed && course) {
              const earn = Math.round(course.pts * 0.6);
              setProgress(p => ({ ...p, [cid]: { ...p[cid], quizScore: score, passed: true } }));
              setPoints(pt => pt + earn);
              showToast(`Quiz passed! +${earn} pts earned! 🏆`);
              if (userId) {
                try {
                  const res = await awardPoints(userId, "quiz_completed", {
                    points_override: earn,
                    metadata: { course_id: cid, category_id: cat?.id || "", score },
                  });
                  if (typeof res?.total_points === "number") {
                    setPoints(res.total_points);
                  }
                } catch {
                  // Keep local points even if profile sync fails
                }
              }
            } else {
              setProgress(p => ({ ...p, [cid]: { ...p[cid], quizScore: score } }));
            }
          }}
          onQuizFail={(score) => {
            const cid = activeCourse.id;
            setProgress(p => ({ ...p, [cid]: { ...p[cid], quizScore: score } }));
            showToast(`Score: ${score}% — minimum required. Try again! 📚`, "warn");
          }}
          onNavigate={course => { setActiveCourse(course); }}
          showToast={showToast}
        />
      )}

      {/* ── MODALS ────────────────────────────────────────────── */}
      {unlockModal && (
        <PointsUnlockModal
          cat={unlockModal}
          points={points}
          canUnlock={canUnlockWithPoints(unlockModal)}
          onUnlock={() => doPointsUnlock(unlockModal)}
          onBuyPoints={(pts) => { doBuyPoints(unlockModal, pts); }}
          onPayInstead={() => { setUnlockModal(null); setPayModal(unlockModal); }}
          onClose={() => setUnlockModal(null)}
        />
      )}

      {payModal && (
        <PayModal
          cat={payModal}
          onPay={() => doPayUnlock(payModal)}
          onClose={() => setPayModal(null)}
        />
      )}

      {/* ── TOAST ────────────────────────────────────────────── */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function CategoriesView({ categories, search, setSearch, unlocked, progress, points, catProgress, onOpen, onUnlockPoints, onUnlockPay, canUnlockWithPoints }) {
  const totalCourses  = CURRICULUM.reduce((a, c) => a + c.courses.length, 0);
  const totalPts      = CURRICULUM.reduce((a, c) => a + c.totalPts, 0);
  const completedLessons = CURRICULUM.flatMap(c => c.courses).filter(c => progress[c.id]?.passed).length;
  const unlockedCount = Object.values(unlocked).filter(Boolean).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(22px,4vw,34px) clamp(16px,3vw,24px) 64px" }}>

      {/* ── Hero ── */}
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 36, animationDelay: "0ms" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: C.tealLight, border: `1px solid ${C.tealMid}`,
          borderRadius: 99, padding: "5px 16px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 12 }}>✦</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: 2, textTransform: "uppercase" }}>
            FinSight Learning Hub
          </span>
        </div>
        <h1 style={{
          margin: "0 0 12px", fontSize: "clamp(24px,3.5vw,40px)",
          fontWeight: 800, color: C.navy, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif", letterSpacing: -0.5, lineHeight: 1.2,
        }}>
          Master Your <em style={{ color: C.teal, fontStyle: "normal" }}>Financial Life</em>
        </h1>
        <p style={{ color: C.slate, fontSize: 15, maxWidth: 620, margin: "0 auto", lineHeight: 1.72 }}>
          India-focused financial education — from reading bank statements to building a retirement corpus.
          Earn points, unlock courses, and transform your financial future.
        </p>
      </div>

      {/* ── Stats Bar ── */}
      <div className="fade-up" style={{
        animationDelay: "60ms",
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 28,
      }}>
        {[
          { icon: "📚", val: `${unlockedCount} / ${CURRICULUM.length}`, label: "Categories Unlocked" },
          { icon: "✅", val: `${completedLessons} / ${totalCourses}`, label: "Lessons Completed" },
          { icon: "⭐", val: `${points.toLocaleString()} pts`, label: "FinPoints Earned" },
          { icon: "🏆", val: `${totalPts.toLocaleString()} pts`, label: "Total Available" },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 1px 6px rgba(42,157,106,0.06)",
          }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{s.val}</div>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="fade-up" style={{ animationDelay: "100ms", marginBottom: 28, display: "flex", justifyContent: "center" }}>
        <div style={{
          display: "flex", background: C.bgCard,
          border: `1.5px solid ${C.border}`, borderRadius: 12,
          boxShadow: "0 2px 12px rgba(11,110,110,0.06)", overflow: "hidden",
          width: "100%",
          maxWidth: 700,
          margin: "0 auto",
        }}>
          <span style={{ padding: "0 14px", display: "flex", alignItems: "center", color: C.muted, fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search categories, courses, topics…"
            style={{
              flex: 1, border: "none", outline: "none", fontSize: 14,
              color: C.navy, background: "transparent", fontFamily: "inherit", padding: "13px 0",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              background: "none", border: "none", cursor: "pointer", padding: "0 14px", color: C.muted, fontSize: 16,
            }}>✕</button>
          )}
        </div>
      </div>

      {/* ── Category List – 3‑column grid ── */}
      <div style={{ marginBottom: 36 }}>
        {/* Unlocked section */}
        {categories.filter(c => unlocked[c.id]).length > 0 && (
          <>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: 2, textTransform: "uppercase" }}>
              🔓 Your Courses
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: 24 }}>
              {categories.filter(c => unlocked[c.id]).map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  index={i}
                  isUnlocked={true}
                  cpct={catProgress(cat)}
                  completedCount={cat.courses.filter(c => progress[c.id]?.passed).length}
                  points={points}
                  canUnlockWithPoints={canUnlockWithPoints(cat)}
                  onOpen={() => onOpen(cat)}
                />
              ))}
            </div>
          </>
        )}

        {/* Locked section */}
        {categories.filter(c => !unlocked[c.id]).length > 0 && (
          <>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>
              🔒 Locked Categories
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {categories.filter(c => !unlocked[c.id]).map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  index={i + categories.filter(c => unlocked[c.id]).length}
                  isUnlocked={false}
                  cpct={catProgress(cat)}
                  completedCount={cat.courses.filter(c => progress[c.id]?.passed).length}
                  points={points}
                  canUnlockWithPoints={canUnlockWithPoints(cat)}
                  onOpen={() => onOpen(cat)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Progress Legend ── */}
      <div className="fade-up" style={{
        animationDelay: "300ms", marginTop: 36,
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: "20px 24px",
      }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.navy }}>🗺️ Your Unlock Roadmap</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CURRICULUM.filter(c => !unlocked[c.id]).map(cat => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{cat.title}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {`${Math.min(points, cat.lock.required).toLocaleString()} / ${cat.lock.required.toLocaleString()} pts`}
                  </span>
                </div>
                  {cat.lock.type === "points" && (
                  <Bar
                    value={pct(Math.min(points, cat.lock.required), cat.lock.required)}
                    color={points >= cat.lock.required ? C.green : C.teal}
                    height={5}
                  />
                )}
              </div>
                  <div style={{ height: 6 }} />
            </div>
          ))}
          {CURRICULUM.every(c => unlocked[c.id]) && (
            <p style={{ color: C.green, fontWeight: 700, fontSize: 14, margin: 0 }}>
              🎉 All categories unlocked! You're on fire!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORY CARD (Compact, refined) ─────────────────────────────────────────
function CategoryCard({ cat, index, isUnlocked, cpct, completedCount, points, canUnlockWithPoints, onOpen }) {
  const [hov, setHov] = useState(false);
  const delay = `${index * 45}ms`;
  const ptsNeeded = cat.lock.type === "points" && !isUnlocked ? cat.lock.required - points : 0;
  const progressPct = cat.lock.type === "points" && !isUnlocked
    ? pct(Math.min(points, cat.lock.required), cat.lock.required)
    : isUnlocked ? cpct : 0;

  const statusColor = isUnlocked
    ? cpct === 100 ? C.green : cat.color
    : canUnlockWithPoints ? C.green : C.amber;

  const statusBg = isUnlocked
    ? cpct === 100 ? C.greenLight : `${cat.color}0D`
    : canUnlockWithPoints ? C.greenLight : C.goldLight;

  return (
    <div
      className="fade-up"
      style={{ animationDelay: delay }}
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        background: hov ? (isUnlocked ? `${cat.color}08` : C.bgCard) : C.bgCard,
        border: `1.5px solid ${hov ? cat.color + "50" : isUnlocked ? C.border : C.borderSoft}`,
        borderRadius: 12,
        padding: "12px 14px",
        cursor: "pointer",
        boxShadow: hov ? `0 6px 16px ${cat.color}18` : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        height: "auto",
      }}>
        {/* Top row with icon and title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: isUnlocked ? `${cat.color}18` : C.bg,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            border: `1px solid ${isUnlocked ? cat.color + "30" : C.borderSoft}`,
            flexShrink: 0,
          }}>
            {isUnlocked ? cat.icon : "🔒"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 14, fontWeight: 700, color: isUnlocked ? C.navy : C.slate,
                fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{cat.title}</span>
              <LevelChip level={cat.level} />
            </div>
            <div style={{ fontSize: 11, color: C.muted, display: "flex", gap: 8, marginTop: 2 }}>
              <span>📖 {cat.courses.length} lessons</span>
              {isUnlocked && completedCount > 0 && <span>✅ {completedCount}</span>}
            </div>
          </div>
        </div>

        {/* Progress bar and status */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.muted, marginBottom: 4 }}>
            <span>
              {isUnlocked
                ? cpct === 100 ? "Completed" : cpct > 0 ? `${cpct}%` : "Not started"
                : canUnlockWithPoints ? "Ready to unlock" : `${Math.min(points, cat.lock.required).toLocaleString()} / ${cat.lock.required.toLocaleString()} pts`}
            </span>
            <span style={{ fontWeight: 600, color: isUnlocked ? (cpct === 100 ? C.green : cat.color) : canUnlockWithPoints ? C.green : C.teal }}>
              {progressPct}%
            </span>
          </div>
          <Bar value={progressPct} color={isUnlocked ? (cpct === 100 ? C.green : cat.color) : canUnlockWithPoints ? C.green : C.teal} height={4} />
        </div>

        {/* Points badge and action hint */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <PtsBadge pts={cat.totalPts} />
          {isUnlocked ? (
            <span style={{ fontSize: 11, color: cat.color, fontWeight: 600 }}>
              {cpct === 100 ? "✓ Done" : "Start →"}
            </span>
          ) : canUnlockWithPoints ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>🔓 Unlock</span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: C.amber }}>+{ptsNeeded.toLocaleString()} pts</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function CategoryDetailView({ cat, progress, unlocked, onLesson, catProgress }) {
  const cpct   = catProgress(cat);
  const done   = cat.courses.filter(c => progress[c.id]?.passed).length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 60px" }}>
      {/* Hero */}
      <div className="fade-up" style={{ borderRadius: 18, overflow: "hidden", marginBottom: 24, animationDelay: "0ms" }}>
        <div style={{ height: 200, background: cat.gradient, position: "relative" }}>
          <CatIllus gradient={cat.gradient} icon={cat.icon} locked={false} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)",
            padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "flex-end",
          }}>
            <LevelChip level={cat.level} />
            <h1 style={{ margin: "8px 0 4px", color: "white", fontSize: 26, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>
              {cat.title}
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{cat.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="fade-up" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
        gap: 12, marginBottom: 24, animationDelay: "60ms",
      }}>
        {[
          { icon: "📖", val: cat.courses.length, label: "Total Lessons" },
          { icon: "✅", val: `${done} / ${cat.courses.length}`, label: "Completed" },
          { icon: "⭐", val: `${cat.totalPts} pts`, label: "Earn in Total" },
          { icon: "📊", val: `${cpct}%`, label: "Progress" },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{s.val}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="fade-up" style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 13, padding: "16px 20px", marginBottom: 24, animationDelay: "100ms",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>Category Progress</span>
          <span style={{ color: cpct === 100 ? C.green : cat.color, fontWeight: 700, fontSize: 13 }}>{cpct}%</span>
        </div>
        <Bar value={cpct} color={cpct === 100 ? C.green : cat.color} height={8} />
      </div>

      {/* Lessons */}
      <h2 className="fade-up" style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: C.navy, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif", animationDelay: "130ms" }}>
        Course Lessons
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cat.courses.map((course, i) => {
          const prog = progress[course.id];
          return (
            <LessonListItem
              key={course.id}
              course={course}
              index={i}
              prog={prog}
              catColor={cat.color}
              onOpen={() => onLesson(cat, course)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── LESSON LIST ITEM ──────────────────────────────────────────────────────────
function LessonListItem({ course, index, prog, catColor, onOpen }) {
  const [hov, setHov] = useState(false);
  const statusIcon = prog.passed ? "✅" : prog.videoWatched ? "▶️" : `${index + 1}`;
  const statusColor = prog.passed ? C.green : prog.videoWatched ? C.amber : catColor;

  return (
    <div
      className="slide-in"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        background: prog.passed ? C.greenLight : C.bgCard,
        border: `1.5px solid ${hov ? catColor + "60" : prog.passed ? C.green + "40" : C.border}`,
        borderRadius: 13, padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer",
        boxShadow: hov ? `0 6px 24px ${catColor}15` : "none",
        transform: hov ? "translateX(4px)" : "translateX(0)",
        transition: "all 0.22s ease",
      }}>
        {/* Status circle */}
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: prog.passed ? C.green : prog.videoWatched ? `${C.amber}20` : `${catColor}15`,
          border: `2px solid ${statusColor}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 13, color: statusColor,
        }}>
          {statusIcon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{course.title}</span>
            {prog.passed && (
              <span style={{
                background: C.greenLight, color: C.green,
                fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 99,
              }}>PASSED</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: C.muted }}>🎥 Video · {course.duration}</span>
            <span style={{ fontSize: 12, color: C.muted }}>❓ Quiz · {course.quiz.length} questions</span>
            <span style={{ fontSize: 12, color: C.muted }}>📊 Min {course.minScore}% to pass</span>
          </div>
          {/* Mini progress */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{
              height: 4, flex: 1, borderRadius: 99, overflow: "hidden",
              background: C.borderSoft,
            }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: prog.videoWatched ? "100%" : "0%",
                background: catColor, transition: "width 0.8s ease",
              }} />
            </div>
            <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>Video</span>
            <div style={{
              height: 4, flex: 1, borderRadius: 99, overflow: "hidden",
              background: C.borderSoft,
            }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: prog.passed ? "100%" : prog.quizScore != null ? "50%" : "0%",
                background: prog.passed ? C.green : catColor, transition: "width 0.8s ease",
              }} />
            </div>
            <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>Quiz</span>
          </div>
        </div>

        {/* Points + arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <PtsBadge pts={course.pts} />
          <div style={{
            color: hov ? catColor : C.muted, fontSize: 18,
            transform: hov ? "translateX(3px)" : "translateX(0)",
            transition: "all 0.2s",
          }}>›</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON VIEW (Video + Quiz)
// ═══════════════════════════════════════════════════════════════════════════════
function LessonView({ cat, course, prog, allCourses, onVideoComplete, onQuizPass, onQuizFail, onNavigate, showToast }) {
  const [tab, setTab]           = useState("video");  // video | quiz
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(prog.videoWatched ? 100 : 0);
  const [videoInterval, setVideoInterval] = useState(null);
  const [quizStarted, setQuizStarted]   = useState(false);
  const [qIdx, setQIdx]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null); // { score, passed }
  const [revealAns, setRevealAns] = useState(false);

  const currentIdx = allCourses.findIndex(c => c.id === course.id);
  const nextCourse = allCourses[currentIdx + 1];
  const prevCourse = allCourses[currentIdx - 1];

  // Simulate video playback
  const handlePlay = () => {
    if (videoProgress >= 100) return;
    setVideoPlaying(true);
    const iv = setInterval(() => {
      setVideoProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setVideoPlaying(false);
          if (!prog.videoWatched) onVideoComplete();
          return 100;
        }
        return p + 1;
      });
    }, 80);
    setVideoInterval(iv);
  };

  const handlePause = () => {
    setVideoPlaying(false);
    if (videoInterval) clearInterval(videoInterval);
  };

  const handleVideoComplete = () => {
    handlePause();
    setVideoProgress(100);
    if (!prog.videoWatched) onVideoComplete();
  };

  // Quiz logic
  const handleAnswer = (qi, opt) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qi]: opt }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length < course.quiz.length) {
      showToast("Please answer all questions first!", "warn");
      return;
    }
    let correct = 0;
    course.quiz.forEach((q, i) => { if (answers[i] === q.ans) correct++; });
    const score = Math.round((correct / course.quiz.length) * 100);
    const passed = score >= course.minScore;
    setQuizResult({ score, correct, total: course.quiz.length, passed });
    setRevealAns(true);
    setSubmitted(true);
    if (passed) onQuizPass(score);
    else onQuizFail(score);
  };

  const resetQuiz = () => {
    setAnswers({}); setSubmitted(false);
    setQuizResult(null); setRevealAns(false);
    setQIdx(0); setQuizStarted(false);
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 24px 60px" }}>

      {/* Lesson header */}
      <div className="fade-up" style={{ marginBottom: 20, animationDelay: "0ms" }}>
        <div style={{
          background: cat.gradient, borderRadius: 14, padding: "20px 24px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <LevelChip level={cat.level} />
            <span style={{
              background: "rgba(255,255,255,0.15)", color: "white",
              fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, letterSpacing: 0.5,
            }}>{cat.title}</span>
            <span style={{
              background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)",
              fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
            }}>Lesson {currentIdx + 1} of {allCourses.length}</span>
          </div>
          <h1 style={{ margin: "0 0 6px", color: "white", fontSize: 20, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif", lineHeight: 1.3 }}>
            {course.title}
          </h1>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>⏱ {course.duration}</span>
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>❓ {course.quiz.length} questions</span>
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>📊 Pass at {course.minScore}%</span>
            <PtsBadge pts={course.pts} />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="fade-up" style={{
        animationDelay: "60ms",
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "12px 18px", marginBottom: 20,
        display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: prog.videoWatched ? C.green : C.borderSoft,
            border: `2px solid ${prog.videoWatched ? C.green : C.faint}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
          }}>{prog.videoWatched ? "✓" : "1"}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: prog.videoWatched ? C.green : C.muted }}>
            Video {prog.videoWatched ? "Watched ✅" : "Not started"}
          </span>
        </div>
        <div style={{ color: C.faint, fontSize: 16 }}>→</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: prog.passed ? C.green : prog.quizScore != null ? C.amber : C.borderSoft,
            border: `2px solid ${prog.passed ? C.green : prog.quizScore != null ? C.amber : C.faint}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white",
          }}>
            {prog.passed ? "✓" : prog.quizScore != null ? `${prog.quizScore}%` : "2"}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: prog.passed ? C.green : prog.quizScore != null ? C.amber : C.muted }}>
            Quiz {prog.passed ? `Passed (${prog.quizScore}%) ✅` : prog.quizScore != null ? `Attempted (${prog.quizScore}%)` : "Not attempted"}
          </span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <PtsBadge pts={`${prog.videoWatched ? Math.round(course.pts * 0.4) : 0} + ${prog.passed ? Math.round(course.pts * 0.6) : 0} / ${course.pts}`} />
        </div>
      </div>

      {/* Tabs */}
      <div className="fade-up" style={{
        animationDelay: "80ms",
        display: "flex", gap: 0, marginBottom: 20,
        background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 11, padding: 4,
        width: "fit-content",
      }}>
        {["video", "quiz"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 22px", borderRadius: 8, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 13, fontFamily: "inherit", transition: "all 0.2s",
            background: tab === t ? cat.color : "transparent",
            color: tab === t ? "white" : C.muted,
          }}>
            {t === "video" ? "🎥 Video Lesson" : "❓ Quiz"}
            {t === "quiz" && prog.passed && " ✅"}
          </button>
        ))}
      </div>

      {/* VIDEO TAB */}
      {tab === "video" && (
        <div className="fade-in">
          {/* Video player */}
          <div style={{
            background: C.navy, borderRadius: 14, overflow: "hidden", marginBottom: 18,
            boxShadow: "0 8px 32px rgba(13,31,45,0.2)",
          }}>
            {/* Screen */}
            <div style={{
              aspectRatio: "16/9", background: "linear-gradient(135deg,#0D1F2D,#1A3347)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 16, position: "relative", cursor: videoPlaying ? "default" : "pointer",
            }} onClick={videoPlaying ? handlePause : handlePlay}>
              {/* Big icon */}
              <div style={{ fontSize: 64, opacity: videoPlaying ? 0.4 : 0.9 }}>{course.video.thumb}</div>
              <h3 style={{
                color: "white", fontSize: 18, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif",
                margin: 0, opacity: videoPlaying ? 0.5 : 0.9, textAlign: "center", padding: "0 20px",
              }}>{course.title}</h3>

              {/* Play overlay */}
              {!videoPlaying && videoProgress < 100 && (
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: `linear-gradient(135deg,${cat.color},${C.tealDark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)", fontSize: 22,
                }}>▶</div>
              )}
              {videoPlaying && (
                <div style={{ fontSize: 40, opacity: 0.8 }}>⏸</div>
              )}
              {videoProgress >= 100 && (
                <div style={{
                  background: "rgba(22,163,74,0.9)", borderRadius: 12, padding: "8px 20px",
                  color: "white", fontWeight: 700, fontSize: 14,
                }}>✅ Video Complete!</div>
              )}

              {/* Progress overlay */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                <div style={{ background: "rgba(0,0,0,0.4)", height: 4 }}>
                  <div style={{
                    height: "100%", background: cat.color,
                    width: `${videoProgress}%`, transition: "width 0.1s linear",
                  }} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{
              padding: "12px 18px", display: "flex", alignItems: "center", gap: 14,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
              <button onClick={videoPlaying ? handlePause : handlePlay} style={{
                background: videoProgress >= 100 ? "rgba(22,163,74,0.2)" : `${cat.color}30`,
                border: "none", borderRadius: 8, padding: "7px 16px",
                color: videoProgress >= 100 ? C.green : cat.color,
                fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}>
                {videoProgress >= 100 ? "✅ Watched" : videoPlaying ? "⏸ Pause" : videoProgress > 0 ? "▶ Resume" : "▶ Play"}
              </button>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  flex: 1, height: 4, background: "rgba(255,255,255,0.1)",
                  borderRadius: 99, overflow: "hidden",
                }}>
                  <div style={{ height: "100%", width: `${videoProgress}%`, background: cat.color, transition: "width 0.1s" }} />
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                  {videoProgress}%
                </span>
              </div>
              {videoProgress < 100 && (
                <button onClick={handleVideoComplete} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.35)",
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                }}>Skip →</button>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 13, padding: "20px 24px", marginBottom: 18,
          }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>
              About This Lesson
            </h3>
            <p style={{ margin: 0, color: C.slate, fontSize: 14, lineHeight: 1.8 }}>
              {course.video.desc}
            </p>
          </div>

          {/* Points breakdown */}
          <div style={{
            background: C.goldLight, border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 13, padding: "16px 20px", marginBottom: 18,
            display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center",
          }}>
            <span style={{ fontSize: 20 }}>⭐</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 6 }}>Points Breakdown for this lesson</div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: C.slate }}>
                  🎥 Watch video: <strong style={{ color: C.gold }}>+{Math.round(course.pts * 0.4)} pts</strong>
                  {prog.videoWatched ? " ✅" : ""}
                </span>
                <span style={{ fontSize: 12, color: C.slate }}>
                  ✅ Pass quiz: <strong style={{ color: C.gold }}>+{Math.round(course.pts * 0.6)} pts</strong>
                  {prog.passed ? " ✅" : ""}
                </span>
                <span style={{ fontSize: 12, color: C.slate }}>
                  Total: <strong style={{ color: C.gold }}>{course.pts} pts</strong>
                </span>
              </div>
            </div>
          </div>

          {/* CTA to quiz */}
          {prog.videoWatched && !prog.passed && (
            <button onClick={() => setTab("quiz")} style={{
              width: "100%", padding: "13px", borderRadius: 11,
              background: `linear-gradient(135deg,${cat.color},${C.tealDark})`,
              color: "white", border: "none", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Take the Quiz to earn {Math.round(course.pts * 0.6)} pts →
            </button>
          )}
        </div>
      )}

      {/* QUIZ TAB */}
      {tab === "quiz" && (
        <div className="fade-in">
          {!quizStarted && !prog.passed ? (
            <QuizIntro
              course={course}
              videoWatched={prog.videoWatched}
              catColor={cat.color}
              onStart={() => setQuizStarted(true)}
              previousScore={prog.quizScore}
            />
          ) : (
            <QuizPlayer
              course={course}
              answers={answers}
              submitted={submitted}
              revealAns={revealAns}
              quizResult={quizResult}
              catColor={cat.color}
              alreadyPassed={prog.passed}
              previousScore={prog.quizScore}
              onAnswer={handleAnswer}
              onSubmit={handleSubmitQuiz}
              onReset={resetQuiz}
              onNext={nextCourse ? () => { onNavigate(nextCourse); } : null}
            />
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="fade-up" style={{
        animationDelay: "200ms",
        marginTop: 24, display: "flex", justifyContent: "space-between", gap: 12,
      }}>
        {prevCourse ? (
          <button onClick={() => onNavigate(prevCourse)} style={{
            flex: 1, padding: "11px", borderRadius: 10,
            background: "none", border: `1.5px solid ${C.border}`,
            color: C.slate, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.color = cat.color; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.slate; }}
          >← {prevCourse.title}</button>
        ) : <div style={{ flex: 1 }} />}

        {nextCourse && (
          <button onClick={() => onNavigate(nextCourse)} style={{
            flex: 1, padding: "11px", borderRadius: 10,
            background: `linear-gradient(135deg,${cat.color},${C.tealDark})`,
            color: "white", border: "none",
            fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>
            {nextCourse.title} →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── QUIZ INTRO ────────────────────────────────────────────────────────────────
function QuizIntro({ course, videoWatched, catColor, onStart, previousScore }) {
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "32px 28px", textAlign: "center",
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20, color: C.navy, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>
        {course.title} — Quiz
      </h2>
      <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 20px" }}>
        {course.quiz.length} multiple choice questions. Score at least <strong>{course.minScore}%</strong> to pass
        and earn <strong style={{ color: C.gold }}>+{Math.round(course.pts * 0.6)} pts</strong>.
      </p>

      {!videoWatched && (
        <div style={{
          background: "#FFF7ED", border: `1px solid ${C.amber}50`,
          borderRadius: 10, padding: "10px 16px", marginBottom: 20,
          color: C.amber, fontSize: 13, fontWeight: 600,
        }}>
          ⚠️ Watch the video first to fully prepare for the quiz!
        </div>
      )}

      {previousScore != null && (
        <div style={{
          background: C.tealLight, border: `1px solid ${C.teal}30`,
          borderRadius: 10, padding: "10px 16px", marginBottom: 20,
          color: C.slate, fontSize: 13,
        }}>
          Previous attempt: <strong style={{ color: previousScore >= course.minScore ? C.green : C.red }}>
            {previousScore}%
          </strong> — {previousScore >= course.minScore ? "Passed ✅" : "Retry below"}
        </div>
      )}

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { icon: "❓", val: `${course.quiz.length}`, label: "Questions" },
          { icon: "📊", val: `${course.minScore}%`, label: "Min to Pass" },
          { icon: "⭐", val: `+${Math.round(course.pts * 0.6)}`, label: "Points" },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.bg, borderRadius: 10, padding: "12px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, color: C.navy, fontSize: 16 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        background: `linear-gradient(135deg,${catColor},${C.tealDark})`,
        color: "white", border: "none", padding: "12px 36px", borderRadius: 11,
        fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
      }}>
        {previousScore != null ? "Retry Quiz 🔄" : "Start Quiz →"}
      </button>
    </div>
  );
}

// ─── QUIZ PLAYER ──────────────────────────────────────────────────────────────
function QuizPlayer({ course, answers, submitted, revealAns, quizResult, catColor, alreadyPassed, previousScore, onAnswer, onSubmit, onReset, onNext }) {
  const allAnswered = Object.keys(answers).length === course.quiz.length;

  if (alreadyPassed && !quizResult) {
    return (
      <div style={{
        background: C.greenLight, border: `1.5px solid ${C.green}40`,
        borderRadius: 14, padding: "28px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <h2 style={{ margin: "0 0 6px", color: C.green, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>Already Passed!</h2>
        <p style={{ color: C.slate, fontSize: 14 }}>
          You scored <strong style={{ color: C.green }}>{previousScore}%</strong> on this quiz.
        </p>
        <button onClick={onReset} style={{
          marginTop: 16, background: "none", border: `1.5px solid ${C.green}`,
          color: C.green, padding: "9px 22px", borderRadius: 9,
          fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}>Review Questions</button>
      </div>
    );
  }

  if (quizResult) {
    return (
      <div className="pop-in" style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: "28px",
      }}>
        {/* Result header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>
            {quizResult.passed ? "🏆" : quizResult.score >= course.minScore - 10 ? "💪" : "📚"}
          </div>
          <h2 style={{
            margin: "0 0 6px", fontSize: 22,
            color: quizResult.passed ? C.green : C.red,
            fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif",
          }}>
            {quizResult.passed ? "Quiz Passed!" : "Not Passed — Try Again"}
          </h2>
          <p style={{ color: C.slate, fontSize: 14, margin: "0 0 16px" }}>
            You scored {quizResult.correct} / {quizResult.total} correctly
          </p>
          {/* Score ring */}
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 80, height: 80, borderRadius: "50%",
            border: `5px solid ${quizResult.passed ? C.green : C.red}`,
            background: quizResult.passed ? C.greenLight : C.redLight,
          }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: quizResult.passed ? C.green : C.red }}>
              {quizResult.score}%
            </span>
          </div>
          {quizResult.passed && (
            <div style={{
              marginTop: 14, background: C.goldLight, border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 12, padding: "10px 20px", display: "inline-block",
            }}>
              <span style={{ fontWeight: 800, fontSize: 20, color: C.gold }}>
                +{Math.round(course.pts * 0.6)} pts
              </span>
              <span style={{ color: C.gold, fontWeight: 600, marginLeft: 6, fontSize: 13 }}>earned!</span>
            </div>
          )}
          <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>
            Minimum required: {course.minScore}%
          </p>
        </div>

        {/* Answer review */}
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.navy }}>Answer Review</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {course.quiz.map((q, i) => {
            const chosen = answers[i];
            const correct = q.ans;
            const isRight = chosen === correct;
            return (
              <div key={i} style={{
                background: isRight ? C.greenLight : C.redLight,
                border: `1px solid ${isRight ? C.green : C.red}30`,
                borderRadius: 10, padding: "12px 16px",
              }}>
                <div style={{ fontWeight: 600, color: C.navy, fontSize: 13, marginBottom: 6 }}>
                  {i + 1}. {q.q}
                </div>
                <div style={{ fontSize: 12, color: isRight ? C.green : C.red, fontWeight: 700 }}>
                  {isRight ? "✅ Correct: " : "❌ You chose: "}{q.opts[chosen ?? 0]}
                </div>
                {!isRight && (
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>
                    ✅ Correct answer: {q.opts[correct]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {!quizResult.passed && (
            <button onClick={onReset} style={{
              flex: 1, padding: "11px", borderRadius: 10,
              background: `linear-gradient(135deg,${catColor},${C.tealDark})`,
              color: "white", border: "none", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}>Retry Quiz 🔄</button>
          )}
          {quizResult.passed && onNext && (
            <button onClick={onNext} style={{
              flex: 1, padding: "11px", borderRadius: 10,
              background: `linear-gradient(135deg,${catColor},${C.tealDark})`,
              color: "white", border: "none", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}>Next Lesson →</button>
          )}
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Quiz progress */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "14px 18px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 6 }}>
          <span>{Object.keys(answers).length} of {course.quiz.length} answered</span>
          <span>Minimum to pass: {course.minScore}%</span>
        </div>
        <Bar value={pct(Object.keys(answers).length, course.quiz.length)} color={catColor} height={5} />
      </div>

      {/* Questions */}
      {course.quiz.map((q, qi) => (
        <div key={qi} style={{
          background: C.bgCard, border: `1.5px solid ${answers[qi] !== undefined ? catColor + "50" : C.border}`,
          borderRadius: 13, padding: "18px 20px",
        }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
            <span style={{ color: catColor, fontWeight: 800 }}>Q{qi + 1}.</span> {q.q}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.opts.map((opt, oi) => (
              <button key={oi} onClick={() => onAnswer(qi, oi)} style={{
                textAlign: "left", padding: "10px 14px", borderRadius: 9,
                border: `1.5px solid ${answers[qi] === oi ? catColor : C.border}`,
                background: answers[qi] === oi ? `${catColor}12` : C.bgCard,
                color: answers[qi] === oi ? catColor : C.navy,
                fontWeight: answers[qi] === oi ? 700 : 500,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: answers[qi] === oi ? catColor : C.bg,
                  color: answers[qi] === oi ? "white" : C.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                }}>{String.fromCharCode(65 + oi)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Submit */}
      <button onClick={onSubmit} disabled={!allAnswered} style={{
        width: "100%", padding: "13px", borderRadius: 11,
        background: allAnswered ? `linear-gradient(135deg,${catColor},${C.tealDark})` : C.borderSoft,
        color: allAnswered ? "white" : C.muted,
        border: "none", fontWeight: 700, fontSize: 14,
        cursor: allAnswered ? "pointer" : "not-allowed", fontFamily: "inherit",
        transition: "all 0.2s",
      }}>
        {allAnswered ? "Submit Quiz →" : `Answer all ${course.quiz.length} questions to submit`}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════════
function PointsUnlockModal({ cat, points, canUnlock, onUnlock, onBuyPoints, onClose }) {
  const [buyStep, setBuyStep] = useState(null); // null | "confirm" | "paying" | "done"
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const needed = cat.lock.required - points;
  const bp = cat.lock.buyPoints || { price: 99, pts: 500, label: `Buy 500 pts for ₹99` };

  const handleBuyPay = () => {
    setBuyStep("paying");
    setTimeout(() => {
      onBuyPoints(bp.pts);
      setBuyStep("done");
    }, 1600);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(13,31,45,0.72)",
      backdropFilter: "blur(7px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pop-in" style={{
        background: C.bgCard, borderRadius: 20, padding: "28px 32px",
        maxWidth: 460, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
      }}>
        {buyStep === "done" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
            <h2 style={{ margin: "0 0 8px", color: C.green, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>Points Added!</h2>
            <p style={{ color: C.slate, fontSize: 14 }}>+{bp.pts} pts have been added to your account.</p>
            {points + bp.pts >= cat.lock.required ? (
              <button onClick={() => { onUnlock(); }} style={{
                marginTop: 16, padding: "12px 28px", borderRadius: 11,
                background: `linear-gradient(135deg,${C.green},#15803D)`,
                color: "white", border: "none", fontWeight: 800, fontSize: 15,
                cursor: "pointer", fontFamily: "inherit",
              }}>🔓 Unlock Now!</button>
            ) : (
              <button onClick={onClose} style={{
                marginTop: 16, padding: "10px 24px", borderRadius: 11,
                background: "none", border: `1px solid ${C.border}`, color: C.muted,
                fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}>Close</button>
            )}
          </div>
        ) : buyStep === "paying" ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${C.teal}`, borderTopColor: "transparent", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: C.slate, fontSize: 14 }}>Processing payment…</p>
          </div>
        ) : buyStep === "confirm" ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: C.navy, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>Buy Extra Points</h2>
              <button onClick={() => setBuyStep(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.muted }}>✕</button>
            </div>
            <div style={{ background: C.bg, borderRadius: 12, padding: "16px 18px", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: C.slate }}>Package</span>
                <span style={{ fontWeight: 700, color: C.navy }}>⭐ {bp.pts} Points</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.slate }}>Amount</span>
                <span style={{ fontWeight: 800, color: C.navy }}>₹{bp.price}</span>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, color: C.navy, fontSize: 13 }}>Payment Method</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {["upi", "card"].map(m => (
                  <button key={m} onClick={() => setMethod(m)} style={{
                    flex: 1, padding: "9px", borderRadius: 9,
                    border: `1.5px solid ${method === m ? C.indigo : C.border}`,
                    background: method === m ? C.indigoLight : C.bgCard,
                    color: method === m ? C.indigo : C.slate,
                    fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  }}>{m === "upi" ? "📱 UPI" : "💳 Card"}</button>
                ))}
              </div>
              {method === "upi" && (
                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" style={{
                  width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`,
                  borderRadius: 9, fontSize: 14, color: C.navy, fontFamily: "inherit",
                  outline: "none", background: C.bgCard,
                }} />
              )}
            </div>
            <button onClick={handleBuyPay} style={{
              width: "100%", padding: "12px", borderRadius: 11,
              background: `linear-gradient(135deg,${C.indigo},#0D6C61)`,
              color: "white", border: "none", fontWeight: 800, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}>Pay ₹{bp.price} & Get {bp.pts} Points</button>
            <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 8 }}>🔒 SSL Secured · UPI / Card / Netbanking</p>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 46, marginBottom: 10 }}>
                {canUnlock ? "🔓" : "🔒"}
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: 19, color: C.navy, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>
                {cat.title}
              </h2>
              <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>
                {canUnlock ? "You have enough points to unlock!" : `Need ${cat.lock.required.toLocaleString()} pts to unlock`}
              </p>
            </div>

            <div style={{ background: C.bg, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Your Points</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: canUnlock ? C.green : C.amber }}>
                  {points.toLocaleString()} / {cat.lock.required.toLocaleString()}
                </span>
              </div>
              <Bar value={pct(Math.min(points, cat.lock.required), cat.lock.required)} color={canUnlock ? C.green : C.teal} height={8} />
              {!canUnlock && (
                <p style={{ margin: "8px 0 0", color: C.muted, fontSize: 12 }}>
                  Still need <strong style={{ color: C.red }}>{needed.toLocaleString()} pts</strong> more
                </p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {canUnlock ? (
                <button onClick={onUnlock} style={{
                  padding: "12px", borderRadius: 11,
                  background: `linear-gradient(135deg,${C.green},#15803D)`,
                  color: "white", border: "none", fontWeight: 800, fontSize: 15,
                  cursor: "pointer", fontFamily: "inherit",
                }}>🔓 Unlock with {cat.lock.required.toLocaleString()} Points</button>
              ) : (
                <>
                  <button disabled style={{
                    padding: "11px", borderRadius: 11, background: C.borderSoft,
                    color: C.muted, border: "none", fontWeight: 700, fontSize: 13,
                    cursor: "not-allowed", fontFamily: "inherit",
                  }}>🔒 Not Enough Points Yet</button>
                  <div style={{ position: "relative", textAlign: "center", margin: "2px 0" }}>
                    <div style={{ borderTop: `1px solid ${C.border}`, position: "absolute", top: "50%", left: 0, right: 0 }} />
                    <span style={{ background: C.bgCard, position: "relative", padding: "0 12px", color: C.muted, fontSize: 11, fontWeight: 600 }}>OR</span>
                  </div>
                  <button onClick={() => setBuyStep("confirm")} style={{
                    padding: "12px", borderRadius: 11,
                    background: `linear-gradient(135deg,${C.gold},#B45309)`,
                    color: "white", border: "none", fontWeight: 800, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>⭐ {bp.label}</button>
                </>
              )}
              <button onClick={onClose} style={{
                padding: "9px", borderRadius: 11, background: "none",
                border: `1px solid ${C.border}`, color: C.muted,
                fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PayModal({ cat, onPay, onClose }) {
  const [step, setStep] = useState("info"); // info | payment | success
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");

  const handlePay = () => {
    setStep("success");
    setTimeout(() => { onPay(); }, 1800);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(13,31,45,0.72)",
      backdropFilter: "blur(7px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pop-in" style={{
        background: C.bgCard, borderRadius: 20,
        maxWidth: 460, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: cat.gradient, padding: "20px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>
                UNLOCK PREMIUM
              </p>
              <h2 style={{ margin: 0, color: "white", fontSize: 18, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>{cat.title}</h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "white" }}>₹{cat.lock.price}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>one-time</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {step === "info" && (
            <>
              {/* What you get */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: C.navy }}>What you get:</h3>
                {[
                  `${cat.courses.length} in-depth video lessons`,
                  `${cat.courses.length} topic quizzes with certificates`,
                  `Up to ${cat.totalPts} pts to unlock further categories`,
                  "Lifetime access, no recurring fees",
                  "India-specific tax & financial content",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: C.slate }}>
                    <span style={{ color: C.green, flexShrink: 0 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep("payment")} style={{
                width: "100%", padding: "12px",
                background: `linear-gradient(135deg,${C.indigo},#0D6C61)`,
                color: "white", border: "none", borderRadius: 11,
                fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
              }}>
                💳 Pay ₹{cat.lock.price} →
              </button>
              <button onClick={onClose} style={{
                width: "100%", marginTop: 8, padding: "9px",
                background: "none", border: "none", color: C.muted,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}>Cancel</button>
            </>
          )}

          {step === "payment" && (
            <>
              {/* Payment method */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ margin: "0 0 12px", fontWeight: 700, color: C.navy, fontSize: 13 }}>Choose Payment Method</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["upi", "card"].map(m => (
                    <button key={m} onClick={() => setMethod(m)} style={{
                      flex: 1, padding: "10px", borderRadius: 9,
                      border: `1.5px solid ${method === m ? C.indigo : C.border}`,
                      background: method === m ? C.indigoLight : C.bgCard,
                      color: method === m ? C.indigo : C.slate,
                      fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {m === "upi" ? "📱 UPI" : "💳 Card"}
                    </button>
                  ))}
                </div>
              </div>

              {method === "upi" && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.navy, display: "block", marginBottom: 6 }}>
                    UPI ID
                  </label>
                  <input
                    value={upiId} onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    style={{
                      width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`,
                      borderRadius: 9, fontSize: 14, color: C.navy, fontFamily: "inherit",
                      outline: "none", background: C.bgCard,
                    }}
                    onFocus={e => e.target.style.borderColor = C.indigo}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              )}
              {method === "card" && (
                <div style={{ marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, "").slice(0,16))}
                    placeholder="Card number"
                    style={{
                      width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`,
                      borderRadius: 9, fontSize: 14, color: C.navy, fontFamily: "inherit",
                      outline: "none", background: C.bgCard, letterSpacing: 2,
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="MM/YY" style={{
                      flex: 1, padding: "11px 14px", border: `1.5px solid ${C.border}`,
                      borderRadius: 9, fontSize: 14, color: C.navy, fontFamily: "inherit",
                      outline: "none", background: C.bgCard,
                    }}/>
                    <input placeholder="CVV" style={{
                      width: 80, padding: "11px 14px", border: `1.5px solid ${C.border}`,
                      borderRadius: 9, fontSize: 14, color: C.navy, fontFamily: "inherit",
                      outline: "none", background: C.bgCard,
                    }}/>
                  </div>
                </div>
              )}

              <div style={{
                background: C.bg, borderRadius: 9, padding: "12px 14px",
                display: "flex", justifyContent: "space-between", marginBottom: 16,
                fontSize: 13, color: C.slate,
              }}>
                <span>Order total</span>
                <span style={{ fontWeight: 800, color: C.navy }}>₹{cat.lock.price}</span>
              </div>

              <button onClick={handlePay} style={{
                width: "100%", padding: "12px",
                background: `linear-gradient(135deg,${C.indigo},#0D6C61)`,
                color: "white", border: "none", borderRadius: 11,
                fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
              }}>
                Pay ₹{cat.lock.price} Securely
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 10 }}>
                🔒 SSL Secured · UPI / Card / Netbanking accepted
              </p>
            </>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 14, animation: "bounce 1s ease infinite" }}>🎉</div>
              <h2 style={{ margin: "0 0 6px", color: C.green, fontFamily: "'Manrope','DM Sans','Segoe UI',sans-serif" }}>Payment Successful!</h2>
              <p style={{ color: C.slate, fontSize: 14 }}>Unlocking "{cat.title}"…</p>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                border: `3px solid ${C.teal}`,
                borderTopColor: "transparent",
                margin: "16px auto 0",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const monthsUntil = (deadline, now) => {
  if (!deadline) return 0;
  const ms = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24 * 30)));
};

const sum = (arr) => arr.reduce((acc, n) => acc + n, 0);

const normalizeQuizData = (quizData = {}) => ({
  income: toNumber(quizData.income),
  stabilityScore: clamp(toNumber(quizData.stabilityScore), 0, 100),
  fixedExpenses: {
    rent: toNumber(quizData?.fixedExpenses?.rent),
    emi: toNumber(quizData?.fixedExpenses?.emi),
    other: toNumber(quizData?.fixedExpenses?.other),
  },
  behavior: {
    foodScore: clamp(toNumber(quizData?.behavior?.foodScore), 0, 100),
    impulseScore: clamp(toNumber(quizData?.behavior?.impulseScore), 0, 100),
    trackingScore: clamp(toNumber(quizData?.behavior?.trackingScore), 0, 100),
    moneyStress: clamp(toNumber(quizData?.behavior?.moneyStress), 0, 100),
  },
  riskProfile: {
    riskTolerance: clamp(toNumber(quizData?.riskProfile?.riskTolerance), 0, 100),
  },
});

const normalizeTransactions = (transactions = []) =>
  transactions
    .map((txn) => ({
      amount: Math.abs(toNumber(txn?.amount)),
      category: String(txn?.category || "uncategorized").toLowerCase().trim(),
      type: txn?.type === "credit" ? "credit" : "debit",
      date: toDate(txn?.date),
    }))
    .filter((txn) => txn.amount > 0);

const normalizeBudgets = (budgets = {}) => {
  if (Array.isArray(budgets)) {
    return budgets.reduce((acc, entry) => {
      if (!entry) return acc;
      const key = String(entry.category || entry.name || "").toLowerCase().trim();
      if (!key) return acc;
      acc[key] = toNumber(entry.allocatedAmount ?? entry.amount);
      return acc;
    }, {});
  }

  return Object.entries(budgets).reduce((acc, [rawKey, rawAmount]) => {
    const key = String(rawKey || "").toLowerCase().trim();
    if (!key) return acc;
    acc[key] = toNumber(rawAmount);
    return acc;
  }, {});
};

const normalizeGoals = (goals = []) =>
  goals.map((goal) => ({
    name: String(goal?.name || "Unnamed Goal"),
    targetAmount: Math.max(0, toNumber(goal?.targetAmount)),
    currentAmount: Math.max(0, toNumber(goal?.currentAmount)),
    deadline: toDate(goal?.deadline),
  }));

export const normalizeMongoFinanceInput = (mongoPayload = {}) => ({
  quizData: normalizeQuizData(mongoPayload.quizData),
  transactions: normalizeTransactions(mongoPayload.transactions),
  budgets: normalizeBudgets(mongoPayload.budgets),
  goals: normalizeGoals(mongoPayload.goals),
});

const buildCategorySpend = (transactions) => {
  const out = {};
  for (const txn of transactions) {
    if (txn.type !== "debit") continue;
    out[txn.category] = (out[txn.category] || 0) + txn.amount;
  }
  return out;
};

const scoreSavings = (savingsRatio) => {
  if (savingsRatio >= 0.3) return 100;
  if (savingsRatio >= 0.2) return 80;
  if (savingsRatio >= 0.1) return 60;
  if (savingsRatio >= 0) return 40;
  return 10;
};

const scoreEmi = (emiRatio) => {
  if (emiRatio <= 0.2) return 100;
  if (emiRatio <= 0.3) return 75;
  if (emiRatio <= 0.4) return 50;
  if (emiRatio <= 0.5) return 25;
  return 0;
};

const findEmergencyGoal = (goals) =>
  goals.find((goal) => goal.name.toLowerCase().includes("emergency"));

export const calculateFinancialMetrics = (normalizedInput, now = new Date()) => {
  const { quizData, transactions, budgets, goals } = normalizedInput;
  const income = quizData.income;
  const debitTotal = sum(transactions.filter((txn) => txn.type === "debit").map((txn) => txn.amount));
  const creditTotal = sum(transactions.filter((txn) => txn.type === "credit").map((txn) => txn.amount));

  const fixedExpenseTotal =
    quizData.fixedExpenses.rent + quizData.fixedExpenses.emi + quizData.fixedExpenses.other;
  const actualSavings = income > 0 ? income - debitTotal : creditTotal - debitTotal;
  const savingsRatio = income > 0 ? actualSavings / income : 0;
  const emiRatio = income > 0 ? quizData.fixedExpenses.emi / income : 0;
  const fixedExpenseRatio = income > 0 ? fixedExpenseTotal / income : 0;

  const emergencyGoal = findEmergencyGoal(goals);
  const emergencyFundTarget = emergencyGoal?.targetAmount || fixedExpenseTotal * 6;
  const emergencyFundCurrent = emergencyGoal?.currentAmount || Math.max(actualSavings, 0);
  const emergencyFundProgress =
    emergencyFundTarget > 0 ? clamp((emergencyFundCurrent / emergencyFundTarget) * 100, 0, 100) : 100;

  const goalProgressValues = goals
    .filter((goal) => goal.targetAmount > 0)
    .map((goal) => clamp((goal.currentAmount / goal.targetAmount) * 100, 0, 100));
  const goalProgressAverage = goalProgressValues.length ? sum(goalProgressValues) / goalProgressValues.length : 100;

  const categorySpend = buildCategorySpend(transactions);
  const budgetRows = Object.entries(budgets).filter(([, allocated]) => allocated > 0);
  const utilizationRows = budgetRows.map(([category, allocated]) => {
    const spent = categorySpend[category] || 0;
    return {
      category,
      allocated,
      spent,
      utilization: allocated > 0 ? spent / allocated : 0,
      overBy: Math.max(0, spent - allocated),
    };
  });

  const underBudgetCategories = utilizationRows.filter((row) => row.utilization <= 1);
  const overspendingCategories = utilizationRows.filter((row) => row.utilization > 1.1);
  const underUtilizedCategories = utilizationRows.filter((row) => row.utilization < 0.7);
  const underBudgetCategoryRatio =
    utilizationRows.length > 0 ? underBudgetCategories.length / utilizationRows.length : 1;

  const totalAllocated = sum(utilizationRows.map((row) => row.allocated));
  const totalOverspend = sum(overspendingCategories.map((row) => row.overBy));
  const overspendPressure = totalAllocated > 0 ? totalOverspend / totalAllocated : 0;
  const spendingDisciplineScore = clamp(
    underBudgetCategoryRatio * 70 + (1 - clamp(overspendPressure, 0, 1)) * 30,
    0,
    100,
  );

  const topNegativeByOverspend = [...overspendingCategories]
    .sort((a, b) => b.overBy - a.overBy)
    .map((row) => row.category);
  const fallbackHighSpend = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
    .filter((category) => !topNegativeByOverspend.includes(category));
  const topSavingsImpactCategories = [...topNegativeByOverspend, ...fallbackHighSpend].slice(0, 2);

  const goalDelayRisk = goals
    .filter((goal) => goal.targetAmount > goal.currentAmount)
    .map((goal) => {
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const monthsLeft = monthsUntil(goal.deadline, now);
      const monthlyRequired = monthsLeft > 0 ? remaining / monthsLeft : remaining;
      const atRisk = monthsLeft === 0 || monthlyRequired > Math.max(actualSavings, 0);
      return {
        name: goal.name,
        remaining,
        monthsLeft,
        monthlyRequired,
        atRisk,
      };
    });

  return {
    income,
    debitTotal,
    creditTotal,
    actualSavings,
    savingsRatio,
    emiRatio,
    fixedExpenseRatio,
    emergencyFundProgress,
    goalProgressAverage,
    underBudgetCategoryRatio,
    overspendingCategories,
    underUtilizedCategories,
    topSavingsImpactCategories,
    goalDelayRisk,
    spendingDisciplineScore,
    cashFlowStabilityScore: quizData.stabilityScore,
  };
};

const scoreBreakdownFromMetrics = (metrics) => {
  const rawScores = {
    savings: scoreSavings(metrics.savingsRatio),
    emi: scoreEmi(metrics.emiRatio),
    emergencyFund: clamp(metrics.emergencyFundProgress, 0, 100),
    goalProgress: clamp(metrics.goalProgressAverage, 0, 100),
    spendingDiscipline: clamp(metrics.spendingDisciplineScore, 0, 100),
    cashFlowStability: clamp(metrics.cashFlowStabilityScore, 0, 100),
  };

  const weights = {
    savings: 25,
    emi: 20,
    emergencyFund: 20,
    goalProgress: 15,
    spendingDiscipline: 10,
    cashFlowStability: 10,
  };

  const breakdown = Object.entries(weights).reduce((acc, [key, weight]) => {
    const score = rawScores[key];
    const weightedScore = (score / 100) * weight;
    acc[key] = {
      score: Number(score.toFixed(2)),
      weight,
      weightedScore: Number(weightedScore.toFixed(2)),
    };
    return acc;
  }, {});

  const financialScore = Math.round(sum(Object.values(breakdown).map((item) => item.weightedScore)));
  return { financialScore, scoreBreakdown: breakdown };
};

const money = (amount) => `₹${Math.round(amount).toLocaleString("en-IN")}`;
const percent = (ratio) => `${Math.round(ratio * 100)}%`;

const buildInsights = (metrics) => {
  const insights = [];
  const spendingInsights = [];
  const savingOpportunities = [];
  const recommendations = [];

  for (const row of metrics.overspendingCategories) {
    insights.push(
      `Overspending detected in ${row.category}: ${percent(row.utilization)} of budget used (${money(row.overBy)} over).`,
    );
  }

  for (const row of metrics.underUtilizedCategories) {
    insights.push(`Under-utilized budget in ${row.category}: only ${percent(row.utilization)} used.`);
  }

  if (metrics.savingsRatio < 0.2) {
    insights.push(`Savings shortfall: current savings ratio is ${percent(metrics.savingsRatio)} (target at least 20%).`);
  }

  if (metrics.emiRatio > 0.4) {
    insights.push(`High EMI warning: EMI ratio is ${percent(metrics.emiRatio)}, which is above the 40% safety limit.`);
  }

  if (metrics.emergencyFundProgress < 100) {
    insights.push(`Emergency fund is incomplete at ${Math.round(metrics.emergencyFundProgress)}% progress.`);
  }

  const riskyGoals = metrics.goalDelayRisk.filter((goal) => goal.atRisk);
  for (const goal of riskyGoals) {
    insights.push(
      `Goal delay risk for "${goal.name}": requires ${money(goal.monthlyRequired)}/month with ${goal.monthsLeft} month(s) left.`,
    );
  }

  if (metrics.topSavingsImpactCategories.length > 0) {
    spendingInsights.push(
      `Top categories reducing savings: ${metrics.topSavingsImpactCategories.join(", ")}.`,
    );
  }

  for (const row of metrics.overspendingCategories.slice(0, 3)) {
    spendingInsights.push(
      `${row.category}: overspent by ${money(row.overBy)} (${percent(row.utilization)} utilized).`,
    );
    savingOpportunities.push(`Reduce ${row.category} spend by at least ${money(row.overBy)} to return to budget.`);
  }

  for (const row of metrics.underUtilizedCategories.slice(0, 2)) {
    savingOpportunities.push(
      `Reallocate unused ${row.category} budget to savings/investments (unused ~${money(row.allocated - row.spent)}).`,
    );
  }

  if (metrics.savingsRatio < 0.2) {
    recommendations.push("Automate savings transfer right after salary credit to lock a 20% baseline.");
  }
  if (metrics.emiRatio > 0.4) {
    recommendations.push("Prioritize EMI reduction via prepayment or refinancing to reduce debt burden.");
  }
  if (metrics.emergencyFundProgress < 100) {
    recommendations.push("Build emergency fund to 6 months of fixed expenses before increasing discretionary spending.");
  }
  if (riskyGoals.length) {
    recommendations.push("Increase monthly goal allocation or extend deadlines for at-risk goals.");
  }
  if (!recommendations.length) {
    recommendations.push("Current financial behavior is healthy; continue tracking monthly and optimize toward long-term goals.");
  }

  return { insights, spendingInsights, savingOpportunities, recommendations };
};

export const generateFinancialInsights = (mongoPayload, options = {}) => {
  const now = toDate(options.now) || new Date();
  const normalized = normalizeMongoFinanceInput(mongoPayload);
  const metrics = calculateFinancialMetrics(normalized, now);
  const { financialScore, scoreBreakdown } = scoreBreakdownFromMetrics(metrics);
  const listBlocks = buildInsights(metrics);

  return {
    financialScore,
    scoreBreakdown,
    insights: listBlocks.insights,
    spendingInsights: listBlocks.spendingInsights,
    savingOpportunities: listBlocks.savingOpportunities,
    recommendations: listBlocks.recommendations,
    metrics: {
      actualSavings: metrics.actualSavings,
      savingsRatio: metrics.savingsRatio,
      emiRatio: metrics.emiRatio,
      fixedExpenseRatio: metrics.fixedExpenseRatio,
      emergencyFundProgress: metrics.emergencyFundProgress,
      goalProgressAverage: metrics.goalProgressAverage,
      underBudgetCategoryRatio: metrics.underBudgetCategoryRatio,
      topSavingsImpactCategories: metrics.topSavingsImpactCategories,
    },
  };
};

export default generateFinancialInsights;

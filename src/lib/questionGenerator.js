// QuantDrill Question Generator
// Elite quantitative training for GMAT, consulting & finance candidates

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── MENTAL MATH ─────────────────────────────────────────────────────────────

function multiplication(difficulty) {
  let a, b;
  if (difficulty === 'easy') { 
    // Round numbers, single operation
    a = pick([4, 5, 6, 8, 10, 12, 15]);
    b = pick([5, 6, 8, 10, 15, 20, 25]);
  }
  else if (difficulty === 'medium') { 
    // Less clean, more thinking
    a = rand(14, 38);
    b = rand(11, 24);
  }
  else { 
    // Ugly numbers, multi-digit
    a = rand(43, 87);
    b = rand(13, 28);
  }
  return {
    type: 'mental_math',
    subtype: 'multiplication',
    prompt: `${a} × ${b} = ?`,
    correct_answer: a * b,
    difficulty,
  };
}

function division(difficulty) {
  let b, result;
  if (difficulty === 'easy') { 
    // Round numbers, fast calculation
    b = pick([2, 4, 5, 8, 10]);
    result = rand(6, 50);
  }
  else if (difficulty === 'medium') { 
    // Less clean divisors
    b = pick([6, 7, 9, 11, 12, 13]);
    result = rand(11, 80);
  }
  else { 
    // Ugly, requires concentration
    b = pick([7, 8, 9, 11, 13, 14, 17]);
    result = rand(18, 140);
  }
  const a = b * result;
  return {
    type: 'mental_math',
    subtype: 'division',
    prompt: `${a} ÷ ${b} = ?`,
    correct_answer: result,
    difficulty,
  };
}

function approximation(difficulty) {
  const scenarios = difficulty === 'easy' ? [
    () => { const a = rand(18, 35) * 10; const b = pick([9, 11, 19, 21]); const ans = a * b; return { prompt: `Approx: ${a} × ${b} = ?`, correct_answer: ans }; },
    () => { const a = rand(100, 500); const b = pick([0.1, 0.25, 0.5]); return { prompt: `${a} × ${b} = ?`, correct_answer: Math.round(a * b) }; },
  ] : difficulty === 'medium' ? [
    () => { const a = rand(40, 80) * 10; const b = rand(40, 80) * 10; const ans = Math.round(a * b / 1000); return { prompt: `Approx (÷1000): ${a} × ${b} ≈ ?`, correct_answer: ans }; },
    () => { const n = rand(3, 9) * 100; const d = pick([3, 7, 8]); return { prompt: `${n} ÷ ${d} ≈ ? (round to nearest whole)`, correct_answer: Math.round(n / d) }; },
  ] : [
    () => { const a = rand(300, 800); const b = rand(200, 600); const ans = Math.round(a * b / 1000); return { prompt: `Estimate (÷1000): ${a} × ${b} ≈ ?`, correct_answer: ans }; },
    () => { const pct = pick([12, 17, 23, 37]); const base = rand(3, 9) * 100; return { prompt: `${pct}% of ${base} ≈ ?`, correct_answer: Math.round(base * pct / 100) }; },
  ];
  const s = pick(scenarios)();
  return { type: 'mental_math', subtype: 'estimation', difficulty, ...s };
}

// ─── PERCENTAGES & GROWTH ─────────────────────────────────────────────────────

function percentageChange(difficulty) {
  const configs = {
    easy:   { base: [100, 200, 400, 500], pct: [10, 20, 25, 50] },
    medium: { base: [145, 280, 375, 520, 890], pct: [12, 18, 35, 65] },
    hard:   { base: [237, 463, 718, 945, 1280], pct: [7, 17, 33, 58, 81] },
  };
  const cfg = configs[difficulty];
  const base = pick(cfg.base);
  const pct = pick(cfg.pct);
  const direction = pick(['increase', 'decrease']);
  const result = direction === 'increase'
    ? Math.round(base * (1 + pct / 100))
    : Math.round(base * (1 - pct / 100));
  const prompts = [
    `Revenue was $${base}M. After a ${pct}% ${direction}, what is the new revenue? ($M)`,
    `Stock traded at $${base}. It ${direction}d by ${pct}%. New price?`,
    `Headcount was ${base}. After a ${pct}% ${direction}, new headcount?`,
  ];
  return {
    type: 'percentages_growth',
    subtype: 'percentage_change',
    prompt: pick(prompts),
    correct_answer: result,
    difficulty,
  };
}

function percentageOfTotal(difficulty) {
  const configs = {
    easy:   { total: [100, 200, 500], pct: [10, 20, 25, 50] },
    medium: { total: [280, 425, 610, 870], pct: [12, 28, 38, 55] },
    hard:   { total: [375, 640, 920, 1350], pct: [13, 19, 41, 67] },
  };
  const cfg = configs[difficulty];
  const total = pick(cfg.total);
  const pct = pick(cfg.pct);
  const amount = Math.round(total * pct / 100);
  const contexts = [
    `SG&A is ${pct}% of $${total}M revenue. What is SG&A? ($M)`,
    `COGS is ${pct}% of $${total}M revenue. Gross profit? ($M, revenue minus COGS)`,
    `${pct}% of a $${total}M deal is equity. How much equity? ($M)`,
  ];
  const q = pick(contexts);
  const ans = q.includes('Gross profit') ? total - amount : amount;
  return {
    type: 'percentages_growth',
    subtype: 'percentage_of_total',
    prompt: q,
    correct_answer: ans,
    difficulty,
  };
}

function cagrIntuition(difficulty) {
  const configs = {
    easy:   { years: [1, 2], rate: [10, 20, 25, 50] },
    medium: { years: [2, 3], rate: [8, 15, 28, 35] },
    hard:   { years: [3, 4, 5], rate: [7, 14, 24, 31] },
  };
  const cfg = configs[difficulty];
  const base = pick(difficulty === 'easy' ? [100, 200, 400, 500, 800, 1000] : difficulty === 'medium' ? [120, 280, 450, 720] : [185, 320, 580, 950]);
  const rate = pick(cfg.rate);
  const years = pick(cfg.years);
  let result = base;
  for (let i = 0; i < years; i++) result = Math.round(result * (1 + rate / 100));
  const yearLabel = years === 1 ? 'year' : 'years';
  return {
    type: 'percentages_growth',
    subtype: 'growth_rate',
    prompt: `Revenue is $${base}M, growing at ${rate}% per year. Value after ${years} ${yearLabel}? ($M)`,
    correct_answer: result,
    difficulty,
  };
}

function percentOfPercent(difficulty) {
  const configs = {
    easy:   [[10, 50], [20, 50], [25, 40], [50, 20]],
    medium: [[15, 60], [20, 35], [30, 40], [25, 80], [12, 50]],
    hard:   [[17, 45], [22, 65], [35, 28], [18, 72], [42, 33]],
  };
  const [a, b] = pick(configs[difficulty]);
  const result = Math.round(a * b / 100);
  const scenarios = [
    { prompt: `${a}% of ${b}% = ? (as a percentage)`, answer: result },
    { prompt: `Revenue grows ${a}% and margin is ${b}%. What % of original revenue is the contribution?`, answer: result },
    { prompt: `${a}% of customers convert, and ${b}% of those upgrade. What % of total customers upgrade?`, answer: result },
    { prompt: `${a}% market share, ${b}% of that is premium tier. Premium as % of total market?`, answer: result },
  ];
  const s = pick(scenarios);
  return {
    type: 'percentages_growth',
    subtype: 'percent_of_percent',
    prompt: s.prompt,
    correct_answer: s.answer,
    difficulty,
  };
}

// ─── BUSINESS MATH ────────────────────────────────────────────────────────────

function profitMargin(difficulty) {
  const revenue = pick(difficulty === 'easy' ? [100, 200, 500] : difficulty === 'medium' ? [165, 340, 620, 945] : [280, 475, 750, 1250]);
  const margin_pct = pick(difficulty === 'easy' ? [10, 20, 25, 50] : difficulty === 'medium' ? [11, 23, 37, 48] : [14, 19, 31, 44]);
  const profit = Math.round(revenue * margin_pct / 100);
  const prompts = [
    `Revenue = $${revenue}M, EBITDA margin = ${margin_pct}%. EBITDA? ($M)`,
    `A firm earns $${revenue}M revenue at ${margin_pct}% net margin. Net income? ($M)`,
    `Gross revenue $${revenue}M, gross margin ${margin_pct}%. Gross profit? ($M)`,
  ];
  return {
    type: 'business_math',
    subtype: 'profit_margin',
    prompt: pick(prompts),
    correct_answer: profit,
    difficulty,
  };
}

function breakevenUnits(difficulty) {
  const fixedCosts = pick(difficulty === 'easy' ? [10000, 20000, 50000] : difficulty === 'medium' ? [18000, 47000, 89000] : [32000, 68000, 125000]);
  const price = pick(difficulty === 'easy' ? [20, 25, 50] : difficulty === 'medium' ? [12, 28, 45] : [15, 24, 38, 52]);
  const cogsRatio = difficulty === 'easy' ? pick([0.4, 0.5]) : difficulty === 'medium' ? pick([0.38, 0.52, 0.65]) : pick([0.35, 0.58, 0.68]);
  const cogs = Math.round(price * cogsRatio);
  const contribution = price - cogs;
  if (contribution <= 0) return breakevenUnits(difficulty);
  const units = Math.round(fixedCosts / contribution);
  return {
    type: 'business_math',
    subtype: 'breakeven',
    prompt: `Fixed costs = $${fixedCosts.toLocaleString()}, Price = $${price}, COGS/unit = $${cogs}. Breakeven units?`,
    correct_answer: units,
    difficulty,
  };
}

function revenueCalc(difficulty) {
  const price = pick(difficulty === 'easy' ? [10, 20, 50] : difficulty === 'medium' ? [15, 25, 40, 75] : [18, 35, 65, 120]);
  const units = pick(difficulty === 'easy' ? [100, 200, 500] : difficulty === 'medium' ? [120, 250, 480] : [175, 320, 650]);
  const revenue = price * units;
  const contexts = [
    `SaaS charges $${price}/mo per user. ${units.toLocaleString()} users. Monthly revenue?`,
    `Product priced at $${price}. Sold ${units.toLocaleString()} units. Total revenue?`,
    `Consulting firm bills $${price}K/day for ${units} days. Total fees? ($K)`,
  ];
  return {
    type: 'business_math',
    subtype: 'revenue',
    prompt: pick(contexts),
    correct_answer: revenue,
    difficulty,
  };
}

function contributionMargin(difficulty) {
  const price = pick([20, 30, 40, 50, 60, 80, 100]);
  const vc = pick([8, 12, 15, 18, 24, 30]);
  if (vc >= price) return contributionMargin(difficulty);
  const cm = price - vc;
  const cmPct = Math.round((cm / price) * 100);
  const type = pick(['value', 'percent']);
  return {
    type: 'business_math',
    subtype: 'contribution_margin',
    prompt: type === 'value'
      ? `Selling price = $${price}, Variable cost = $${vc}. Contribution margin per unit?`
      : `Selling price = $${price}, Variable cost = $${vc}. Contribution margin %? (nearest whole)`,
    correct_answer: type === 'value' ? cm : cmPct,
    difficulty,
  };
}

// ─── MARKET SIZING ────────────────────────────────────────────────────────────

function marketSizingFixed(difficulty) {
  const scenarios = [
    { prompt: 'US has 330M people. ~25% are professionals. 10% use software at $20/mo. Annual market? ($B, round)', answer: Math.round(330e6 * 0.25 * 0.1 * 20 * 12 / 1e9) },
    { prompt: '50M households, 40% stream at $15/mo. Annual streaming market? ($B, round)', answer: Math.round(50e6 * 0.4 * 15 * 12 / 1e9) },
    { prompt: 'Office: 800 employees order lunch 3×/week at $12 avg. Annual spend? ($K)', answer: Math.round(800 * 3 * 12 * 50 / 1000) },
    { prompt: '10M SMBs in the US, 15% use accounting SaaS at $50/mo. Market size? ($B, round)', answer: Math.round(10e6 * 0.15 * 50 * 12 / 1e9) },
    { prompt: 'Airport: 50K daily passengers, 20% buy $5 coffee. Annual coffee revenue? ($M, round)', answer: Math.round(50000 * 0.2 * 5 * 365 / 1e6) },
    { prompt: 'City of 2M, 30% use rideshare 250 days/yr at $12/trip. Annual market? ($M, round)', answer: Math.round(2e6 * 0.3 * 250 * 12 / 1e6) },
    { prompt: 'Gym: 2,000 members at $50/mo. Annual revenue? ($K)', answer: 2000 * 50 * 12 / 1000 },
    { prompt: 'Hospital: 400 patients/day, avg 3-day stay at $1,200/day. Monthly revenue? ($M, round)', answer: Math.round(400 * 3 * 1200 * 30 / 1e6) },
    { prompt: '1M city residents, 20% own a car, pay $600/yr insurance. Market size? ($M)', answer: Math.round(1e6 * 0.2 * 600 / 1e6) },
    { prompt: 'School: 500 students, textbooks cost $120 each, replaced every 3 yrs. Annual textbook spend? ($K)', answer: Math.round(500 * 120 / 3 / 1000) },
  ];
  const s = pick(scenarios);
  return { type: 'market_sizing', subtype: 'market_sizing', prompt: s.prompt, correct_answer: s.answer, difficulty };
}

// ─── GMAT QUANT ───────────────────────────────────────────────────────────────

function gmatQuant(difficulty) {
  const generators = [gmatArithmetic, gmatAlgebra, gmatRatio, gmatWordProblem];
  return pick(generators)(difficulty);
}

function gmatArithmetic(difficulty) {
  const scenarios = difficulty === 'easy' ? [
    () => { const a = rand(2, 9); const b = rand(2, 9); return { prompt: `What is ${a}² + ${b}²?`, answer: a*a + b*b }; },
    () => { const n = rand(10, 30) * 5; return { prompt: `${n}% of 200 = ?`, answer: Math.round(200 * n / 100) }; },
    () => { const a = rand(10, 50); const b = rand(10, 50); return { prompt: `LCM of ${a*2} and ${b*2}? (If unclear, just compute ${a*2} × ${b*2} ÷ GCD)`, answer: lcm(a*2, b*2) }; },
  ] : difficulty === 'medium' ? [
    () => { const n = rand(2, 6); return { prompt: `${n}³ = ?`, answer: n*n*n }; },
    () => { const a = rand(3, 8); const b = rand(2, 5); return { prompt: `${a}! ÷ ${b}! = ? (factorials, just compute the product of integers between ${b+1} and ${a})`, answer: factorial(a) / factorial(b) }; },
    () => { const x = rand(2, 9); return { prompt: `If x² = ${x*x}, what is 2x + 3?`, answer: 2*x + 3 }; },
  ] : [
    () => { const a = rand(10, 20); const b = rand(2, 9); return { prompt: `${a}² − ${b}² = ? (difference of squares)`, answer: a*a - b*b }; },
    () => { const n = rand(3, 8); return { prompt: `${n}! / (${n-2})! = ?`, answer: n * (n-1) }; },
    () => { const x = rand(3, 9); return { prompt: `√${x*x} + √${(x+1)*(x+1)} = ?`, answer: x + (x+1) }; },
  ];
  const s = pick(scenarios)();
  return { type: 'gmat_quant', subtype: 'arithmetic', prompt: s.prompt, correct_answer: s.answer, difficulty };
}

function gmatAlgebra(difficulty) {
  const scenarios = difficulty === 'easy' ? [
    () => { const a = rand(2,8); const b = rand(1,10); const c = a*rand(2,5)+b; return { prompt: `If ${a}x + ${b} = ${c}, what is x?`, answer: (c-b)/a }; },
    () => { const a = rand(2,6); const ans = rand(3,10); return { prompt: `If x / ${a} = ${ans}, what is x?`, answer: a*ans }; },
  ] : difficulty === 'medium' ? [
    () => { const a = rand(2,6); const b = rand(2,8); const ans = rand(5,15); return { prompt: `${a}x − ${b} = ${a*ans - b}. Solve for x.`, answer: ans }; },
    () => { const a = rand(3,7); const b = rand(2,5); const y = rand(2,8); return { prompt: `If ${a}x + ${b}y = ${a*6 + b*y} and y = ${y}, find x.`, answer: 6 }; },
  ] : [
    () => { const a = rand(2,5); const b = rand(1,4); const ans = rand(3,8); return { prompt: `(${a}x + ${b})² = ${Math.pow(a*ans+b, 2)}. What is x? (take positive root)`, answer: ans }; },
    () => { const a = rand(2,6); const k = rand(3,8); return { prompt: `If ${a}x = ${a*k} and y = 2x − 3, what is y?`, answer: 2*k - 3 }; },
  ];
  const s = pick(scenarios)();
  return { type: 'gmat_quant', subtype: 'algebra', prompt: s.prompt, correct_answer: s.answer, difficulty };
}

function gmatRatio(difficulty) {
  const scenarios = difficulty === 'easy' ? [
    () => { const a = rand(2,5); const b = rand(2,5); const total = (a+b) * rand(10,30); return { prompt: `Ratio A:B = ${a}:${b}. Total = ${total}. How much is A?`, answer: Math.round(total * a / (a+b)) }; },
  ] : difficulty === 'medium' ? [
    () => { const r = rand(2,6); const base = rand(10,50); return { prompt: `A firm's P/E ratio is ${r}. If EPS = $${base}, what is the share price?`, answer: r * base }; },
    () => { const a = rand(2,4); const b = rand(2,5); const c = rand(2,4); const tot = (a+b+c)*rand(5,15); return { prompt: `Costs split A:B:C = ${a}:${b}:${c}. Total = $${tot}K. What is B's share? ($K)`, answer: Math.round(tot * b / (a+b+c)) }; },
  ] : [
    () => { const markup = rand(20,80); const cost = pick([100,150,200,250,400]); return { prompt: `Cost = $${cost}, markup = ${markup}%. Selling price?`, answer: Math.round(cost * (1 + markup/100)) }; },
    () => { const a = rand(3,7); const b = rand(2,6); const profit = (a+b) * rand(8,20); return { prompt: `Two partners split profit ${a}:${b}. Total profit = $${profit}K. Larger share? ($K)`, answer: Math.round(profit * Math.max(a,b) / (a+b)) }; },
  ];
  const s = pick(scenarios)();
  return { type: 'gmat_quant', subtype: 'ratio', prompt: s.prompt, correct_answer: s.answer, difficulty };
}

function gmatWordProblem(difficulty) {
  const scenarios = difficulty === 'easy' ? [
    () => { const spd = pick([40,50,60]); const t = pick([2,3,4]); return { prompt: `Train travels at ${spd}mph for ${t} hours. Distance? (miles)`, answer: spd*t }; },
    () => { const r = rand(5,15); const p = rand(2,8)*1000; return { prompt: `Simple interest: $${p} at ${r}% for 1 year. Interest earned?`, answer: Math.round(p * r / 100) }; },
  ] : difficulty === 'medium' ? [
    () => { const r1 = pick([35,48,62]); const r2 = pick([78,85,105]); const t = pick([2,3,4]); return { prompt: `Two trains leave at same time, speeds ${r1}mph and ${r2}mph. Gap after ${t} hrs? (miles)`, answer: (r2-r1)*t }; },
    () => { const w = rand(6,12); const d = rand(8,18); return { prompt: `${w} workers complete a job in ${d} days. How many days for 3 workers?`, answer: Math.round(w*d/3) }; },
  ] : [
    () => { const p = rand(3,9)*1500; const r = rand(9,22); const t = rand(3,5); return { prompt: `Compound interest: $${p.toLocaleString()} at ${r}% annual for ${t} yrs. Total value? (round to nearest K)`, answer: Math.round(p * Math.pow(1 + r/100, t) / 1000) }; },
    () => { const a = rand(4,9); const b = rand(4,9); if (a===b) return gmatWordProblem(difficulty); return { prompt: `Pipe A fills tank in ${a}h, Pipe B empties in ${b}h. If both open, net hours to fill? (round to 1 decimal)`, answer: Math.round((a*b/(a-b))*10)/10 }; },
  ];
  const s = pick(scenarios)();
  return { type: 'gmat_quant', subtype: 'word_problem', prompt: s.prompt, correct_answer: s.answer, difficulty };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }
function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }

// ─── CATEGORY MAP ────────────────────────────────────────────────────────────

const CATEGORY_GENERATORS = {
  mental_math:        [multiplication, division, approximation],
  percentages_growth: [percentageChange, percentageOfTotal, cagrIntuition, percentOfPercent],
  business_math:      [profitMargin, breakevenUnits, revenueCalc, contributionMargin],
  market_sizing:      [marketSizingFixed],
  gmat_quant:         [gmatQuant],
  // Daily mix: weighted across all skills (including premium categories for discovery)
  daily: [
    multiplication, multiplication,
    division, division,
    approximation,
    percentageChange, percentageChange,
    percentageOfTotal,
    percentOfPercent,
    cagrIntuition,
    profitMargin,
    breakevenUnits,
    revenueCalc,
    contributionMargin,
    marketSizingFixed, marketSizingFixed,
    gmatArithmetic, gmatArithmetic,
    gmatAlgebra,
    gmatRatio, gmatRatio,
    gmatWordProblem,
  ],
};

export function generateQuestion(difficulty = 'medium', category = 'daily') {
  const generators = CATEGORY_GENERATORS[category] || CATEGORY_GENERATORS.daily;
  const gen = pick(generators);
  return gen(difficulty);
}

export function generateSession(difficulty = 'medium', count = 10, category = 'daily') {
  return Array.from({ length: count }, () => generateQuestion(difficulty, category));
}

/** Score based on accuracy + difficulty, no speed pressure */
export function calculateSessionScore(results, difficulty) {
  if (!results.length) return 0;
  const multiplier = { easy: 0.85, medium: 1.0, hard: 1.2 }[difficulty] ?? 1.0;
  const accuracy = results.filter(r => r.correct).length / results.length;
  return Math.min(100, Math.round(accuracy * 100 * multiplier));
}

/** Keep old name for any legacy callers */
export function calculateScore(results, difficulty) {
  return calculateSessionScore(results, difficulty);
}

export function getSpeedRating(avgTime, difficulty) {
  const thresholds = {
    easy:   { elite: 4,  fast: 8,  average: 14 },
    medium: { elite: 6,  fast: 11, average: 18 },
    hard:   { elite: 8,  fast: 14, average: 22 },
  };
  const t = thresholds[difficulty] || thresholds.medium;
  if (avgTime <= t.elite)   return 'Elite ⚡';
  if (avgTime <= t.fast)    return 'Fast 🔥';
  if (avgTime <= t.average) return 'Average';
  return 'Developing';
}

/**
 * Returns the % of candidates the user is faster than,
 * based on average response time benchmarks per difficulty.
 * Reference median times: easy=10s, medium=14s, hard=20s
 */
export function getSpeedPercentile(avgTime, difficulty) {
  const medians = { easy: 10, medium: 14, hard: 20 };
  const median = medians[difficulty] || 14;
  // Gaussian-like approximation: 1 SD = 4s
  const z = (median - avgTime) / 4;
  const pct = Math.round(50 + 45 * Math.tanh(z));
  return Math.max(5, Math.min(99, pct));
}

/** Legacy — kept for backward compat */
export function getPercentile(score, difficulty) {
  const base = { easy: 60, medium: 72, hard: 85 }[difficulty];
  if (score >= 90) return Math.min(99, base + 25);
  if (score >= 75) return base + 15;
  if (score >= 60) return base;
  if (score >= 40) return base - 15;
  return base - 25;
}

export function getTimerSeconds(difficulty) {
  return { easy: 15, medium: 12, hard: 8 }[difficulty];
}

export function checkAnswer(userAnswer, correctAnswer) {
  const ua = parseFloat(String(userAnswer).replace(/,/g, ''));
  const ca = parseFloat(correctAnswer);
  if (isNaN(ua)) return false;
  return Math.abs(ua - ca) <= Math.abs(ca) * 0.01 || Math.abs(ua - ca) < 0.5;
}
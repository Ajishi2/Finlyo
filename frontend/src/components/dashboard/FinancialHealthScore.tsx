import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

interface FinancialHealthScoreProps {
  totalIncome: number;
  totalExpense: number;
  categoryTotals?: { category: string; amount: number }[];
}

function calcScore({ totalIncome, totalExpense, categoryTotals }: FinancialHealthScoreProps): number {
  let score = 0;
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
  if (savingsRate > 0.3) score += 25;
  else if (savingsRate > 0.1) score += 15;
  else if (savingsRate > 0) score += 5;

  const expenseRatio = totalIncome > 0 ? totalExpense / totalIncome : 1;
  if (expenseRatio < 0.7) score += 25;
  else if (expenseRatio < 0.9) score += 15;
  else score += 5;

  if (totalIncome > 0) score += 25;

  if (categoryTotals && categoryTotals.length > 0) {
    const max = Math.max(...categoryTotals.map((c) => c.amount));
    if (totalExpense > 0 && max / totalExpense < 0.4) score += 25;
    else if (totalExpense > 0 && max / totalExpense < 0.6) score += 15;
    else score += 5;
  } else {
    score += 25;
  }

  return Math.min(score, 100);
}

function getLabel(score: number) {
  if (score >= 80) return { text: "Excellent", color: "hsl(160 84% 39%)" };
  if (score >= 60) return { text: "Good", color: "hsl(24 95% 53%)" };
  if (score >= 40) return { text: "Fair", color: "hsl(40 96% 53%)" };
  return { text: "Needs Attention", color: "hsl(347 77% 63%)" };
}

export function FinancialHealthScore(props: FinancialHealthScoreProps) {
  const score = calcScore(props);
  const animatedScore = useCountUp(score, 1500);
  const label = getLabel(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card card-highlight rounded-2xl p-6 flex flex-col items-center"
    >
      <h3 className="text-sm font-semibold text-foreground mb-5">Financial Health Score</h3>
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={label.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-foreground">{animatedScore}</span>
          <span className="text-[10px] text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold" style={{ color: label.color }}>
        {label.text}
      </p>
      <p className="text-xs text-muted-foreground mt-1 text-center">
        Based on savings rate, expense ratio, income, and category diversity
      </p>
    </motion.div>
  );
}

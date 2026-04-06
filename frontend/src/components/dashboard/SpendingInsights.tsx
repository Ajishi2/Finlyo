import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface SpendingInsightsProps {
  totalIncome: number;
  totalExpense: number;
  categoryTotals?: { category: string; amount: number }[];
}

function generateInsights({ totalIncome, totalExpense, categoryTotals }: SpendingInsightsProps): string[] {
  const insights: string[] = [];
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const savings = totalIncome - totalExpense;

  if (savingsRate > 30) {
    insights.push(`Your savings rate is ${savingsRate.toFixed(0)}% — excellent financial discipline!`);
  } else if (savingsRate > 0) {
    insights.push(`Your savings rate is ${savingsRate.toFixed(0)}%. Aim for 30%+ for a healthy buffer.`);
  } else {
    insights.push(`You're spending more than you earn. Consider reducing discretionary spending.`);
  }

  if (savings > 0) {
    insights.push(`You're on track to save ₹${savings.toLocaleString("en-IN")} this month.`);
  }

  if (categoryTotals && categoryTotals.length > 0) {
    const top = categoryTotals[0];
    const pct = totalExpense > 0 ? ((top.amount / totalExpense) * 100).toFixed(0) : "0";
    insights.push(`${top.category} is your biggest expense at ${pct}% of total spending.`);

    if (categoryTotals.length > 1) {
      const second = categoryTotals[1];
      insights.push(`${second.category} accounts for ₹${second.amount.toLocaleString("en-IN")} in expenses.`);
    }
  }

  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  if (expenseRatio < 70) {
    insights.push(`Expense-to-income ratio is ${expenseRatio.toFixed(0)}% — well within healthy range.`);
  }

  return insights.slice(0, 4);
}

export function SpendingInsights(props: SpendingInsightsProps) {
  const insights = generateInsights(props);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card card-ambient rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "hsl(var(--primary) / 0.12)" }}
        >
          <Lightbulb size={16} style={{ color: "hsl(var(--primary))" }} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Spending Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-start gap-2.5"
          >
            <span className="text-base mt-0.5">💡</span>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

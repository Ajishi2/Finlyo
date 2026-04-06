import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getDashboardTrends, getDashboardByCategory, getDashboardSummary } from "@/api/dashboard";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { ChartSkeleton, StatCardSkeleton } from "@/components/dashboard/SkeletonCards";

interface MonthlyData { month: string; income: number; expenses: number; }
interface CategoryData { category: string; amount: number; }
interface TopCategory { rank: number; category: string; amount: number; percentage: number; }

const COLORS = { income: "hsl(160 84% 39%)", expenses: "hsl(347 77% 63%)", primary: "hsl(24 95% 53%)" };

export default function Analytics() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [appliedDateRange, setAppliedDateRange] = useState(dateRange);

  const { data: trendsData, isLoading: trendsLoading } = useQuery({ queryKey: ['dashboard-trends', appliedDateRange], queryFn: getDashboardTrends, retry: false });
  const { data: categoryData, isLoading: categoryLoading } = useQuery({ queryKey: ['dashboard-category', appliedDateRange], queryFn: getDashboardByCategory, retry: false });
  const { data: summaryData, isLoading: summaryLoading } = useQuery({ queryKey: ['dashboard-summary', appliedDateRange], queryFn: getDashboardSummary, retry: false });

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleApplyDateRange = () => setAppliedDateRange(dateRange);

  // Transform monthly data for charts
  const monthlyData: MonthlyData[] = useMemo(() => {
    const trends = (trendsData as any)?.data?.data;
    if (!trends) return [];
    
    const months = new Set([...Object.keys(trends.monthlyIncome || {}), ...Object.keys(trends.monthlyExpense || {})]);
    return Array.from(months).sort().map(month => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      income: trends.monthlyIncome?.[month] || 0,
      expenses: trends.monthlyExpense?.[month] || 0
    }));
  }, [trendsData]);

  // Transform category data for charts
  const categoryTotals: CategoryData[] = useMemo(() => {
    const categoryDataRaw = (categoryData as any)?.data?.data?.categoryTotals || {};
    return Object.entries(categoryDataRaw).map(([category, amount]) => ({
      category,
      amount: amount as number
    }));
  }, [categoryData]);

  const summary = (summaryData as any)?.data?.data || { totalIncome: 0, totalExpense: 0, netBalance: 0 };
  const netBalance = summary.totalIncome - (summary.totalExpense || 0);

  const topCategories: TopCategory[] = categoryTotals.length > 0
    ? categoryTotals.filter(c => c.category !== 'Salary' && c.category !== 'Freelance').sort((a, b) => b.amount - a.amount).slice(0, 5)
      .map((cat, i) => ({ rank: i + 1, category: cat.category, amount: cat.amount, percentage: categoryTotals[0]?.amount > 0 ? (cat.amount / categoryTotals[0].amount) * 100 : 0 }))
    : [];

  const pieData = [{ name: 'Income', value: summary.totalIncome || 0 }, { name: 'Expenses', value: summary.totalExpense || 0 }];

  const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN')}`;
  const incomeUp = useCountUp(summary.totalIncome || 0);
  const expenseUp = useCountUp(summary.totalExpense || 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="glass-card rounded-xl p-3 text-sm" style={{ border: "1px solid hsl(var(--border))" }}>
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((e: any, i: number) => <p key={i} style={{ color: e.color }}>{e.name}: {formatCurrency(e.value)}</p>)}
      </div>
    );
  };

  const renderCenterLabel = (props: any) => {
    const { cx, cy } = props?.viewBox || props || {};
    if (!cx || !cy) return null;
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} dy="-8" fill="hsl(var(--muted-foreground))" fontSize="11">Net</tspan>
        <tspan x={cx} dy="20" fill="hsl(var(--foreground))" fontSize="16" fontWeight="bold">{formatCurrency(netBalance)}</tspan>
      </text>
    );
  };

  const isLoading = trendsLoading || categoryLoading || summaryLoading;

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Analytics" userName={user?.name || user?.email || "User"} userRole={user?.role || "USER"} onLogout={handleLogout}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <ChartSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Analytics" userName={user?.name || user?.email || "User"} userRole={user?.role || "USER"} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Date Range Filter */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="glass-card rounded-full px-6 py-3 flex items-center gap-4 w-fit mx-auto">
          <span className="text-xs text-muted-foreground">From</span>
          <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} className="dark-input px-2 py-1 rounded-lg text-sm" style={{ backgroundColor: "transparent", border: "none" }} />
          <span className="text-xs text-muted-foreground">To</span>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} className="dark-input px-2 py-1 rounded-lg text-sm" style={{ backgroundColor: "transparent", border: "none" }} />
          <motion.button onClick={handleApplyDateRange} className="btn-primary px-5 py-1.5 rounded-full text-xs font-semibold"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Apply</motion.button>
        </motion.div>

        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="glass-card card-ambient rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Monthly Trend</h3>
            <span className="text-xs text-muted-foreground">{format(new Date(appliedDateRange.from), 'MMM yyyy')} — {format(new Date(appliedDateRange.to), 'MMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-8 mb-4">
            <div>
              <span className="text-xs text-muted-foreground">Total Income</span>
              <p className="text-xl font-bold" style={{ color: COLORS.income }}>₹{incomeUp.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Total Expenses</span>
              <p className="text-xl font-bold" style={{ color: COLORS.expenses }}>₹{expenseUp.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="aIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(347 77% 63%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(347 77% 63%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="income" stroke="hsl(160 84% 39%)" strokeWidth={2.5} fill="url(#aIncomeGrad)" dot={false} name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="hsl(347 77% 63%)" strokeWidth={2.5} fill="url(#aExpenseGrad)" dot={false} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Two Charts Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="glass-card card-highlight rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTotals}>
                  <defs>
                    <linearGradient id="aCatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(24 95% 53%)" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(24 90% 40%)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="url(#aCatGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Income vs Expense Split</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={renderCenterLabel} labelLine={false}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.name === 'Income' ? COLORS.income : COLORS.expenses} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Top Spending Categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="glass-card card-highlight rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-5">Top Spending Categories</h3>
          <div className="space-y-4">
            {topCategories.map((cat, i) => (
              <motion.div key={cat.rank} className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                  {cat.rank}
                </span>
                <span className="w-28 text-sm font-medium text-foreground">{cat.category}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-muted">
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, hsl(var(--rose)), hsl(var(--primary)))' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 1.2, delay: 0.6 + i * 0.1, ease: [0.4, 0, 0.2, 1] }} />
                </div>
                <span className="w-28 text-sm font-bold text-foreground text-right tabular-nums">{formatCurrency(cat.amount)}</span>
              </motion.div>
            ))}
            {topCategories.length === 0 && <p className="text-center text-muted-foreground py-8">No spending data available</p>}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

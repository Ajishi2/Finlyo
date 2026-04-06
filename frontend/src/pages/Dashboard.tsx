import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StatCardSkeleton, ChartSkeleton } from "@/components/dashboard/SkeletonCards";
import { NetWorthTicker } from "@/components/dashboard/NetWorthTicker";
import { SpendingInsights } from "@/components/dashboard/SpendingInsights";
import { FinancialHealthScore } from "@/components/dashboard/FinancialHealthScore";
import { getDashboardSummary, getDashboardByCategory, getDashboardTrends } from "@/api/dashboard";
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: summaryData, isLoading, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    retry: false,
  });

  const { data: categoryData } = useQuery({
    queryKey: ['dashboard-category'],
    queryFn: getDashboardByCategory,
    retry: false,
  });

  const { data: trendsData } = useQuery({
    queryKey: ['dashboard-trends'],
    queryFn: getDashboardTrends,
    retry: false,
  });

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

  const summary = (summaryData as any)?.data?.data || null;
  const netBalance = summary ? summary.totalIncome - summary.totalExpense : 0;
  const lastUpdated = dataUpdatedAt ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true }) : null;
  const categoryTotals = (categoryData as any)?.data?.data?.categoryTotals || {};
  
  // Transform category data for charts
  const categoryChartData = useMemo(() => {
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: amount as number
    }));
  }, [categoryTotals]);
  
  // Transform monthly data for charts
  const monthlyData = useMemo(() => {
    const trends = (trendsData as any)?.data?.data;
    if (!trends) return [];
    
    const months = new Set([...Object.keys(trends.monthlyIncome || {}), ...Object.keys(trends.monthlyExpense || {})]);
    return Array.from(months).sort().map(month => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      income: trends.monthlyIncome?.[month] || 0,
      expenses: trends.monthlyExpense?.[month] || 0
    }));
  }, [trendsData]);

  return (
    <DashboardLayout
      pageTitle="Dashboard"
      userName={user?.name || user?.email || "User"}
      userRole={user?.role || "USER"}
      onLogout={handleLogout}
      showGhost
    >
      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[0, 1, 2].map(i => <StatCardSkeleton key={i} index={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </>
      ) : (
        <>
          {/* Net Worth Ticker */}
          <NetWorthTicker value={netBalance} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <StatCard label="Total Income" value={summary?.totalIncome || 0} change="+12% vs last month" accentColor="green" icon={TrendingUp} index={0} />
            <StatCard label="Total Expenses" value={summary?.totalExpense || 0} change="+5% vs last month" accentColor="red" icon={TrendingDown} index={1} />
            <StatCard label="Net Balance" value={summary ? netBalance : 0} change="+18% vs last month" accentColor="blue" icon={Wallet} index={2} />
          </div>

          {/* Last updated + refresh */}
          {lastUpdated && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-muted-foreground">Last updated: {lastUpdated}</span>
              <motion.button
                onClick={handleRefresh}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                animate={isFetching ? { rotate: 360 } : {}}
                transition={isFetching ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RefreshCw size={14} />
              </motion.button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <IncomeExpenseChart data={monthlyData} />
            <CategoryChart data={categoryChartData} />
          </div>

          {/* Insights + Health Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <SpendingInsights
                totalIncome={summary?.totalIncome || 0}
                totalExpense={summary?.totalExpense || 0}
                categoryTotals={categoryChartData}
              />
            </div>
            <FinancialHealthScore
              totalIncome={summary?.totalIncome || 0}
              totalExpense={summary?.totalExpense || 0}
              categoryTotals={categoryChartData}
            />
          </div>

          <RecentTransactions />
        </>
      )}
    </DashboardLayout>
  );
}

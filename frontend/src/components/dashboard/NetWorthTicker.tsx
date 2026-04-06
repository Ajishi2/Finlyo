import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

interface NetWorthTickerProps {
  value: number;
}

export function NetWorthTicker({ value }: NetWorthTickerProps) {
  const displayValue = useCountUp(value, 2000);
  const isPositive = value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card card-highlight rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Net Worth
        </span>
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: isPositive ? "hsl(160 84% 39%)" : "hsl(347 77% 63%)" }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: isPositive ? "hsl(160 84% 39%)" : "hsl(347 77% 63%)" }}
          />
        </span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Live
        </span>
      </div>
      <p
        className="text-5xl font-extrabold tracking-tight"
        style={{ color: isPositive ? "hsl(160 84% 50%)" : "hsl(347 77% 63%)" }}
      >
        {isPositive ? "+" : "-"}₹{Math.abs(displayValue).toLocaleString("en-IN")}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        Total income minus total expenses
      </p>
    </motion.div>
  );
}

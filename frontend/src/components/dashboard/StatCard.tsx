import { useCountUp } from "@/hooks/useCountUp";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  change?: string;
  accentColor: "green" | "red" | "blue";
  icon?: LucideIcon;
  index?: number;
}

const accentMap = {
  green: { 
    border: "hsl(160 84% 39% / 0.3)", color: "hsl(160 84% 50%)",
    glow: "stat-glow-emerald", iconBg: "hsl(160 84% 39% / 0.12)",
  },
  red: { 
    border: "hsl(347 77% 63% / 0.3)", color: "hsl(347 77% 70%)",
    glow: "stat-glow-rose", iconBg: "hsl(347 77% 63% / 0.12)",
  },
  blue: { 
    border: "hsl(24 95% 53% / 0.3)", color: "hsl(24 95% 60%)",
    glow: "stat-glow-orange", iconBg: "hsl(24 95% 53% / 0.12)",
  },
};

export function StatCard({ label, value, change, accentColor, icon: Icon, index = 0 }: StatCardProps) {
  const displayValue = useCountUp(value);
  const accent = accentMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card card-highlight rounded-2xl p-6 ${accent.glow}`}
      style={{ borderTop: `2px solid ${accent.border}` }}
    >
      {Icon && (
        <motion.div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: accent.iconBg }}
          whileHover={{ rotate: 10, scale: 1.1 }}>
          <Icon size={20} style={{ color: accent.color }} />
        </motion.div>
      )}
      <p className="text-muted-foreground text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground tracking-tight">
        ₹{displayValue.toLocaleString("en-IN")}
      </p>
      {change && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: change.startsWith("+") ? "hsl(160 84% 39% / 0.12)" : "hsl(347 77% 63% / 0.12)",
              color: change.startsWith("+") ? "hsl(160 84% 50%)" : "hsl(347 77% 70%)"
            }}>
            {change}
          </span>
        </div>
      )}
    </motion.div>
  );
}

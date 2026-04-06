import { motion } from "framer-motion";

export function StatCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="skeleton w-11 h-11 rounded-xl mb-4" />
      <div className="skeleton w-20 h-3 mb-3" />
      <div className="skeleton w-32 h-7 mb-3" />
      <div className="skeleton w-28 h-4 rounded-full" />
    </motion.div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="skeleton w-40 h-4 mb-4" />
      <div className="skeleton w-full h-[200px]" />
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 flex gap-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        {[80, 100, 60, 70, 120].map((w, i) => (
          <div key={i} className="skeleton h-3" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          {[80, 100, 60, 70, 120].map((w, j) => (
            <div key={j} className="skeleton h-3" style={{ width: w + Math.random() * 20 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

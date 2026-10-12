import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
  readToday: boolean;
  size?: "sm" | "md";
}

const StreakBadge = ({ streak, readToday, size = "md" }: StreakBadgeProps) => {
  const active = streak > 0;
  const small = size === "sm";
  const lit = active && readToday;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-body font-semibold transition-colors ${
        small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      } ${lit ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}
      title={
        active
          ? readToday
            ? `${streak}-day reading streak — keep it going!`
            : `${streak}-day streak — read today to keep it alive`
          : "Start a reading streak today"
      }
    >
      <motion.span
        animate={lit ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <Flame size={small ? 12 : 14} className={lit ? "fill-accent text-accent" : ""} />
      </motion.span>
      <span>
        {streak} {small ? "" : streak === 1 ? "day" : "days"}
      </span>
    </motion.div>
  );
};

export default StreakBadge;

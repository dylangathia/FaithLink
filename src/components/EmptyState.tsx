import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const DECORATIONS = {
  hearts: ["♥", "♡", "✦", "♥"],
  sparkles: ["✦", "✧", "✶", "✦"],
  messages: ["✉", "✦", "✉", "✧"],
};

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  decoration?: keyof typeof DECORATIONS;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction, decoration = "sparkles" }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center text-center py-12 sm:py-20 px-6"
  >
    <div className="relative w-32 h-32 mb-6">
      <div className="absolute inset-0 bg-accent/10 rounded-full blur-2xl" />
      <div className="absolute inset-4 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full" />
      {DECORATIONS[decoration].map((glyph, i) => (
        <motion.span
          key={i}
          className="absolute text-accent/40 font-display text-lg select-none"
          style={{ top: `${[10, 75, 20, 70][i]}%`, left: `${[15, 20, 75, 70][i]}%` }}
          animate={{ y: [0, -6, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        >
          {glyph}
        </motion.span>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center">
          <Icon size={28} className="text-accent" />
        </div>
      </div>
    </div>
    <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm font-body text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button onClick={onAction} className="gold-button text-sm">
        {actionLabel}
      </button>
    )}
  </motion.div>
);

export default EmptyState;

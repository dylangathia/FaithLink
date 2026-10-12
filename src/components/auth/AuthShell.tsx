import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

/** Centered card layout used by sign-in, welcome, join and invite screens. */
export const AuthShell = ({ children, wide = false }: { children: ReactNode; wide?: boolean }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
    <div className="mb-8 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Sanctuary</h1>
      <p className="text-xs text-muted-foreground font-body mt-1">Community, faith and Christ — together</p>
    </div>
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8`}
    >
      {children}
    </motion.div>
  </div>
);

export const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoaderCircle size={28} className="animate-spin text-accent" />
  </div>
);

export const inputClass =
  "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30";

export const FieldLabel = ({ children }: { children: ReactNode }) => (
  <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">{children}</label>
);

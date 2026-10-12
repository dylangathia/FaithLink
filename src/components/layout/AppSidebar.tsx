import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUpDown, LogOut, Moon, Plus, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch, useViewer } from "@/contexts/ChurchContext";
import { useTheme } from "@/contexts/ThemeContext";
import { SIDEBAR_ITEMS, visibleFor, type SectionId } from "./navigation";

interface AppSidebarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
}

/** Church name header that opens a menu for switching, joining or creating churches. */
export const ChurchSwitcher = ({ onSwitched }: { onSwitched?: () => void }) => {
  const { memberships, current, switchChurch } = useChurch();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const activeChurches = memberships.filter((m) => m.status === "active");

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 text-left group">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold text-sidebar-foreground tracking-tight">Sanctuary</h1>
          <p className="text-xs text-sidebar-foreground/50 font-body mt-1 truncate">{current?.church.name}</p>
        </div>
        <ChevronsUpDown size={14} className="text-sidebar-foreground/40 group-hover:text-sidebar-foreground shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl p-1.5"
            >
              {activeChurches.map((m) => (
                <button
                  key={m.church_id}
                  onClick={() => {
                    switchChurch(m.church_id);
                    setOpen(false);
                    onSwitched?.();
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-body hover:bg-secondary text-left"
                >
                  <span className="truncate">{m.church.name}</span>
                  {m.church_id === current?.church_id && <Check size={14} className="text-accent shrink-0" />}
                </button>
              ))}
              <div className="h-px bg-border my-1" />
              <button
                onClick={() => navigate("/welcome")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Plus size={14} /> Join or create a church
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const AppSidebar = ({ activeSection, onNavigate }: AppSidebarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { isAdmin } = useChurch();
  const viewer = useViewer();

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <ChurchSwitcher />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {visibleFor(SIDEBAR_ITEMS, isAdmin).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`nav-item w-full text-left text-sm ${activeSection === item.id ? "nav-item-active" : ""}`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-body font-medium text-sidebar-foreground shrink-0">
              {viewer.initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-sidebar-foreground font-medium font-body truncate">{viewer.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 font-body">{viewer.roleLabel}</p>
            </div>
          </div>
          <div className="flex items-center shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={signOut}
              className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;

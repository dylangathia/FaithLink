import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Church, LayoutGrid, LogOut, Moon, Sun, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/contexts/ChurchContext";
import { useTheme } from "@/contexts/ThemeContext";
import { MOBILE_MORE_ITEMS, MOBILE_PRIMARY_ITEMS, visibleFor, type SectionId } from "./navigation";

interface MobileNavProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
}

const MobileNav = ({ activeSection, onNavigate }: MobileNavProps) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { isAdmin } = useChurch();
  const navigateTo = useNavigate();
  const moreItems = visibleFor(MOBILE_MORE_ITEMS, isAdmin);
  const moreActive = moreItems.some((item) => item.id === activeSection);

  const go = (id: SectionId) => {
    onNavigate(id);
    setMoreOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border rounded-t-2xl p-4 md:hidden"
          >
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                    activeSection === item.id
                      ? "bg-sidebar-accent text-accent"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-[10px] font-body font-medium">{item.label}</span>
                </button>
              ))}
              <button
                onClick={toggleTheme}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                <span className="text-[10px] font-body font-medium">{theme === "light" ? "Dark" : "Light"}</span>
              </button>
              <button onClick={() => navigateTo("/welcome")} className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground">
                <Church size={20} />
                <span className="text-[10px] font-body font-medium">Churches</span>
              </button>
              <button onClick={signOut} className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground">
                <LogOut size={20} />
                <span className="text-[10px] font-body font-medium">Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_PRIMARY_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeSection === item.id ? "text-accent" : "text-sidebar-foreground/60"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              moreActive || moreOpen ? "text-accent" : "text-sidebar-foreground/60"
            }`}
          >
            {moreOpen ? <X size={20} /> : <LayoutGrid size={20} />}
            <span className="text-[10px] font-body font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;

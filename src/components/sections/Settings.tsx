import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Check, Clock, Moon, Sun, Sunrise } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { loadNotificationSettings, saveNotificationSettings } from "@/hooks/useDailyVerseNotifications";
import { useViewer } from "@/contexts/ChurchContext";

const PRESETS = [
  { label: "Dawn", time: "06:00", icon: Sunrise },
  { label: "Morning", time: "07:30", icon: Sun },
  { label: "Noon", time: "12:00", icon: Sun },
  { label: "Evening", time: "20:00", icon: Moon },
];

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

const notificationsSupported = typeof window !== "undefined" && "Notification" in window;

const Settings = () => {
  const [settings, setSettings] = useState(loadNotificationSettings);
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationsSupported ? Notification.permission : "default",
  );
  const { theme, toggleTheme } = useTheme();
  const { churchName } = useViewer();

  useEffect(() => {
    saveNotificationSettings(settings);
  }, [settings]);

  const requestPermission = async () => {
    if (!notificationsSupported) {
      toast.error("Notifications are not supported on this device");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      toast.success("Notifications enabled");
      setSettings((s) => ({ ...s, enabled: true }));
    } else {
      toast("Notification permission was not granted", { description: "You can enable it in your browser settings." });
    }
  };

  const toggleReminders = async () => {
    if (settings.enabled) {
      setSettings((s) => ({ ...s, enabled: false }));
      toast("Daily verse notifications turned off");
    } else if (permission !== "granted") {
      await requestPermission();
    } else {
      setSettings((s) => ({ ...s, enabled: true }));
      toast(`Daily verse set for ${formatTime(settings.time)}`);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="section-header">Settings</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">Personalize your Sanctuary experience</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="prayer-card mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              {settings.enabled ? (
                <Bell size={18} className="text-accent" />
              ) : (
                <BellOff size={18} className="text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-display font-semibold text-base">Daily Verse</h3>
              <p className="text-xs text-muted-foreground font-body mt-0.5">Get a gentle reminder to open the Word</p>
            </div>
          </div>
          <button
            onClick={toggleReminders}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.enabled ? "bg-accent" : "bg-muted"}`}
            aria-label={settings.enabled ? "Disable" : "Enable"}
          >
            <motion.span
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full shadow"
              animate={{ x: settings.enabled ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <div className={`transition-opacity ${settings.enabled ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
          <p className="text-[10px] uppercase tracking-widest font-body font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Clock size={10} /> Reminder time
          </p>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="time"
              value={settings.time}
              onChange={(e) => setSettings({ ...settings, time: e.target.value })}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-body font-medium focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <span className="text-sm text-muted-foreground font-body">{formatTime(settings.time)}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setSettings({ ...settings, time: preset.time })}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-colors ${
                  settings.time === preset.time
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                <preset.icon size={14} />
                <span className="text-[10px] font-body font-medium">{preset.label}</span>
                <span className="text-[9px] font-body opacity-70">{formatTime(preset.time)}</span>
              </button>
            ))}
          </div>
          {permission === "denied" && (
            <p className="mt-3 text-[11px] font-body text-destructive">
              Browser notifications are blocked. Enable them in your browser settings to receive reminders.
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="prayer-card mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              {theme === "light" ? <Sun size={18} className="text-accent" /> : <Moon size={18} className="text-accent" />}
            </div>
            <div>
              <h3 className="font-display font-semibold text-base">Appearance</h3>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                {theme === "light" ? "Parchment (light)" : "Deep Sanctuary (dark)"}
              </p>
            </div>
          </div>
          <button onClick={toggleTheme} className="text-xs font-body font-medium text-accent hover:underline">
            Switch to {theme === "light" ? "dark" : "light"}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="prayer-card"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            <Check size={18} className="text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base">Sanctuary</h3>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{churchName} · v1.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;

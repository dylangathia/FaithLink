import { useEffect, useRef } from "react";
import { todayKey } from "@/lib/utils";

const SETTINGS_KEY = "sanctuary-notif-settings";
const LAST_FIRED_KEY = "sanctuary-notif-last-fired";
const CHANGE_EVENT = "sanctuary-notif-changed";

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM"
}

const DEFAULT_SETTINGS: NotificationSettings = { enabled: false, time: "07:00" };

export const loadNotificationSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

/** Fires a browser notification once a day at the chosen time while the app is open. */
export const useDailyVerseNotifications = () => {
  const settingsRef = useRef(loadNotificationSettings());

  useEffect(() => {
    const sync = () => {
      settingsRef.current = loadNotificationSettings();
    };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const check = () => {
      const settings = settingsRef.current;
      if (!settings.enabled || !("Notification" in window) || Notification.permission !== "granted") return;
      const now = new Date();
      const [hours, minutes] = settings.time.split(":").map(Number);
      if (now.getHours() !== hours || now.getMinutes() !== minutes) return;
      const today = todayKey();
      if (localStorage.getItem(LAST_FIRED_KEY) === today) return;
      try {
        new Notification("Sanctuary — Verse of the Day", {
          body: "Your daily scripture is ready. Open Sanctuary to read and reflect.",
          icon: "/favicon.svg",
          tag: "sanctuary-daily-verse",
        });
        localStorage.setItem(LAST_FIRED_KEY, today);
      } catch {
        /* ignore */
      }
    };
    check();
    const interval = window.setInterval(check, 60_000);
    return () => window.clearInterval(interval);
  }, []);
};

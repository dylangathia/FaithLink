import { useCallback, useEffect, useState } from "react";
import { todayKey } from "@/lib/utils";

const STORAGE_KEY = "sanctuary-reading-streak";

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  totalDaysRead: number;
}

const DEFAULT_STATE: StreakState = { currentStreak: 0, longestStreak: 0, lastReadDate: null, totalDaysRead: 0 };

const daysBetween = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));

export const useReadingStreak = () => {
  const [state, setState] = useState<StreakState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    return DEFAULT_STATE;
  });

  // A missed day resets the streak
  useEffect(() => {
    if (!state.lastReadDate) return;
    if (daysBetween(state.lastReadDate, todayKey()) > 1 && state.currentStreak !== 0) {
      const reset = { ...state, currentStreak: 0 };
      setState(reset);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Records today's reading. Returns true if the streak changed. */
  const markRead = useCallback(() => {
    const today = todayKey();
    if (state.lastReadDate === today) return false;
    const gap = state.lastReadDate ? daysBetween(state.lastReadDate, today) : null;
    const currentStreak = gap === 1 ? state.currentStreak + 1 : 1;
    const next: StreakState = {
      currentStreak,
      longestStreak: Math.max(currentStreak, state.longestStreak),
      lastReadDate: today,
      totalDaysRead: state.totalDaysRead + 1,
    };
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  }, [state]);

  return { ...state, readToday: state.lastReadDate === todayKey(), markRead };
};

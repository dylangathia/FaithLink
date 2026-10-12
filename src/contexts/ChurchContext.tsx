import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { isAdminRole, ROLE_LABELS, type ChurchRole, type MembershipWithChurch } from "@/lib/types";
import { initialsOf } from "@/lib/utils";
import { useAuth } from "./AuthContext";

const ACTIVE_CHURCH_KEY = "sanctuary-active-church";

interface ChurchState {
  loading: boolean;
  /** All non-removed memberships, including ones awaiting approval. */
  memberships: MembershipWithChurch[];
  /** The membership whose church is currently open in the app. */
  current: MembershipWithChurch | null;
  role: ChurchRole | null;
  isAdmin: boolean;
  switchChurch: (churchId: string) => void;
  refresh: () => Promise<MembershipWithChurch[]>;
}

const ChurchContext = createContext<ChurchState | null>(null);

export const ChurchProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [memberships, setMemberships] = useState<MembershipWithChurch[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_CHURCH_KEY));

  const refresh = useCallback(async () => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("church_members")
      .select("*, church:churches(*)")
      .eq("user_id", userId)
      .neq("status", "removed")
      .order("created_at");
    if (error) console.error("Failed to load churches:", error);
    const rows = (data ?? []) as MembershipWithChurch[];
    setMemberships(rows);
    setLoadedFor(userId);
    return rows;
  }, [userId]);

  useEffect(() => {
    if (userId) refresh();
    else {
      setMemberships([]);
      setLoadedFor(null);
    }
  }, [userId, refresh]);

  const switchChurch = useCallback((churchId: string) => {
    localStorage.setItem(ACTIVE_CHURCH_KEY, churchId);
    setActiveId(churchId);
  }, []);

  const current = useMemo(() => {
    const active = memberships.filter((m) => m.status === "active");
    return active.find((m) => m.church_id === activeId) ?? active[0] ?? null;
  }, [memberships, activeId]);

  const value: ChurchState = {
    loading: !!userId && loadedFor !== userId,
    memberships,
    current,
    role: current?.role ?? null,
    isAdmin: isAdminRole(current?.role),
    switchChurch,
    refresh,
  };

  return <ChurchContext.Provider value={value}>{children}</ChurchContext.Provider>;
};

export const useChurch = () => {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error("useChurch must be used within ChurchProvider");
  return ctx;
};

/** Display details for the signed-in person in the open church. */
export const useViewer = () => {
  const { profile } = useAuth();
  const { current } = useChurch();
  const name = profile?.full_name || "Friend";
  return {
    name,
    firstName: name.split(" ")[0],
    initial: initialsOf(name)[0],
    roleLabel: current ? ROLE_LABELS[current.role] : "",
    churchName: current?.church.name ?? "",
  };
};

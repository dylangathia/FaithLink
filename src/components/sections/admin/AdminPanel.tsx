import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Church, QrCode, UserPlus, UserRoundCheck, Users, type LucideIcon } from "lucide-react";
import { useChurch } from "@/contexts/ChurchContext";
import { supabase } from "@/lib/supabase";
import type { MemberWithProfile } from "@/lib/types";
import AddPeopleTab from "./AddPeopleTab";
import ChurchSettingsTab from "./ChurchSettingsTab";
import JoinCodesTab from "./JoinCodesTab";
import MembersTab from "./MembersTab";
import RequestsTab from "./RequestsTab";

type Tab = "members" | "requests" | "add" | "codes" | "church";

const AdminPanel = () => {
  const { current } = useChurch();
  const churchId = current!.church_id;
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from("church_members")
      .select("*, profile:profiles(full_name, email, phone)")
      .eq("church_id", churchId)
      .neq("status", "removed")
      .order("created_at", { ascending: false });
    if (error) console.error("Failed to load members:", error);
    setMembers((data ?? []) as MemberWithProfile[]);
    setLoading(false);
  }, [churchId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const active = members.filter((m) => m.status === "active");
  const pending = members.filter((m) => m.status === "pending");

  const tabs: { id: Tab; label: string; icon: LucideIcon; count?: number }[] = [
    { id: "members", label: "Members", icon: Users, count: active.length },
    { id: "requests", label: "Requests", icon: UserRoundCheck, count: pending.length },
    { id: "add", label: "Add people", icon: UserPlus },
    { id: "codes", label: "Join codes & QR", icon: QrCode },
    { id: "church", label: "Church", icon: Church },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="section-header">Church Admin</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">Bring your congregation into {current!.church.name}</p>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-body font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <t.icon size={14} />
            {t.label}
            {!!t.count && (
              <span
                className={`ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  tab === t.id ? "bg-accent-foreground/20" : t.id === "requests" ? "bg-accent text-accent-foreground" : "bg-muted"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {tab === "members" && <MembersTab members={active} loading={loading} onChanged={loadMembers} />}
          {tab === "requests" && <RequestsTab requests={pending} loading={loading} onChanged={loadMembers} onOpenCodes={() => setTab("codes")} />}
          {tab === "add" && <AddPeopleTab />}
          {tab === "codes" && <JoinCodesTab />}
          {tab === "church" && <ChurchSettingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;

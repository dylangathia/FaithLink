import { useState } from "react";
import { LoaderCircle, Search, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/contexts/ChurchContext";
import { supabase } from "@/lib/supabase";
import { ROLE_LABELS, type ChurchRole, type MemberWithProfile } from "@/lib/types";
import { errorMessage, initialsOf } from "@/lib/utils";

const ROLE_BADGE: Record<ChurchRole, string> = {
  owner: "bg-accent text-accent-foreground",
  admin: "bg-primary text-primary-foreground",
  leader: "bg-accent/15 text-accent",
  member: "bg-secondary text-muted-foreground",
};

interface MembersTabProps {
  members: MemberWithProfile[];
  loading: boolean;
  onChanged: () => Promise<void>;
}

const MembersTab = ({ members, loading, onChanged }: MembersTabProps) => {
  const { session } = useAuth();
  const { current, role: myRole } = useChurch();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Mirrors the rules enforced in set_member_role / set_member_status
  const canManage = (target: MemberWithProfile) =>
    target.user_id !== session?.user.id &&
    target.role !== "owner" &&
    (myRole === "owner" || target.role !== "admin");
  const assignableRoles: ChurchRole[] = myRole === "owner" ? ["admin", "leader", "member"] : ["leader", "member"];

  const filtered = members.filter((m) => {
    const q = query.toLowerCase();
    return (
      !q ||
      m.profile.full_name.toLowerCase().includes(q) ||
      m.profile.email?.toLowerCase().includes(q) ||
      m.profile.phone?.includes(q.replace(/\D/g, "") || "~")
    );
  });

  const changeRole = async (member: MemberWithProfile, role: ChurchRole) => {
    setBusyId(member.user_id);
    const { error } = await supabase.rpc("set_member_role", { p_church: current!.church_id, p_user: member.user_id, p_role: role });
    if (error) toast.error(errorMessage(error));
    else toast.success(`${member.profile.full_name || "Member"} is now ${ROLE_LABELS[role].toLowerCase()}`);
    await onChanged();
    setBusyId(null);
  };

  const remove = async (member: MemberWithProfile) => {
    if (!window.confirm(`Remove ${member.profile.full_name || "this person"} from ${current!.church.name}?`)) return;
    setBusyId(member.user_id);
    const { error } = await supabase.rpc("set_member_status", { p_church: current!.church_id, p_user: member.user_id, p_status: "removed" });
    if (error) toast.error(errorMessage(error));
    else toast("Member removed");
    await onChanged();
    setBusyId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${members.length} members`}
          className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div className="prayer-card p-0 divide-y divide-border overflow-hidden">
        {filtered.map((m) => (
          <div key={m.user_id} className="flex items-center gap-3 p-3 sm:p-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-accent/15 text-accent text-xs font-body font-semibold">
                {initialsOf(m.profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-medium truncate">
                {m.profile.full_name || "Unnamed"}
                {m.user_id === session?.user.id && <span className="text-muted-foreground font-normal"> (you)</span>}
              </p>
              <p className="text-xs text-muted-foreground font-body truncate">
                {[m.profile.email, m.profile.phone && `+${m.profile.phone.replace(/^\+/, "")}`].filter(Boolean).join(" · ")}
              </p>
            </div>
            {busyId === m.user_id ? (
              <LoaderCircle size={16} className="animate-spin text-accent" />
            ) : canManage(m) ? (
              <div className="flex items-center gap-1 shrink-0">
                <Select value={m.role} onValueChange={(v) => changeRole(m, v as ChurchRole)}>
                  <SelectTrigger className="h-8 w-[104px] text-xs font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs font-body">
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => remove(m)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                  aria-label="Remove member"
                  title="Remove from church"
                >
                  <UserMinus size={15} />
                </button>
              </div>
            ) : (
              <span className={`text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${ROLE_BADGE[m.role]}`}>
                {ROLE_LABELS[m.role]}
              </span>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground font-body">No one matches "{query}".</p>}
      </div>
    </div>
  );
};

export default MembersTab;

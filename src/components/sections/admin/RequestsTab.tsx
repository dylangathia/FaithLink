import { useState } from "react";
import { Check, LoaderCircle, UserRoundCheck, X } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChurch } from "@/contexts/ChurchContext";
import { supabase } from "@/lib/supabase";
import { ROLE_LABELS, type MemberWithProfile } from "@/lib/types";
import { errorMessage, formatShortDate, initialsOf } from "@/lib/utils";

interface RequestsTabProps {
  requests: MemberWithProfile[];
  loading: boolean;
  onChanged: () => Promise<void>;
  onOpenCodes: () => void;
}

const RequestsTab = ({ requests, loading, onChanged, onOpenCodes }: RequestsTabProps) => {
  const { current } = useChurch();
  const [busyId, setBusyId] = useState<string | null>(null);

  const decide = async (member: MemberWithProfile, approve: boolean) => {
    setBusyId(member.user_id);
    const { error } = await supabase.rpc("set_member_status", {
      p_church: current!.church_id,
      p_user: member.user_id,
      p_status: approve ? "active" : "removed",
    });
    if (error) toast.error(errorMessage(error));
    else if (approve) toast.success(`${member.profile.full_name || "Member"} has joined ${current!.church.name}`);
    else toast("Request declined");
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

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={UserRoundCheck}
        title="No one is waiting"
        description="When people use a join code or QR code that needs approval, they'll appear here for you to welcome in."
        actionLabel="Manage join codes"
        onAction={onOpenCodes}
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.user_id} className="prayer-card flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-accent/15 text-accent text-sm font-body font-semibold">{initialsOf(r.profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-medium truncate">{r.profile.full_name || "Unnamed"}</p>
            <p className="text-xs text-muted-foreground font-body truncate">
              {[r.profile.email, r.profile.phone && `+${r.profile.phone.replace(/^\+/, "")}`].filter(Boolean).join(" · ")}
            </p>
            <p className="text-[10px] text-muted-foreground font-body mt-0.5">
              Asked {formatShortDate(r.created_at)} · as {ROLE_LABELS[r.role].toLowerCase()}
            </p>
          </div>
          {busyId === r.user_id ? (
            <LoaderCircle size={16} className="animate-spin text-accent" />
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => decide(r, false)}
                className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Decline"
                title="Decline"
              >
                <X size={16} />
              </button>
              <button onClick={() => decide(r, true)} className="gold-button text-xs flex items-center gap-1.5">
                <Check size={14} /> Approve
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RequestsTab;

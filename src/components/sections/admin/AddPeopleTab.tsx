import { useCallback, useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Copy, LoaderCircle, Mail, MessageSquare, Send, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { FieldLabel, inputClass } from "@/components/auth/AuthShell";
import { useChurch } from "@/contexts/ChurchContext";
import { copyToClipboard, emailLink, inviteUrl, smsLink, whatsappLink } from "@/lib/share";
import { supabase } from "@/lib/supabase";
import { ROLE_LABELS, type ChurchRole, type Invitation } from "@/lib/types";
import { errorMessage, formatShortDate } from "@/lib/utils";

const EMPTY_FORM = { fullName: "", email: "", phone: "", role: "member" as ChurchRole };

/** Share buttons for one invitation; pre-addressed to the invitee where possible. */
const ShareInvite = ({ invitation, churchName }: { invitation: Invitation; churchName: string }) => {
  const link = inviteUrl(invitation.token);
  const firstName = invitation.full_name.split(" ")[0];
  const message = `${firstName ? `Hi ${firstName}, you're` : "You're"} invited to join ${churchName} on Sanctuary 🙏 Tap to join: ${link}`;
  const buttonClass =
    "flex items-center justify-center gap-1.5 text-xs font-body font-medium px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <a href={whatsappLink(message, invitation.phone)} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <Send size={13} /> WhatsApp
      </a>
      <a href={smsLink(message, invitation.phone)} className={buttonClass}>
        <MessageSquare size={13} /> SMS
      </a>
      <a href={emailLink(`Join ${churchName} on Sanctuary`, message, invitation.email)} className={buttonClass}>
        <Mail size={13} /> Email
      </a>
      <button onClick={() => copyToClipboard(link, "Invite link copied")} className={buttonClass}>
        <Copy size={13} /> Copy link
      </button>
    </div>
  );
};

const AddPeopleTab = () => {
  const { current, role: myRole } = useChurch();
  const churchId = current!.church_id;
  const churchName = current!.church.name;
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [justCreated, setJustCreated] = useState<Invitation | null>(null);
  const [pending, setPending] = useState<Invitation[]>([]);

  const loadPending = useCallback(async () => {
    const { data } = await supabase
      .from("invitations")
      .select("*")
      .eq("church_id", churchId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPending((data ?? []) as Invitation[]);
  }, [churchId]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) {
      toast.error("Add an email address or phone number");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .rpc("create_invitation", {
        p_church: churchId,
        p_full_name: form.fullName,
        p_email: form.email || null,
        p_phone: form.phone || null,
        p_role: form.role,
      })
      .single();
    setBusy(false);
    if (error) {
      toast.error(errorMessage(error));
      return;
    }
    setJustCreated(data as Invitation);
    setForm(EMPTY_FORM);
    loadPending();
  };

  const revoke = async (invitation: Invitation) => {
    const { error } = await supabase.from("invitations").update({ status: "revoked" }).eq("id", invitation.id);
    if (error) toast.error(errorMessage(error));
    else toast("Invitation cancelled");
    if (justCreated?.id === invitation.id) setJustCreated(null);
    loadPending();
  };

  const roles: ChurchRole[] = myRole === "owner" ? ["member", "leader", "admin"] : ["member", "leader"];

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="prayer-card space-y-4">
        <div>
          <h3 className="font-display font-semibold flex items-center gap-2">
            <UserPlus size={16} className="text-accent" /> Add someone personally
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-1">
            They join straight away — no approval needed — when they sign in with this email or phone number, or open the
            link you send them.
          </p>
        </div>
        <div>
          <FieldLabel>Full name</FieldLabel>
          <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} placeholder="e.g. Grace Achieng" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel>Phone (with country code)</FieldLabel>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+254 712 345 678" />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="grace@example.com" />
          </div>
        </div>
        <div>
          <FieldLabel>Role</FieldLabel>
          <div className="flex gap-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${
                  form.role === r ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
        <button disabled={busy} className="gold-button text-sm flex items-center gap-2 disabled:opacity-60">
          {busy && <LoaderCircle size={14} className="animate-spin" />}
          Create invitation
        </button>
      </form>

      {justCreated && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-accent/30 bg-accent/10 p-4">
          <p className="text-sm font-body font-medium mb-1">Invitation ready for {justCreated.full_name || "your member"}</p>
          <p className="text-xs font-body text-muted-foreground mb-3">Send them their personal link:</p>
          <ShareInvite invitation={justCreated} churchName={churchName} />
        </motion.div>
      )}

      {pending.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-body font-semibold mb-3">
            Waiting to join ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((inv) => (
              <div key={inv.id} className="prayer-card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-body font-medium truncate">{inv.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground font-body truncate">
                      {[inv.phone && `+${inv.phone}`, inv.email].filter(Boolean).join(" · ")} · {ROLE_LABELS[inv.role]} · invited{" "}
                      {formatShortDate(inv.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => revoke(inv)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors shrink-0"
                    aria-label="Cancel invitation"
                    title="Cancel invitation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <ShareInvite invitation={inv} churchName={churchName} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPeopleTab;

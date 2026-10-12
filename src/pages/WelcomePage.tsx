import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Church, Clock, KeyRound, LoaderCircle, LogOut, QrCode, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, FieldLabel, inputClass } from "@/components/auth/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/contexts/ChurchContext";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/utils";

type View = "choose" | "create";

/** Where people land when they aren't in a church yet: finish profile, join with a code, or start a church. */
const WelcomePage = () => {
  const { profile, updateProfile, signOut } = useAuth();
  const { memberships, refresh, switchChurch } = useChurch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [view, setView] = useState<View>("choose");
  const [code, setCode] = useState("");
  const [church, setChurch] = useState({ name: "", city: "", country: "", requireApproval: true });
  const [busy, setBusy] = useState(false);

  const pending = memberships.filter((m) => m.status === "pending");
  const active = memberships.filter((m) => m.status === "active");

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile({ full_name: name.trim() });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const createChurch = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("create_church", {
        p_name: church.name,
        p_city: church.city,
        p_country: church.country,
        p_require_approval: church.requireApproval,
      });
      if (error) throw error;
      await refresh();
      switchChurch(data as string);
      toast.success(`${church.name} is ready`, { description: "Invite your members from Church Admin." });
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const checkAgain = async () => {
    const rows = await refresh();
    if (rows.some((m) => m.status === "active")) navigate("/", { replace: true });
    else toast("Still waiting for approval");
  };

  if (!profile?.full_name) {
    return (
      <AuthShell>
        <h2 className="font-display text-xl font-semibold mb-1">What should we call you?</h2>
        <p className="text-sm text-muted-foreground font-body mb-6">Your church family will see this name.</p>
        <form onSubmit={saveName} className="space-y-4">
          <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Full name" />
          <button disabled={busy} className="gold-button w-full py-2.5 text-sm disabled:opacity-60">
            Continue
          </button>
        </form>
      </AuthShell>
    );
  }

  if (view === "create") {
    return (
      <AuthShell>
        <h2 className="font-display text-xl font-semibold mb-1">Start your church on Sanctuary</h2>
        <p className="text-sm text-muted-foreground font-body mb-6">
          You'll be the owner and can invite your congregation straight away.
        </p>
        <form onSubmit={createChurch} className="space-y-4">
          <div>
            <FieldLabel>Church name</FieldLabel>
            <input required minLength={2} value={church.name} onChange={(e) => setChurch({ ...church, name: e.target.value })} className={inputClass} placeholder="e.g. Grace Community Church" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>City / town</FieldLabel>
              <input value={church.city} onChange={(e) => setChurch({ ...church, city: e.target.value })} className={inputClass} />
            </div>
            <div>
              <FieldLabel>Country</FieldLabel>
              <input value={church.country} onChange={(e) => setChurch({ ...church, country: e.target.value })} className={inputClass} />
            </div>
          </div>
          <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer">
            <input
              type="checkbox"
              checked={church.requireApproval}
              onChange={(e) => setChurch({ ...church, requireApproval: e.target.checked })}
              className="mt-0.5 accent-[hsl(var(--accent))]"
            />
            <span className="text-sm font-body">
              <span className="font-medium">Approve people who join with a code</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Recommended. People you invite personally always join straight away.
              </span>
            </span>
          </label>
          <button disabled={busy} className="gold-button w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <LoaderCircle size={14} className="animate-spin" />}
            Create church
          </button>
          <button type="button" onClick={() => setView("choose")} className="w-full text-xs font-body text-muted-foreground hover:text-foreground">
            Back
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h2 className="font-display text-xl font-semibold mb-1">Welcome, {profile.full_name.split(" ")[0]}</h2>
      <p className="text-sm text-muted-foreground font-body mb-6">Join your church or start one for your congregation.</p>

      {active.length > 0 && (
        <div className="mb-5 space-y-2">
          {active.map((m) => (
            <button
              key={m.church_id}
              onClick={() => {
                switchChurch(m.church_id);
                navigate("/");
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-accent/40 transition-colors text-left"
            >
              <span className="text-sm font-body font-medium">{m.church.name}</span>
              <ArrowRight size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-5 p-4 rounded-xl bg-accent/10 border border-accent/20">
          <p className="text-sm font-body font-medium flex items-center gap-2 mb-1">
            <Clock size={14} className="text-accent" /> Waiting for approval
          </p>
          <p className="text-xs font-body text-muted-foreground mb-3">
            {pending.map((m) => m.church.name).join(", ")} will let you in once an admin approves your request.
          </p>
          <button onClick={checkAgain} className="text-xs font-body text-accent font-medium flex items-center gap-1.5 hover:underline">
            <RefreshCw size={12} /> Check again
          </button>
        </div>
      )}

      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) navigate(`/join/${encodeURIComponent(code.trim().toUpperCase())}`);
          }}
          className="p-4 rounded-xl border border-border"
        >
          <p className="text-sm font-body font-medium flex items-center gap-2 mb-1">
            <KeyRound size={14} className="text-accent" /> Join with a church code
          </p>
          <p className="text-xs font-body text-muted-foreground mb-3 flex items-center gap-1.5">
            <QrCode size={12} /> Got a QR code? Just scan it with your phone camera.
          </p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClass} uppercase tracking-wider`}
              placeholder="e.g. GRACE-7K2P"
            />
            <button className="gold-button text-sm shrink-0">Join</button>
          </div>
        </form>

        <button
          onClick={() => setView("create")}
          className="w-full p-4 rounded-xl border border-border hover:border-accent/40 transition-colors text-left flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Church size={18} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-body font-medium">I'm a pastor or church admin</p>
            <p className="text-xs font-body text-muted-foreground">Create your church's space</p>
          </div>
          <ArrowRight size={14} className="text-muted-foreground" />
        </button>
      </div>

      <button onClick={signOut} className="mt-6 w-full text-xs font-body text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5">
        <LogOut size={12} /> Sign out
      </button>
    </AuthShell>
  );
};

export default WelcomePage;

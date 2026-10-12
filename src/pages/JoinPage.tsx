import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Church, Clock, LoaderCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, FullPageLoader, inputClass } from "@/components/auth/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/contexts/ChurchContext";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/utils";

interface CodePreview {
  church_id: string;
  church_name: string;
  city: string | null;
  country: string | null;
  requires_approval: boolean;
}

/** Landing page for join codes and QR codes: /join/GRACE-7K2P */
const JoinPage = () => {
  const { code = "" } = useParams();
  const { session, profile, loading: authLoading, updateProfile } = useAuth();
  const { refresh, switchChurch } = useChurch();
  const navigate = useNavigate();

  const [preview, setPreview] = useState<CodePreview | null>(null);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    supabase.rpc("preview_join_code", { p_code: code }).then(({ data }) => {
      setPreview(((data as CodePreview[] | null) ?? [])[0] ?? null);
      setChecking(false);
    });
  }, [code]);

  if (checking || authLoading) return <FullPageLoader />;

  if (!preview) {
    return (
      <AuthShell>
        <h2 className="font-display text-xl font-semibold mb-2">This code isn't working</h2>
        <p className="text-sm font-body text-muted-foreground mb-6">
          <span className="font-mono">{code.toUpperCase()}</span> may have expired, reached its limit or been switched off. Ask
          your church admin for a new one.
        </p>
        <Link to="/welcome" className="gold-button text-sm inline-block">
          Enter a different code
        </Link>
      </AuthShell>
    );
  }

  const join = async () => {
    setBusy(true);
    try {
      if (!profile?.full_name && name.trim()) await updateProfile({ full_name: name.trim() });
      const { data, error } = await supabase.rpc("join_with_code", { p_code: code });
      if (error) throw error;
      const result = data as { church_id: string; status: "active" | "pending" };
      await refresh();
      if (result.status === "active") {
        switchChurch(result.church_id);
        toast.success(`Welcome to ${preview.church_name}!`);
        navigate("/", { replace: true });
      } else {
        setRequested(true);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
          <Church size={28} className="text-accent" />
        </div>
        <p className="text-xs uppercase tracking-widest font-body font-semibold text-accent mb-1">You're invited to join</p>
        <h2 className="font-display text-2xl font-semibold">{preview.church_name}</h2>
        {(preview.city || preview.country) && (
          <p className="text-sm font-body text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <MapPin size={12} /> {[preview.city, preview.country].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      {requested ? (
        <div className="text-center">
          <p className="text-sm font-body flex items-center justify-center gap-2 mb-2">
            <Clock size={14} className="text-accent" /> Request sent
          </p>
          <p className="text-sm font-body text-muted-foreground mb-6">
            A church admin will approve you shortly. You'll be able to sign in and see everything once they do.
          </p>
          <Link to="/welcome" className="gold-button text-sm inline-block">
            Done
          </Link>
        </div>
      ) : !session ? (
        <>
          <Link to={`/auth?next=${encodeURIComponent(`/join/${code}`)}`} className="gold-button w-full py-2.5 text-sm block text-center">
            Sign in or create account to join
          </Link>
          {preview.requires_approval && (
            <p className="text-xs font-body text-muted-foreground text-center mt-3">An admin will approve your request.</p>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {!profile?.full_name && (
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your full name" />
          )}
          <button
            onClick={join}
            disabled={busy || (!profile?.full_name && !name.trim())}
            className="gold-button w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <LoaderCircle size={14} className="animate-spin" />}
            {preview.requires_approval ? "Request to join" : "Join church"}
          </button>
          <p className="text-xs font-body text-muted-foreground text-center">
            Signed in as {profile?.full_name || profile?.email || profile?.phone}
          </p>
        </div>
      )}
    </AuthShell>
  );
};

export default JoinPage;

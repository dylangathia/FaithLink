import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Church, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, FullPageLoader } from "@/components/auth/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/contexts/ChurchContext";
import { supabase } from "@/lib/supabase";
import { ROLE_LABELS, type ChurchRole } from "@/lib/types";
import { errorMessage } from "@/lib/utils";

interface InvitePreview {
  church_id: string;
  church_name: string;
  full_name: string;
  role: ChurchRole;
}

/** Landing page for personal invitation links: /invite/:token */
const InvitePage = () => {
  const { token = "" } = useParams();
  const { session, loading: authLoading } = useAuth();
  const { refresh, switchChurch } = useChurch();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.rpc("preview_invitation", { p_token: token }).then(({ data }) => {
      setPreview(((data as InvitePreview[] | null) ?? [])[0] ?? null);
      setChecking(false);
    });
  }, [token]);

  if (checking || authLoading) return <FullPageLoader />;

  if (!preview) {
    return (
      <AuthShell>
        <h2 className="font-display text-xl font-semibold mb-2">This invitation has been used</h2>
        <p className="text-sm font-body text-muted-foreground mb-6">
          If it was meant for you, you're probably already in — just sign in. Otherwise ask your church admin for a new link.
        </p>
        <Link to="/" className="gold-button text-sm inline-block">
          Open Sanctuary
        </Link>
      </AuthShell>
    );
  }

  const accept = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });
      if (error) throw error;
      await refresh();
      switchChurch(data as string);
      toast.success(`Welcome to ${preview.church_name}!`);
      navigate("/", { replace: true });
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
        <p className="text-xs uppercase tracking-widest font-body font-semibold text-accent mb-1">
          {preview.full_name ? `${preview.full_name.split(" ")[0]}, you're invited` : "You're invited"}
        </p>
        <h2 className="font-display text-2xl font-semibold">{preview.church_name}</h2>
        <p className="text-sm font-body text-muted-foreground mt-1">as {ROLE_LABELS[preview.role].toLowerCase()}</p>
      </div>
      {session ? (
        <button onClick={accept} disabled={busy} className="gold-button w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <LoaderCircle size={14} className="animate-spin" />}
          Accept invitation
        </button>
      ) : (
        <Link to={`/auth?next=${encodeURIComponent(`/invite/${token}`)}`} className="gold-button w-full py-2.5 text-sm block text-center">
          Sign in or create account
        </Link>
      )}
    </AuthShell>
  );
};

export default InvitePage;

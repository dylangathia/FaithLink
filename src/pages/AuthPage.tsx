import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, Mail, Phone } from "lucide-react";
import { AuthShell, FieldLabel, FullPageLoader, inputClass } from "@/components/auth/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/utils";

type Method = "email" | "phone";
type EmailMode = "signin" | "signup";

/** Only allow in-app redirects. */
const safeNext = (value: string | null) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/");

/** "+254 712 345 678" → "+254712345678" */
const normalizePhone = (value: string) => "+" + value.replace(/\D/g, "");

const AuthPage = () => {
  const { session, loading } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();

  const [method, setMethod] = useState<Method>("email");
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (loading) return <FullPageLoader />;
  if (session) return <Navigate to={next} replace />;

  const redirectTo = `${window.location.origin}${next}`;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (emailMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(next, { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() }, emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        if (data.session) navigate(next, { replace: true });
        else setNotice(`We've sent a confirmation link to ${email}. Open it to finish creating your account.`);
      }
    });
  };

  const sendMagicLink = () =>
    run(async () => {
      if (!email) throw new Error("Enter your email address first");
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      setNotice(`Check ${email} for a sign-in link.`);
    });

  const submitPhone = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: normalizePhone(phone),
          options: fullName.trim() ? { data: { full_name: fullName.trim() } } : undefined,
        });
        if (error) throw error;
        setOtpSent(true);
        setNotice(`We've texted a code to ${normalizePhone(phone)}.`);
      } else {
        const { error } = await supabase.auth.verifyOtp({ phone: normalizePhone(phone), token: otp.trim(), type: "sms" });
        if (error) throw error;
        navigate(next, { replace: true });
      }
    });
  };

  const tabClass = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
      active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <AuthShell>
      <h2 className="font-display text-xl font-semibold mb-1">
        {method === "email" && emailMode === "signup" ? "Create your account" : "Welcome"}
      </h2>
      <p className="text-sm text-muted-foreground font-body mb-6">
        {next.startsWith("/join") || next.startsWith("/invite")
          ? "Sign in or create an account to join your church."
          : "Sign in to your church community."}
      </p>

      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
        <button
          onClick={() => {
            setMethod("email");
            setError(null);
            setNotice(null);
          }}
          className={tabClass(method === "email")}
        >
          <Mail size={14} /> Email
        </button>
        <button
          onClick={() => {
            setMethod("phone");
            setError(null);
            setNotice(null);
          }}
          className={tabClass(method === "phone")}
        >
          <Phone size={14} /> Phone
        </button>
      </div>

      {method === "email" ? (
        <form onSubmit={submitEmail} className="space-y-4">
          {emailMode === "signup" && (
            <div>
              <FieldLabel>Full name</FieldLabel>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="e.g. Mary Wanjiku" />
            </div>
          )}
          <div>
            <FieldLabel>Email</FieldLabel>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete={emailMode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <button disabled={busy} className="gold-button w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <LoaderCircle size={14} className="animate-spin" />}
            {emailMode === "signin" ? "Sign in" : "Create account"}
          </button>
          {emailMode === "signin" && (
            <button type="button" onClick={sendMagicLink} disabled={busy} className="w-full text-xs font-body text-accent hover:underline">
              Email me a sign-in link instead
            </button>
          )}
          <p className="text-xs font-body text-muted-foreground text-center">
            {emailMode === "signin" ? "New to Sanctuary? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setEmailMode(emailMode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="text-accent font-medium hover:underline"
            >
              {emailMode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={submitPhone} className="space-y-4">
          {!otpSent ? (
            <>
              <div>
                <FieldLabel>Phone number</FieldLabel>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="+254 712 345 678"
                  autoComplete="tel"
                />
                <p className="text-[11px] text-muted-foreground font-body mt-1.5">Include your country code.</p>
              </div>
              <div>
                <FieldLabel>Full name (if you're new)</FieldLabel>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="e.g. Peter Otieno" />
              </div>
            </>
          ) : (
            <div>
              <FieldLabel>6-digit code</FieldLabel>
              <input
                required
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`${inputClass} tracking-[0.4em] text-center text-lg`}
                maxLength={6}
                autoComplete="one-time-code"
              />
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setNotice(null);
                }}
                className="text-xs font-body text-accent hover:underline mt-2"
              >
                Use a different number
              </button>
            </div>
          )}
          <button disabled={busy} className="gold-button w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <LoaderCircle size={14} className="animate-spin" />}
            {otpSent ? "Verify and continue" : "Text me a code"}
          </button>
        </form>
      )}

      {notice && <p className="mt-4 text-sm font-body text-accent bg-accent/10 rounded-lg p-3">{notice}</p>}
      {error && <p className="mt-4 text-sm font-body text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}
    </AuthShell>
  );
};

export default AuthPage;

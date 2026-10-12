import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Download, LoaderCircle, Maximize2, Plus, QrCode, Send, X } from "lucide-react";
import { toast } from "sonner";
import { FieldLabel, inputClass } from "@/components/auth/AuthShell";
import { useChurch } from "@/contexts/ChurchContext";
import { copyToClipboard, joinUrl, whatsappLink } from "@/lib/share";
import { supabase } from "@/lib/supabase";
import { ROLE_LABELS, type ChurchRole, type JoinCode } from "@/lib/types";
import { errorMessage, formatShortDate } from "@/lib/utils";

const EXPIRY_OPTIONS = [
  { label: "Never", days: null },
  { label: "1 day", days: 1 },
  { label: "1 week", days: 7 },
  { label: "1 month", days: 30 },
];

const QR_FG = "#2f3e46";

const isUsable = (code: JoinCode) =>
  code.active &&
  (!code.expires_at || new Date(code.expires_at) > new Date()) &&
  (code.max_uses === null || code.uses < code.max_uses);

/** Full-screen QR for projecting during a service. */
const PresentQr = ({ code, churchName, onClose }: { code: JoinCode; churchName: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[70] bg-[#F5EFE0] flex flex-col items-center justify-center p-6 text-center"
    onClick={onClose}
  >
    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-[#3A3528]/60 hover:text-[#3A3528]" aria-label="Close">
      <X size={24} />
    </button>
    <p className="font-body text-sm uppercase tracking-[0.3em] text-[#B89B5E] mb-2">Join us on Sanctuary</p>
    <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#3A3528] mb-8">{churchName}</h2>
    <div className="bg-white p-5 rounded-3xl shadow-xl">
      <QRCodeCanvas value={joinUrl(code.code)} size={Math.min(420, window.innerWidth - 120)} fgColor={QR_FG} marginSize={0} />
    </div>
    <p className="font-body text-[#3A3528]/70 mt-8 text-lg">Scan with your phone camera, or enter code</p>
    <p className="font-mono text-3xl sm:text-4xl font-semibold tracking-widest text-[#3A3528] mt-2">{code.code}</p>
  </motion.div>
);

const CodeCard = ({ code, churchName, onToggle }: { code: JoinCode; churchName: string; onToggle: () => void }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [presenting, setPresenting] = useState(false);
  const usable = isUsable(code);
  const link = joinUrl(code.code);

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `${code.code}-qr.png`;
    anchor.click();
  };

  const status = !code.active
    ? "Switched off"
    : code.expires_at && new Date(code.expires_at) <= new Date()
      ? "Expired"
      : code.max_uses !== null && code.uses >= code.max_uses
        ? "Limit reached"
        : null;

  return (
    <div className={`prayer-card ${usable ? "" : "opacity-60"}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div ref={qrRef} className="bg-white p-2.5 rounded-xl self-center sm:self-start shrink-0">
          {/* Rendered at high resolution so the downloaded PNG prints cleanly */}
          <QRCodeCanvas value={link} size={512} fgColor={QR_FG} marginSize={2} style={{ width: 132, height: 132 }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-xl font-semibold tracking-wider">{code.code}</p>
              <p className="text-sm font-body text-foreground/80">{code.label}</p>
            </div>
            <button
              onClick={onToggle}
              className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 ${code.active ? "bg-accent" : "bg-muted"}`}
              aria-label={code.active ? "Switch code off" : "Switch code on"}
              title={code.active ? "Switch off" : "Switch on"}
            >
              <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-background rounded-full shadow transition-transform ${code.active ? "translate-x-[18px]" : ""}`} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              Joins as {ROLE_LABELS[code.role].toLowerCase()}
            </span>
            <span className="text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {code.requires_approval ? "Needs approval" : "Instant"}
            </span>
            <span className="text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {code.uses}
              {code.max_uses !== null ? ` / ${code.max_uses}` : ""} used
            </span>
            {code.expires_at && (
              <span className="text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                Until {formatShortDate(code.expires_at)}
              </span>
            )}
            {status && (
              <span className="text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                {status}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => setPresenting(true)} disabled={!usable} className="gold-button text-xs flex items-center gap-1.5 disabled:opacity-50">
              <Maximize2 size={13} /> Present
            </button>
            <button onClick={downloadQr} className="text-xs font-body font-medium px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 flex items-center gap-1.5">
              <Download size={13} /> QR image
            </button>
            <button onClick={() => copyToClipboard(link, "Join link copied")} className="text-xs font-body font-medium px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 flex items-center gap-1.5">
              <Copy size={13} /> Link
            </button>
            <a
              href={whatsappLink(`Join ${churchName} on Sanctuary 🙏 Use code ${code.code} or tap: ${link}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-body font-medium px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 flex items-center gap-1.5"
            >
              <Send size={13} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
      <AnimatePresence>{presenting && <PresentQr code={code} churchName={churchName} onClose={() => setPresenting(false)} />}</AnimatePresence>
    </div>
  );
};

const JoinCodesTab = () => {
  const { current } = useChurch();
  const church = current!.church;
  const [codes, setCodes] = useState<JoinCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    label: "",
    role: "member" as ChurchRole,
    requiresApproval: church.require_approval,
    maxUses: "",
    expiryDays: null as number | null,
  });

  const load = useCallback(async () => {
    const { data } = await supabase.from("join_codes").select("*").eq("church_id", church.id).order("created_at", { ascending: false });
    setCodes((data ?? []) as JoinCode[]);
    setLoading(false);
  }, [church.id]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.rpc("create_join_code", {
      p_church: church.id,
      p_label: form.label,
      p_role: form.role,
      p_requires_approval: form.requiresApproval,
      p_max_uses: form.maxUses ? parseInt(form.maxUses) : null,
      p_expires_at: form.expiryDays ? new Date(Date.now() + form.expiryDays * 86_400_000).toISOString() : null,
    });
    setBusy(false);
    if (error) {
      toast.error(errorMessage(error));
      return;
    }
    toast.success("New join code created");
    setCreating(false);
    setForm({ ...form, label: "", maxUses: "", expiryDays: null });
    load();
  };

  const toggle = async (code: JoinCode) => {
    const { error } = await supabase.from("join_codes").update({ active: !code.active }).eq("id", code.id);
    if (error) toast.error(errorMessage(error));
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-body text-muted-foreground">
          Share a code from the pulpit, print the QR in your bulletin, or put it on the screen. Make separate codes for
          groups or events so you can switch them off later.
        </p>
        {!creating && (
          <button onClick={() => setCreating(true)} className="gold-button text-sm flex items-center gap-1.5 shrink-0">
            <Plus size={15} /> New code
          </button>
        )}
      </div>

      <AnimatePresence>
        {creating && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={create}
            className="prayer-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <QrCode size={16} className="text-accent" /> New join code
              </h3>
              <button type="button" onClick={() => setCreating(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div>
              <FieldLabel>Label (for you)</FieldLabel>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={inputClass} placeholder="e.g. Sunday bulletin, Youth camp, Choir" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>People join as</FieldLabel>
                <div className="flex gap-2">
                  {(["member", "leader"] as ChurchRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className={`text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${form.role === r ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Expires</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {EXPIRY_OPTIONS.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => setForm({ ...form, expiryDays: o.days })}
                      className={`text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${form.expiryDays === o.days ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <div>
                <FieldLabel>Maximum uses (optional)</FieldLabel>
                <input type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className={inputClass} placeholder="Unlimited" />
              </div>
              <label className="flex items-center gap-2 text-sm font-body cursor-pointer pb-2.5">
                <input type="checkbox" checked={form.requiresApproval} onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })} className="accent-[hsl(var(--accent))]" />
                Approve each person before they join
              </label>
            </div>
            <button disabled={busy} className="gold-button text-sm flex items-center gap-2 disabled:opacity-60">
              {busy && <LoaderCircle size={14} className="animate-spin" />}
              Create code
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {codes.map((code) => (
        <CodeCard key={code.id} code={code} churchName={church.name} onToggle={() => toggle(code)} />
      ))}
    </div>
  );
};

export default JoinCodesTab;

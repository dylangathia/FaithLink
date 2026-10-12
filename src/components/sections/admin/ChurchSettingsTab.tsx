import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { FieldLabel, inputClass } from "@/components/auth/AuthShell";
import { useChurch } from "@/contexts/ChurchContext";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/utils";

const ChurchSettingsTab = () => {
  const { current, refresh } = useChurch();
  const church = current!.church;
  const [form, setForm] = useState({
    name: church.name,
    city: church.city ?? "",
    country: church.country ?? "",
    requireApproval: church.require_approval,
  });
  const [busy, setBusy] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("churches")
      .update({
        name: form.name.trim(),
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        require_approval: form.requireApproval,
      })
      .eq("id", church.id);
    if (error) toast.error(errorMessage(error));
    else {
      toast.success("Church details saved");
      await refresh();
    }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="prayer-card space-y-4">
      <div>
        <FieldLabel>Church name</FieldLabel>
        <input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>City / town</FieldLabel>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
        </div>
        <div>
          <FieldLabel>Country</FieldLabel>
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} />
        </div>
      </div>
      <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer">
        <input
          type="checkbox"
          checked={form.requireApproval}
          onChange={(e) => setForm({ ...form, requireApproval: e.target.checked })}
          className="mt-0.5 accent-[hsl(var(--accent))]"
        />
        <span className="text-sm font-body">
          <span className="font-medium">New join codes need approval by default</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Existing codes keep their own setting.</span>
        </span>
      </label>
      <button disabled={busy} className="gold-button text-sm flex items-center gap-2 disabled:opacity-60">
        {busy && <LoaderCircle size={14} className="animate-spin" />}
        Save changes
      </button>
    </form>
  );
};

export default ChurchSettingsTab;

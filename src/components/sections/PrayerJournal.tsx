import { useState } from "react";
import { motion } from "framer-motion";
import { BookHeart, Check, Clock, PenLine, Plus, X } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import { formatShortDate } from "@/lib/utils";
import { JOURNAL_ENTRIES, type JournalEntry } from "@/data/mockData";

const PrayerJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(JOURNAL_ENTRIES);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const save = () => {
    if (!draft.trim()) return;
    setEntries([{ id: Date.now(), text: draft, date: formatShortDate(Date.now()), answered: false }, ...entries]);
    setDraft("");
    setComposerOpen(false);
    toast.success("Journal entry added", { description: "Keep lifting it up in prayer" });
  };

  const toggleAnswered = (id: number) => {
    const entry = entries.find((e) => e.id === id);
    const nowAnswered = entry && !entry.answered;
    setEntries(entries.map((e) => (e.id === id ? { ...e, answered: !e.answered } : e)));
    if (nowAnswered) toast("🎉 Prayer answered!", { description: "Praise God for His faithfulness" });
  };

  const active = entries.filter((e) => !e.answered);
  const answered = entries.filter((e) => e.answered);

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-header">Prayer Journal</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">Your private space with God</p>
        </div>
        <button onClick={() => setComposerOpen(true)} className="gold-button flex items-center gap-2">
          <Plus size={16} />
          New Entry
        </button>
      </div>

      {composerOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="prayer-card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <PenLine size={16} className="text-accent" /> New Prayer
            </h3>
            <button onClick={() => setComposerOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's on your heart today?"
            className="w-full bg-background border border-border rounded-lg p-3 text-sm font-body resize-none h-24 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <div className="flex justify-end mt-3">
            <button onClick={save} className="gold-button text-sm">
              Save
            </button>
          </div>
        </motion.div>
      )}

      {entries.length === 0 && !composerOpen && (
        <EmptyState
          icon={BookHeart}
          title="Your journal is a blank page"
          description="A quiet place to bring requests, gratitude, and reflection to God. What's stirring in your heart today?"
          actionLabel="Write your first prayer"
          onAction={() => setComposerOpen(true)}
          decoration="sparkles"
        />
      )}

      {active.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-body font-semibold mb-4 flex items-center gap-2">
            <Clock size={12} /> Active Prayers
          </h3>
          <div className="space-y-3">
            {active.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="prayer-card flex items-start gap-4"
              >
                <button
                  onClick={() => toggleAnswered(entry.id)}
                  className="mt-0.5 w-5 h-5 rounded-full border-2 border-border hover:border-accent transition-colors shrink-0"
                  aria-label="Mark as answered"
                />
                <div className="flex-1">
                  <p className="text-sm font-body leading-relaxed">{entry.text}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-body">{entry.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {answered.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-body font-semibold mb-4 flex items-center gap-2">
            <Check size={12} className="text-accent" /> Answered Prayers
          </h3>
          <div className="space-y-3">
            {answered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="prayer-card flex items-start gap-4 opacity-75"
              >
                <button
                  onClick={() => toggleAnswered(entry.id)}
                  className="mt-0.5 w-5 h-5 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center shrink-0"
                  aria-label="Mark as active"
                >
                  <Check size={10} className="text-accent" />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-body leading-relaxed line-through text-muted-foreground">{entry.text}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-body">{entry.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerJournal;

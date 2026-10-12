import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Church, Droplets, Eye, EyeOff, Heart, Plus, Star, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/utils";
import { MILESTONES, type Milestone, type MilestoneIcon } from "@/data/mockData";

const MILESTONE_ICONS: Record<MilestoneIcon, LucideIcon> = {
  baptism: Droplets,
  prayer: Heart,
  bible: BookOpen,
  church: Church,
  testimony: Star,
  general: Calendar,
};

const EMPTY_FORM = { title: "", description: "", icon: "general" as MilestoneIcon, isPublic: true };

const FaithJourney = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES);
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const save = () => {
    if (!form.title.trim()) return;
    const milestone: Milestone = { id: Date.now(), ...form, date: formatShortDate(Date.now()) };
    setMilestones([milestone, ...milestones]);
    setForm(EMPTY_FORM);
    setComposerOpen(false);
    toast.success("Milestone added! ✨", { description: `"${milestone.title}" saved to your journey` });
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-header">Faith Journey</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">Your story of God's faithfulness</p>
        </div>
        <button onClick={() => setComposerOpen(true)} className="gold-button flex items-center gap-2">
          <Plus size={16} />
          <span className="hidden sm:inline">Add Milestone</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {composerOpen && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="prayer-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">New Milestone</h3>
            <button onClick={() => setComposerOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Milestone title"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell the story..."
              className="w-full bg-background border border-border rounded-lg p-3 text-sm font-body resize-none h-20 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <div className="flex flex-wrap gap-2">
              {(Object.entries(MILESTONE_ICONS) as [MilestoneIcon, LucideIcon][]).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, icon: key })}
                  className={`flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    form.icon === key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon size={12} /> {key}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                className={`flex items-center gap-2 text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${
                  form.isPublic ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                }`}
              >
                {form.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                {form.isPublic ? "Public" : "Private"}
              </button>
              <button onClick={save} className="gold-button text-sm">
                Save
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-6">
          {milestones.map((m, i) => {
            const Icon = MILESTONE_ICONS[m.icon] || Calendar;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-14"
              >
                <div className="absolute left-2.5 top-2 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center ring-4 ring-background">
                  <Icon size={10} className="text-accent" />
                </div>
                <div className="prayer-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display font-semibold text-sm">{m.title}</h3>
                      <p className="text-xs text-muted-foreground font-body flex items-center gap-1.5 mt-0.5">
                        <Calendar size={10} /> {m.date}
                        {!m.isPublic && (
                          <span className="flex items-center gap-0.5 text-muted-foreground">
                            · <EyeOff size={10} /> Private
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-body leading-relaxed text-foreground/85">{m.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FaithJourney;

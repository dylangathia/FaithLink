import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Heart, Pause, Play, Plus, X } from "lucide-react";
import { useViewer } from "@/contexts/ChurchContext";
import { WORSHIP_SHARES, type WorshipShare, type WorshipType } from "@/data/mockData";

const TYPE_STYLES: Record<WorshipType, string> = {
  song: "bg-accent/10 text-accent",
  hymn: "bg-primary/10 text-primary",
  "spoken-word": "bg-destructive/10 text-destructive",
};

const EMPTY_FORM = { title: "", artist: "", note: "", type: "song" as WorshipType };

const Worship = () => {
  const viewer = useViewer();
  const [shares, setShares] = useState<WorshipShare[]>(WORSHIP_SHARES);
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const toggleLike = (id: number) =>
    setShares(shares.map((s) => (s.id === id ? { ...s, hasLiked: !s.hasLiked, likes: s.hasLiked ? s.likes - 1 : s.likes + 1 } : s)));

  const submit = () => {
    if (!form.title.trim() || !form.artist.trim()) return;
    setShares([
      { id: Date.now(), author: viewer.name, ...form, likes: 0, hasLiked: false, timeAgo: "Just now" },
      ...shares,
    ]);
    setForm(EMPTY_FORM);
    setComposerOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-header">What's Ministering to Me</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">Share what's blessing your soul</p>
        </div>
        <button onClick={() => setComposerOpen(true)} className="gold-button flex items-center gap-2">
          <Plus size={16} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {composerOpen && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="prayer-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Share Something</h3>
            <button onClick={() => setComposerOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Song or hymn title"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <input
              value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })}
              placeholder="Artist or author"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <div className="flex gap-2">
              {(["song", "hymn", "spoken-word"] as WorshipType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, type })}
                  className={`text-xs font-body px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    form.type === type ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Why is this ministering to you?"
              className="w-full bg-background border border-border rounded-lg p-3 text-sm font-body resize-none h-20 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <div className="flex justify-end">
              <button onClick={submit} className="gold-button text-sm">
                Share
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {shares.map((share, i) => (
          <motion.div
            key={share.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="prayer-card"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => setPlayingId(playingId === share.id ? null : share.id)}
                className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 hover:bg-accent/20 transition-colors"
              >
                {playingId === share.id ? (
                  <Pause size={16} className="text-accent" />
                ) : (
                  <Play size={16} className="text-accent ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-body font-semibold text-sm">{share.title}</h4>
                  <span
                    className={`text-[10px] font-body uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLES[share.type]}`}
                  >
                    {share.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-body">{share.artist}</p>
                <p className="text-sm font-body leading-relaxed text-foreground/85 mt-2">{share.note}</p>
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => toggleLike(share.id)}
                    className={`flex items-center gap-1.5 text-xs font-body transition-colors ${
                      share.hasLiked ? "text-accent font-medium" : "text-muted-foreground hover:text-accent"
                    }`}
                  >
                    <Heart size={14} className={share.hasLiked ? "fill-accent" : ""} />
                    {share.likes}
                  </button>
                  {share.url && (
                    <a
                      href={share.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent font-body transition-colors"
                    >
                      <ExternalLink size={12} /> Listen
                    </a>
                  )}
                  <span className="text-xs text-muted-foreground font-body ml-auto">
                    {share.author} · {share.timeAgo}
                  </span>
                </div>
              </div>
            </div>

            {playingId === share.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 pt-3 border-t border-border"
              >
                <div className="flex items-center gap-1 justify-center">
                  {Array.from({ length: 20 }).map((_, bar) => (
                    <motion.div
                      key={bar}
                      animate={{ height: [4, Math.random() * 16 + 4, 4] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: bar * 0.05 }}
                      className="w-1 bg-accent/60 rounded-full"
                      style={{ height: 4 }}
                    />
                  ))}
                </div>
                <p className="text-center text-[10px] text-muted-foreground font-body mt-2">Now playing</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Worship;

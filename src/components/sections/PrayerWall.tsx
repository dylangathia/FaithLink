import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, EyeOff, HandHeart, Heart, Plus, Search, User, X } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import PullIndicator from "@/components/PullIndicator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import type { VerseRef } from "@/lib/bible";
import { useViewer } from "@/contexts/ChurchContext";
import { ATTACHABLE_VERSES, PRAYER_REQUESTS, type PrayerRequest } from "@/data/mockData";

const PrayerWall = () => {
  const viewer = useViewer();
  const [requests, setRequests] = useState<PrayerRequest[]>(PRAYER_REQUESTS);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [attachedVerse, setAttachedVerse] = useState<VerseRef | null>(null);
  const [verseQuery, setVerseQuery] = useState("");
  const [versePickerOpen, setVersePickerOpen] = useState(false);

  const matchingVerses = ATTACHABLE_VERSES.filter(
    (v) =>
      v.reference.toLowerCase().includes(verseQuery.toLowerCase()) ||
      v.text.toLowerCase().includes(verseQuery.toLowerCase()),
  );

  const togglePrayed = (id: number) => {
    const request = requests.find((r) => r.id === id);
    const startingToPray = request && !request.hasPrayed;
    setRequests(
      requests.map((r) =>
        r.id === id ? { ...r, hasPrayed: !r.hasPrayed, prayerCount: r.hasPrayed ? r.prayerCount - 1 : r.prayerCount + 1 } : r,
      ),
    );
    if (startingToPray) toast("🙏 Praying for this request", { description: "Your prayer has been counted" });
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setVersePickerOpen(false);
    setAttachedVerse(null);
  };

  const submit = () => {
    if (!draft.trim()) return;
    const request: PrayerRequest = {
      id: Date.now(),
      author: anonymous ? "Anonymous" : viewer.name,
      anonymous,
      text: draft,
      prayerCount: 0,
      hasPrayed: false,
      timeAgo: "Just now",
      category: "Personal",
      verse: attachedVerse || undefined,
    };
    setRequests([request, ...requests]);
    setDraft("");
    closeComposer();
    toast.success("Prayer request shared", { description: "Your community is lifting you up" });
  };

  const { containerRef, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast("Prayer Wall refreshed");
    },
  });

  return (
    <div className="p-4 sm:p-8" ref={containerRef}>
      <PullIndicator pullDistance={pullDistance} refreshing={refreshing} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-header">Prayer Wall</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">Lift each other up in prayer</p>
        </div>
        <button onClick={() => setComposerOpen(true)} className="gold-button flex items-center gap-2">
          <Plus size={16} />
          <span className="hidden sm:inline">Share Request</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <AnimatePresence>
        {composerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="prayer-card mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">New Prayer Request</h3>
              <button onClick={closeComposer} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share what's on your heart..."
              className="w-full bg-background border border-border rounded-lg p-3 text-sm font-body resize-none h-24 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />

            {attachedVerse && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="verse-card-inline mt-3 flex items-start gap-2">
                <BookOpen size={14} className="text-accent shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-body font-semibold text-accent not-italic">{attachedVerse.reference}</p>
                  <p className="text-xs">{attachedVerse.text}</p>
                </div>
                <button onClick={() => setAttachedVerse(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X size={14} />
                </button>
              </motion.div>
            )}

            <AnimatePresence>
              {versePickerOpen && !attachedVerse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                      <Search size={14} className="text-muted-foreground" />
                      <input
                        value={verseQuery}
                        onChange={(e) => setVerseQuery(e.target.value)}
                        placeholder="Search verses..."
                        className="flex-1 bg-transparent text-sm font-body focus:outline-none"
                      />
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {matchingVerses.map((v) => (
                        <button
                          key={v.reference}
                          onClick={() => {
                            setAttachedVerse(v);
                            setVersePickerOpen(false);
                            setVerseQuery("");
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-body hover:bg-secondary transition-colors"
                        >
                          <span className="font-semibold text-accent">{v.reference}</span>
                          <span className="text-muted-foreground ml-2">{v.text.slice(0, 50)}...</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAnonymous(!anonymous)}
                  className={`flex items-center gap-2 text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${
                    anonymous ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {anonymous ? <EyeOff size={12} /> : <User size={12} />}
                  {anonymous ? "Anonymous" : "Show Name"}
                </button>
                <button
                  onClick={() => setVersePickerOpen(!versePickerOpen)}
                  className={`flex items-center gap-2 text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${
                    versePickerOpen || attachedVerse ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <BookOpen size={12} />
                  Attach Verse
                </button>
              </div>
              <button onClick={submit} className="gold-button text-sm">
                Submit Prayer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {requests.length === 0 ? (
        <EmptyState
          icon={HandHeart}
          title="The wall is quiet"
          description="No prayer requests yet. Be the first to share what's on your heart — your community is ready to lift you up."
          actionLabel="Share the first request"
          onAction={() => setComposerOpen(true)}
          decoration="hearts"
        />
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {requests.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="prayer-card break-inside-avoid"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  {r.anonymous ? (
                    <EyeOff size={12} className="text-muted-foreground" />
                  ) : (
                    <span className="text-xs font-body font-medium text-foreground">{r.author[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-body font-medium">{r.author}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.timeAgo}</span>
                </div>
                <span className="text-[10px] font-body uppercase tracking-wider text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                  {r.category}
                </span>
              </div>
              <p className="text-sm font-body leading-relaxed text-foreground/85 mb-3">{r.text}</p>
              {r.verse && (
                <div className="verse-card-inline mb-3 flex items-start gap-2">
                  <BookOpen size={12} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-body font-semibold text-accent not-italic">{r.verse.reference}</p>
                    <p className="text-xs leading-relaxed">{r.verse.text}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => togglePrayed(r.id)}
                className={`flex items-center gap-2 text-sm font-body transition-all duration-200 ${
                  r.hasPrayed ? "text-accent font-medium" : "text-muted-foreground hover:text-accent"
                }`}
              >
                <Heart size={16} className={r.hasPrayed ? "fill-accent" : ""} />
                <span>{r.prayerCount} praying</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrayerWall;

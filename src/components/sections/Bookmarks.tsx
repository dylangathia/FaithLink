import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, PenLine, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import ShareVerseDialog from "@/components/ShareVerseDialog";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { VerseRef } from "@/lib/bible";
import { formatShortDate } from "@/lib/utils";

const Bookmarks = () => {
  const { bookmarks, updateNote, removeBookmark } = useBookmarks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [shareVerse, setShareVerse] = useState<VerseRef | null>(null);

  const startEditing = (id: string, note: string) => {
    setEditingId(id);
    setNoteDraft(note);
  };

  const saveNote = (id: string) => {
    updateNote(id, noteDraft.trim());
    setEditingId(null);
    toast.success("Note updated");
  };

  const remove = (id: string) => {
    removeBookmark(id);
    toast("Bookmark removed");
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="section-header">Bookmarks</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">Saved verses and personal reflections</p>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Tap a verse in the Bible reader and choose 'Bookmark' to save it here with your own notes."
          decoration="sparkles"
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {bookmarks.map((b, i) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="prayer-card"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-body font-semibold text-accent">
                      {b.book} {b.chapter}:{b.verse}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5">Saved {formatShortDate(b.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShareVerse({ reference: `${b.book} ${b.chapter}:${b.verse}`, text: b.text })}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-secondary transition-colors"
                      aria-label="Share"
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      onClick={() => remove(b.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="scripture-text text-base leading-relaxed mb-4">"{b.text}"</p>

                {editingId === b.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      autoFocus
                      placeholder="Add your reflection..."
                      className="w-full bg-background border border-border rounded-lg p-3 text-sm font-body resize-none h-20 focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs font-body text-muted-foreground hover:text-foreground px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button onClick={() => saveNote(b.id)} className="gold-button text-xs">
                        Save
                      </button>
                    </div>
                  </div>
                ) : b.note ? (
                  <button
                    onClick={() => startEditing(b.id, b.note)}
                    className="w-full text-left bg-muted/40 border-l-2 border-accent/60 rounded-r-lg p-3 hover:bg-muted/60 transition-colors group"
                  >
                    <p className="text-xs font-body text-foreground/80 leading-relaxed italic">{b.note}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PenLine size={10} /> Edit note
                    </p>
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(b.id, "")}
                    className="text-xs font-body text-muted-foreground hover:text-accent flex items-center gap-1.5 transition-colors"
                  >
                    <PenLine size={12} /> Add a personal note
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ShareVerseDialog open={!!shareVerse} onClose={() => setShareVerse(null)} verse={shareVerse} />
    </div>
  );
};

export default Bookmarks;

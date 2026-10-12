import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Headphones,
  Highlighter,
  Maximize2,
  Minimize2,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import ShareVerseDialog from "@/components/ShareVerseDialog";
import StreakBadge from "@/components/StreakBadge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudioBible } from "@/contexts/AudioBibleContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useReadingStreak } from "@/hooks/useReadingStreak";
import { fetchChapter, type Verse, type VerseRef } from "@/lib/bible";
import { BIBLE_BOOKS } from "@/lib/books";

const HIGHLIGHTS_KEY = "sanctuary-bible-highlights";

type HighlightColor = "yellow" | "green" | "blue" | "pink";

const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  yellow: "bg-[hsl(48_95%_70%/0.35)] dark:bg-[hsl(48_70%_50%/0.3)]",
  green: "bg-[hsl(142_60%_60%/0.3)] dark:bg-[hsl(142_50%_45%/0.3)]",
  blue: "bg-[hsl(210_80%_70%/0.3)] dark:bg-[hsl(210_60%_50%/0.3)]",
  pink: "bg-[hsl(340_80%_75%/0.3)] dark:bg-[hsl(340_60%_55%/0.3)]",
};

const HIGHLIGHT_SWATCH: Record<HighlightColor, string> = {
  yellow: "bg-[hsl(48_95%_60%)]",
  green: "bg-[hsl(142_60%_50%)]",
  blue: "bg-[hsl(210_80%_60%)]",
  pink: "bg-[hsl(340_80%_65%)]",
};

/** Scrolling past this percentage of a chapter counts as reading it for the streak. */
const READ_THRESHOLD = 30;

const BibleReader = () => {
  const [zenMode, setZenMode] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [bookIndex, setBookIndex] = useState(0);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChapterGrid, setShowChapterGrid] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareVerse, setShareVerse] = useState<VerseRef | null>(null);
  const [highlights, setHighlights] = useState<Record<string, HighlightColor>>(() => {
    try {
      const stored = localStorage.getItem(HIGHLIGHTS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const countedChapterRef = useRef<string | null>(null);

  const { currentStreak, readToday, markRead } = useReadingStreak();
  const { isBookmarked, addBookmark, removeBookmark, bookmarkId } = useBookmarks();
  const audio = useAudioBible();

  const book = BIBLE_BOOKS[bookIndex];
  const reference = `${book.name} ${chapter}`;
  const isListening = audio.isPlaying && audio.reference === reference;
  const verseKey = (verse: number) => `${book.name}-${chapter}-${verse}`;

  const setHighlight = (verse: number, color: HighlightColor | null) => {
    const next = { ...highlights };
    if (color === null) delete next[verseKey(verse)];
    else next[verseKey(verse)] = color;
    setHighlights(next);
    try {
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setSelectedVerse(null);
  };

  // Track reading progress and update the streak once per chapter
  useEffect(() => {
    // Zen mode scrolls its own overlay; otherwise the app layout scrolls inside <main>
    const scroller = zenMode ? containerRef.current : containerRef.current?.closest("main");
    if (!scroller) return;
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      const progress = max > 0 ? Math.min(100, (scroller.scrollTop / max) * 100) : 0;
      setScrollProgress(progress);

      const chapterKey = `${book.name}-${chapter}`;
      if (progress > READ_THRESHOLD && countedChapterRef.current !== chapterKey) {
        countedChapterRef.current = chapterKey;
        if (markRead())
          toast("🔥 Reading streak updated!", { description: "Great job showing up in the Word today." });
      }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [zenMode, book.name, chapter, markRead]);

  const loadChapter = useCallback(async (bookName: string, chapterNumber: number) => {
    setLoading(true);
    setError(null);
    setSelectedVerse(null);
    try {
      setVerses(await fetchChapter(bookName, chapterNumber));
    } catch (err) {
      console.error("Failed to fetch chapter:", err);
      setError("Could not load this chapter. Please try again.");
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChapter(book.name, chapter);
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setShowChapterGrid(false);
    setScrollProgress(0);
    countedChapterRef.current = null;
  }, [book.name, chapter, loadChapter]);

  const goNext = () => {
    if (chapter < book.chapters) setChapter(chapter + 1);
    else if (bookIndex < BIBLE_BOOKS.length - 1) {
      setBookIndex(bookIndex + 1);
      setChapter(1);
    }
  };

  const goPrev = () => {
    if (chapter > 1) setChapter(chapter - 1);
    else if (bookIndex > 0) {
      setBookIndex(bookIndex - 1);
      setChapter(BIBLE_BOOKS[bookIndex - 1].chapters);
    }
  };

  const nextLabel =
    chapter < book.chapters ? `Chapter ${chapter + 1}` : bookIndex < BIBLE_BOOKS.length - 1 ? BIBLE_BOOKS[bookIndex + 1].name : null;
  const prevLabel = chapter > 1 ? `Chapter ${chapter - 1}` : bookIndex > 0 ? BIBLE_BOOKS[bookIndex - 1].name : null;

  const toggleAudio = () => {
    if (verses.length === 0) return;
    if (isListening) {
      audio.stop();
      toast("Audio stopped");
    } else {
      audio.play(book.name, chapter, verses);
      toast("🎧 Listening to chapter");
    }
  };

  const toggleBookmark = (verse: Verse) => {
    if (isBookmarked(book.name, chapter, verse.number)) {
      removeBookmark(bookmarkId(book.name, chapter, verse.number));
      toast("Bookmark removed");
    } else {
      addBookmark({ book: book.name, chapter, verse: verse.number, text: verse.text, note: "" });
      toast.success("Verse bookmarked", { description: "Add a note in Bookmarks" });
    }
    setSelectedVerse(null);
  };

  const content = (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-2 pb-1 bg-background/80 backdrop-blur-sm">
        <Progress value={scrollProgress} className="h-1 bg-muted/40" />
      </div>

      <div className="flex items-center justify-between mb-8 mt-4 gap-3">
        {!zenMode && (
          <div className="flex-1 min-w-0">
            <h2 className="section-header">Bible</h2>
            <p className="text-sm text-muted-foreground font-body mt-1">Read, reflect, and meditate</p>
          </div>
        )}
        <div className="flex items-center gap-2 shrink-0">
          {!zenMode && <StreakBadge streak={currentStreak} readToday={readToday} size="sm" />}
          <button
            onClick={toggleAudio}
            disabled={verses.length === 0}
            className={`p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-40 ${
              isListening ? "text-accent" : "text-muted-foreground"
            }`}
            aria-label="Listen to chapter"
            title="Listen to chapter"
          >
            <Headphones size={20} />
          </button>
          <button
            onClick={() => setZenMode(!zenMode)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            aria-label={zenMode ? "Exit zen mode" : "Enter zen mode"}
          >
            {zenMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={goPrev} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-center flex-wrap">
          <BookOpen size={16} className="text-accent shrink-0" />
          <Select
            value={bookIndex.toString()}
            onValueChange={(v) => {
              setBookIndex(parseInt(v));
              setChapter(1);
            }}
          >
            <SelectTrigger className="w-auto min-w-[140px] font-display text-base font-semibold border-none shadow-none bg-transparent h-auto py-1 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {BIBLE_BOOKS.map((b, i) => (
                <SelectItem key={b.name} value={i.toString()} className="font-body text-sm">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={chapter.toString()} onValueChange={(v) => setChapter(parseInt(v))}>
            <SelectTrigger className="w-auto min-w-[80px] font-body text-muted-foreground border-none shadow-none bg-transparent h-auto py-1 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {Array.from({ length: book.chapters }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()} className="font-body text-sm">
                  Chapter {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button onClick={goNext} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowChapterGrid(!showChapterGrid)}
          className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted"
        >
          <Grid3x3 size={12} />
          {showChapterGrid ? "Hide chapters" : `All ${book.chapters} chapters`}
        </button>
      </div>

      {showChapterGrid && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 prayer-card">
          <p className="text-xs font-body text-muted-foreground mb-3">{book.name} — select a chapter</p>
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
            {Array.from({ length: book.chapters }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setChapter(i + 1)}
                className={`w-full aspect-square rounded-lg text-xs font-body font-medium transition-all ${
                  chapter === i + 1 ? "bg-accent text-accent-foreground" : "bg-muted/60 text-foreground hover:bg-accent/20"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3 py-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="h-5 bg-muted/60 rounded animate-pulse" style={{ width: `${60 + ((i * 37) % 40)}%` }} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-sm text-destructive font-body mb-3">{error}</p>
          <button onClick={() => loadChapter(book.name, chapter)} className="gold-button text-sm">
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-1 leading-loose">
            {verses.map((verse, i) => {
              const highlight = highlights[verseKey(verse.number)];
              const selected = selectedVerse === verse.number;
              const bookmarked = isBookmarked(book.name, chapter, verse.number);
              return (
                <span key={verseKey(verse.number)} className="relative">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    onClick={() => setSelectedVerse(selected ? null : verse.number)}
                    className={`scripture-text cursor-pointer inline transition-colors duration-200 rounded px-1 -mx-1 ${
                      highlight ? HIGHLIGHT_BG[highlight] : selected ? "bg-accent/15" : "hover:bg-secondary/50"
                    }`}
                  >
                    <sup className="verse-number">{verse.number}</sup>
                    {verse.text}
                    {bookmarked && (
                      <Bookmark size={10} className="inline-block ml-0.5 text-accent fill-accent align-baseline" />
                    )}{" "}
                  </motion.span>
                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-1.5 align-middle ml-1 px-2 py-1 bg-card border border-border rounded-full shadow-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Highlighter size={10} className="text-muted-foreground" />
                        {(Object.keys(HIGHLIGHT_SWATCH) as HighlightColor[]).map((color) => (
                          <button
                            key={color}
                            onClick={() => setHighlight(verse.number, color)}
                            className={`w-4 h-4 rounded-full ${HIGHLIGHT_SWATCH[color]} ${
                              highlight === color ? "ring-2 ring-foreground/40 ring-offset-1 ring-offset-card" : ""
                            } hover:scale-110 transition-transform`}
                            aria-label={`Highlight ${color}`}
                          />
                        ))}
                        {highlight && (
                          <button
                            onClick={() => setHighlight(verse.number, null)}
                            className="w-4 h-4 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
                            aria-label="Remove highlight"
                          >
                            <X size={10} />
                          </button>
                        )}
                        <span className="w-px h-3.5 bg-border mx-0.5" />
                        <button
                          onClick={() => toggleBookmark(verse)}
                          className={`p-1 rounded-full transition-colors ${
                            bookmarked ? "text-accent" : "text-muted-foreground hover:text-foreground"
                          }`}
                          aria-label="Bookmark"
                          title={bookmarked ? "Remove bookmark" : "Bookmark verse"}
                        >
                          <Bookmark size={11} className={bookmarked ? "fill-accent" : ""} />
                        </button>
                        <button
                          onClick={() => {
                            setShareVerse({ reference: `${book.name} ${chapter}:${verse.number}`, text: verse.text });
                            setSelectedVerse(null);
                          }}
                          className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                          aria-label="Share verse"
                          title="Share as image"
                        >
                          <Share2 size={11} />
                        </button>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            {prevLabel ? (
              <button
                onClick={goPrev}
                className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground">Previous</p>
                  <p className="font-medium">{prevLabel}</p>
                </div>
              </button>
            ) : (
              <div />
            )}
            {nextLabel ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors group"
              >
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Continue reading</p>
                  <p className="font-medium">{nextLabel}</p>
                </div>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </>
      )}
    </div>
  );

  const dialog = <ShareVerseDialog open={!!shareVerse} onClose={() => setShareVerse(null)} verse={shareVerse} />;

  return zenMode ? (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="zen-mode" ref={containerRef}>
      {content}
      {dialog}
    </motion.div>
  ) : (
    <div className="p-4 sm:p-8" ref={containerRef}>
      {content}
      {dialog}
    </div>
  );
};

export default BibleReader;

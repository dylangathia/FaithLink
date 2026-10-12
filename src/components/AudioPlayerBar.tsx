import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useAudioBible } from "@/contexts/AudioBibleContext";

const SPEEDS = [0.85, 1, 1.15, 1.3];

/** Floating mini-player shown while a chapter is being read aloud. */
const AudioPlayerBar = () => {
  const { isPlaying, isPaused, reference, currentVerse, totalVerses, rate, pause, resume, stop, next, prev, setRate } =
    useAudioBible();
  const playing = isPlaying && !isPaused;
  const progress = totalVerses > 0 && currentVerse ? (currentVerse / totalVerses) * 100 : 0;

  const cycleSpeed = () => setRate(SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length]);

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="fixed left-1/2 -translate-x-1/2 z-40 bottom-20 md:bottom-4 w-[calc(100%-1rem)] max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-0.5 bg-muted">
              <motion.div className="h-full bg-accent" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <div className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                <div className="flex items-end gap-0.5 h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-0.5 bg-accent rounded-full"
                      animate={playing ? { height: ["20%", "100%", "40%", "80%", "20%"] } : { height: "30%" }}
                      transition={{ duration: 0.8, repeat: playing ? Infinity : 0, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-semibold text-foreground truncate">{reference}</p>
                <p className="text-[10px] font-body text-muted-foreground">
                  Verse {currentVerse ?? "—"} of {totalVerses}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={cycleSpeed}
                  className="text-[10px] font-body font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary"
                  title="Playback speed"
                >
                  {rate}×
                </button>
                <button
                  onClick={prev}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Previous verse"
                >
                  <SkipBack size={16} />
                </button>
                <button
                  onClick={playing ? pause : resume}
                  className="p-2 bg-accent text-accent-foreground hover:brightness-110 rounded-full transition-all"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <button
                  onClick={next}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Next verse"
                >
                  <SkipForward size={16} />
                </button>
                <button
                  onClick={stop}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Stop"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AudioPlayerBar;

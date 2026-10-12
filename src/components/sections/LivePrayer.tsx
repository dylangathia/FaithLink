import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Circle, Clock, Flame, Hand, Heart, Users } from "lucide-react";
import { toast } from "sonner";
import { useViewer } from "@/contexts/ChurchContext";
import { LIVE_PARTICIPANTS, LIVE_PRAYER_POINTS, UPCOMING_SESSIONS } from "@/data/mockData";

const formatElapsed = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

const LivePrayer = () => {
  const viewer = useViewer();
  const [joined, setJoined] = useState(false);
  const [praying, setPraying] = useState(false);
  const [participants, setParticipants] = useState(LIVE_PARTICIPANTS);
  const [focusedPoint, setFocusedPoint] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!joined) return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [joined]);

  // Simulates other members starting and pausing prayer
  useEffect(() => {
    if (!joined) return;
    const timer = setInterval(() => {
      setParticipants((list) => list.map((p) => ({ ...p, isPraying: Math.random() > 0.4 })));
    }, 5000);
    return () => clearInterval(timer);
  }, [joined]);

  const prayingCount = participants.filter((p) => p.isPraying).length + (praying ? 1 : 0);

  const leave = () => {
    setJoined(false);
    setElapsed(0);
    setPraying(false);
  };

  if (joined) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-header flex items-center gap-2">
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Circle size={10} className="fill-destructive text-destructive" />
              </motion.span>
              Live Prayer
            </h2>
            <p className="text-xs text-muted-foreground font-body mt-1 flex items-center gap-2">
              <Clock size={10} /> {formatElapsed(elapsed)} · {prayingCount} praying now
            </p>
          </div>
          <button
            onClick={leave}
            className="text-sm font-body text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg bg-secondary"
          >
            Leave
          </button>
        </div>

        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {participants.map((p) => (
            <motion.div
              key={p.id}
              animate={p.isPraying ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, delay: p.id * 0.3 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-body font-medium transition-colors ${
                p.isPraying ? "bg-accent/20 text-accent ring-2 ring-accent/30" : "bg-secondary text-muted-foreground"
              }`}
              title={p.name}
            >
              {p.name[0]}
            </motion.div>
          ))}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-body font-medium transition-colors ${
              praying ? "bg-accent/20 text-accent ring-2 ring-accent/30" : "bg-secondary text-muted-foreground"
            }`}
          >
            {viewer.initial}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {LIVE_PRAYER_POINTS.map((point, i) => (
            <motion.div
              key={point.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setFocusedPoint(i)}
              className={`prayer-card cursor-pointer transition-all ${
                focusedPoint === i ? "ring-2 ring-accent/40 border-accent/30" : ""
              }`}
            >
              <p className="text-sm font-body leading-relaxed mb-2">{point.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-body">— {point.author}</span>
                <span className="text-xs text-accent font-body flex items-center gap-1">
                  <Hand size={10} /> {point.prayingNow} praying
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={() => setPraying(!praying)}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-4 rounded-xl font-body font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            praying ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {praying ? (
            <>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <Heart size={18} className="fill-accent-foreground" />
              </motion.div>
              Praying...
            </>
          ) : (
            <>
              <Hand size={18} />
              I'm Praying
            </>
          )}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="section-header">Live Prayer Room</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">Join the prayer circle</p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary text-primary-foreground rounded-2xl p-6 sm:p-10 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6"
        >
          <Flame size={32} className="text-accent" />
        </motion.div>
        <h3 className="font-display text-xl font-semibold mb-2">Evening Prayer Session</h3>
        <p className="text-sm font-body opacity-70 mb-1">{viewer.churchName}</p>
        <p className="text-sm font-body opacity-70 mb-6 flex items-center justify-center gap-2">
          <Users size={14} />
          {LIVE_PARTICIPANTS.length} members praying now
        </p>
        <button
          onClick={() => {
            setJoined(true);
            toast.success("You've joined the prayer room", { description: "Welcome to the prayer circle" });
          }}
          className="gold-button text-base px-8 py-3"
        >
          Join Prayer Room
        </button>
      </motion.div>

      <div className="mt-8">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-body font-semibold mb-4">
          Upcoming Sessions
        </h3>
        <div className="space-y-3">
          {UPCOMING_SESSIONS.map((s) => (
            <div key={s.name} className="prayer-card flex items-center justify-between">
              <div>
                <p className="text-sm font-body font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-1">
                  <Clock size={10} /> {s.time}
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-body">{s.members} joined</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LivePrayer;

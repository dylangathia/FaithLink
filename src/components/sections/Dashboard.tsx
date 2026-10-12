import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Flame, Heart, MessageCircle, MessageSquare, Music, Star, Sunrise, Users } from "lucide-react";
import { toast } from "sonner";
import StreakBadge from "@/components/StreakBadge";
import type { SectionId } from "@/components/layout/navigation";
import { useReadingStreak } from "@/hooks/useReadingStreak";
import { useViewer } from "@/contexts/ChurchContext";
import { VERSE_OF_THE_DAY, VERSE_REFLECTIONS, type Reflection } from "@/data/mockData";

const QUICK_LINKS: { id: SectionId; icon: typeof BookOpen; label: string; desc: string }[] = [
  { id: "bible", icon: BookOpen, label: "Read Bible", desc: "Continue Genesis 1" },
  { id: "prayers", icon: Heart, label: "Prayer Wall", desc: "12 new requests" },
  { id: "live-prayer", icon: Flame, label: "Live Prayer", desc: "5 praying now" },
  { id: "bible", icon: BookOpen, label: "Reading Plans", desc: "Day 12 of Psalms" },
  { id: "worship", icon: Music, label: "Worship", desc: "3 new shares" },
  { id: "milestones", icon: Star, label: "Faith Journey", desc: "5 milestones" },
  { id: "partners", icon: Users, label: "Prayer Partner", desc: "Grace L." },
  { id: "chat", icon: MessageCircle, label: "Community", desc: "5 unread" },
];

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

const Dashboard = ({ onNavigate }: { onNavigate: (section: SectionId) => void }) => {
  const { currentStreak, readToday } = useReadingStreak();
  const viewer = useViewer();
  const [reflections, setReflections] = useState<Reflection[]>(VERSE_REFLECTIONS);
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(47);

  const postReflection = () => {
    if (!draft.trim()) return;
    setReflections([{ id: Date.now(), author: viewer.name, text: draft, timeAgo: "Just now" }, ...reflections]);
    setDraft("");
    toast("Reflection shared ✨");
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-10">
        <div className="flex items-center gap-2 text-accent mb-2">
          <Sunrise size={18} />
          <span className="text-sm font-body font-medium">{greeting()}</span>
        </div>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Welcome back, {viewer.firstName}
          </h1>
          <StreakBadge streak={currentStreak} readToday={readToday} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-primary text-primary-foreground rounded-2xl p-5 sm:p-8 mb-4"
      >
        <p className="text-xs uppercase tracking-widest font-body opacity-60 mb-4">Verse of the Day</p>
        <p className="font-display text-lg sm:text-xl leading-relaxed italic mb-4">"{VERSE_OF_THE_DAY.text}"</p>
        <p className="text-sm font-body font-semibold opacity-80">— {VERSE_OF_THE_DAY.reference}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="prayer-card mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              setLiked(!liked);
              setLikes(liked ? likes - 1 : likes + 1);
            }}
            className={`flex items-center gap-2 text-sm font-body transition-colors ${
              liked ? "text-accent font-medium" : "text-muted-foreground hover:text-accent"
            }`}
          >
            <Heart size={16} className={liked ? "fill-accent" : ""} />
            <span>{likes} — This spoke to me</span>
          </button>
          <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
            <MessageSquare size={10} /> {reflections.length}
          </span>
        </div>

        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
          {reflections.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-body font-medium">{r.author[0]}</span>
              </div>
              <p className="text-xs font-body">
                <span className="font-medium">{r.author}</span> <span className="text-muted-foreground">{r.text}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && postReflection()}
            placeholder="Share a reflection..."
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-body focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button onClick={postReflection} className="text-xs font-body text-accent font-medium hover:text-accent/80">
            Post
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_LINKS.map((link, i) => (
          <motion.button
            key={link.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.03 }}
            onClick={() => onNavigate(link.id)}
            className="prayer-card text-left group hover:border-accent/30 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
              <link.icon size={18} className="text-accent" />
            </div>
            <h3 className="font-body font-semibold text-xs sm:text-sm">{link.label}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-0.5">{link.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

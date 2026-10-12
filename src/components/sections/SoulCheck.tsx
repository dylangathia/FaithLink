import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChartColumn,
  Check,
  ChevronRight,
  Compass,
  Heart,
  Minus,
  Shield,
  Sun,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { CHURCH_PULSE, SOUL_CHECK_HISTORY, type SoulDimension } from "@/data/mockData";

interface Dimension {
  id: SoulDimension;
  label: string;
  icon: LucideIcon;
  color: string;
  bar: string;
  description: string;
  scripture: { reference: string; text: string };
}

const DIMENSIONS: Dimension[] = [
  {
    id: "peace",
    label: "Peace",
    icon: Shield,
    color: "text-blue-500 dark:text-blue-400",
    bar: "bg-blue-400/70",
    description: "Inner calm and trust in God's sovereignty",
    scripture: {
      reference: "Philippians 4:7",
      text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    },
  },
  {
    id: "joy",
    label: "Joy",
    icon: Sun,
    color: "text-amber-500 dark:text-amber-400",
    bar: "bg-amber-400/70",
    description: "Delight and gratitude in God's presence",
    scripture: { reference: "Nehemiah 8:10", text: "Do not grieve, for the joy of the Lord is your strength." },
  },
  {
    id: "faith",
    label: "Faith",
    icon: Heart,
    color: "text-rose-500 dark:text-rose-400",
    bar: "bg-rose-400/70",
    description: "Confidence in God's promises and plan",
    scripture: {
      reference: "Hebrews 11:1",
      text: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    },
  },
  {
    id: "connection",
    label: "Connection",
    icon: Users,
    color: "text-emerald-500 dark:text-emerald-400",
    bar: "bg-emerald-400/70",
    description: "Fellowship with your church community",
    scripture: {
      reference: "Hebrews 10:25",
      text: "Not giving up meeting together, as some are in the habit of doing, but encouraging one another.",
    },
  },
  {
    id: "purpose",
    label: "Purpose",
    icon: Compass,
    color: "text-violet-500 dark:text-violet-400",
    bar: "bg-violet-400/70",
    description: "Clarity in God's calling for your life",
    scripture: {
      reference: "Jeremiah 29:11",
      text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    },
  },
];

const SCALE = ["Struggling", "Low", "Okay", "Good", "Thriving"];

type Tab = "checkin" | "personal" | "pulse";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "checkin", label: "Check In", icon: Heart },
  { id: "personal", label: "My Journey", icon: TrendingUp },
  { id: "pulse", label: "Church Pulse", icon: ChartColumn },
];

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) =>
  trend === "up" ? (
    <TrendingUp size={14} className="text-emerald-500" />
  ) : trend === "down" ? (
    <TrendingDown size={14} className="text-rose-500" />
  ) : (
    <Minus size={14} className="text-muted-foreground" />
  );

const SoulCheck = () => {
  const [tab, setTab] = useState<Tab>("checkin");
  const [answers, setAnswers] = useState<Partial<Record<SoulDimension, number>>>({});
  const [expanded, setExpanded] = useState<SoulDimension | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const allAnswered = DIMENSIONS.every((d) => answers[d.id] !== undefined);

  const submit = () => {
    setSubmitted(true);
    setTimeout(() => setTab("personal"), 1500);
  };

  const answer = (dimension: Dimension, index: number, value: number) => {
    setAnswers({ ...answers, [dimension.id]: value });
    // Auto-advance to the next unanswered dimension
    const nextOpen = DIMENSIONS.find((d, i) => i > index && answers[d.id] === undefined);
    setTimeout(() => setExpanded(nextOpen?.id || null), 300);
  };

  const renderCheckIn = () =>
    submitted ? (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4"
        >
          <Check size={32} className="text-accent" />
        </motion.div>
        <h3 className="font-display text-xl font-semibold text-foreground">Check-in Complete</h3>
        <p className="text-sm text-muted-foreground font-body mt-2 max-w-sm">
          Thank you for sharing. Your response helps your church community grow stronger together.
        </p>
      </motion.div>
    ) : (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground font-body mb-6">
            How are you doing this week? Your responses are anonymous to your church leaders.
          </p>
          <div className="space-y-3">
            {DIMENSIONS.map((d, index) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <button
                  onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all text-left"
                >
                  <div className={d.color}>
                    <d.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-body font-medium text-foreground">{d.label}</span>
                    <p className="text-[11px] text-muted-foreground font-body">{d.description}</p>
                  </div>
                  {answers[d.id] !== undefined ? (
                    <span className="text-xs font-body font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      {SCALE[answers[d.id]!]}
                    </span>
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence>
                  {expanded === d.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pb-1 px-1">
                        <div className="flex gap-2 mb-3">
                          {SCALE.map((label, value) => (
                            <button
                              key={label}
                              onClick={() => answer(d, index, value)}
                              className={`flex-1 py-2 rounded-lg text-[11px] font-body font-medium transition-all ${
                                answers[d.id] === value
                                  ? "bg-accent text-accent-foreground shadow-sm"
                                  : "bg-secondary text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        {answers[d.id] !== undefined && answers[d.id]! <= 1 && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-l-4 border-accent rounded-r-lg p-3 bg-accent/5 mb-2"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <BookOpen size={12} className="text-accent" />
                              <span className="text-[10px] font-body font-semibold text-accent uppercase tracking-wide">
                                A word for you
                              </span>
                            </div>
                            <p className="text-xs font-display italic text-foreground/80 leading-relaxed">"{d.scripture.text}"</p>
                            <p className="text-[10px] font-body font-semibold text-accent mt-1">— {d.scripture.reference}</p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          {allAnswered && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={submit}
              className="gold-button w-full mt-6 py-3 text-sm font-body font-semibold"
            >
              Submit Check-in
            </motion.button>
          )}
        </div>
      </div>
    );

  const renderPersonal = () => {
    const latest = SOUL_CHECK_HISTORY[SOUL_CHECK_HISTORY.length - 1];
    const previous = SOUL_CHECK_HISTORY[SOUL_CHECK_HISTORY.length - 2];
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <h3 className="text-sm font-body font-semibold text-foreground mb-3">This Week</h3>
            <div className="grid grid-cols-5 gap-2">
              {DIMENSIONS.map((d) => {
                const now = latest[d.id];
                const before = previous[d.id];
                return (
                  <div key={d.id} className="bg-card border border-border rounded-xl p-3 text-center">
                    <div className={`${d.color} flex justify-center mb-1`}>
                      <d.icon size={18} />
                    </div>
                    <p className="text-lg font-display font-bold text-foreground">{now}</p>
                    <p className="text-[10px] font-body text-muted-foreground">{d.label}</p>
                    <div className="flex justify-center mt-1">
                      <TrendIcon trend={now > before ? "up" : now < before ? "down" : "stable"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-body font-semibold text-foreground mb-3">4-Week Journey</h3>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="space-y-3">
                {SOUL_CHECK_HISTORY.map((week, row) => (
                  <div key={week.week} className="flex items-center gap-3">
                    <span className="text-xs font-body text-muted-foreground w-14 shrink-0">{week.week}</span>
                    <div className="flex-1 flex gap-1.5">
                      {DIMENSIONS.map((d) => (
                        <div key={d.id} className="flex-1">
                          <div className="h-6 bg-secondary rounded-md overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(week[d.id] / 5) * 100}%` }}
                              transition={{ delay: row * 0.1, duration: 0.5 }}
                              className={`h-full rounded-md ${d.bar}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-3 pl-[68px]">
                {DIMENSIONS.map((d) => (
                  <div key={d.id} className="flex-1 flex items-center justify-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${d.bar}`} />
                    <span className="text-[9px] font-body text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-accent" />
              <span className="text-xs font-body font-semibold text-accent">Personal Insight</span>
            </div>
            <p className="text-sm font-body text-foreground/80 leading-relaxed">
              Your <span className="font-semibold text-foreground">joy</span> has been rising steadily — praise God! Consider
              reaching out to someone in the community this week to strengthen your{" "}
              <span className="font-semibold text-foreground">connection</span>.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderPulse = () => {
    const participation = CHURCH_PULSE.totalCheckins / CHURCH_PULSE.totalMembers;
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-body font-semibold text-foreground">This Week's Pulse</h3>
              <span className="text-xs font-body text-muted-foreground">
                {CHURCH_PULSE.totalCheckins}/{CHURCH_PULSE.totalMembers} checked in
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mb-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${participation * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-accent rounded-full"
              />
            </div>
            <p className="text-[10px] font-body text-muted-foreground">{Math.round(participation * 100)}% participation</p>
          </div>

          <div>
            <h3 className="text-sm font-body font-semibold text-foreground mb-3">Congregation Averages</h3>
            <div className="space-y-2">
              {DIMENSIONS.map((d, i) => {
                const average = CHURCH_PULSE.averages[d.id];
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
                  >
                    <div className={d.color}>
                      <d.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-body font-medium text-foreground">{d.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-display font-bold text-foreground">{average.toFixed(1)}</span>
                          <TrendIcon trend={CHURCH_PULSE.trends[d.id]} />
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(average / 5) * 100}%` }}
                          transition={{ delay: i * 0.08, duration: 0.6 }}
                          className={`h-full rounded-full ${d.bar}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={14} className="text-accent" />
              <span className="text-xs font-body font-semibold text-accent">Areas Needing Prayer</span>
            </div>
            <div className="space-y-2">
              {(Object.entries(CHURCH_PULSE.needsPrayer) as [SoulDimension, number][])
                .sort(([, a], [, b]) => b - a)
                .map(([id, percent]) => {
                  const d = DIMENSIONS.find((dim) => dim.id === id)!;
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <d.icon size={14} className={d.color} />
                        <span className="text-sm font-body text-foreground">{d.label}</span>
                      </div>
                      <span className="text-xs font-body text-muted-foreground">{percent}% reporting struggle</span>
                    </div>
                  );
                })}
            </div>
            <p className="text-xs font-body text-foreground/60 mt-3 italic">
              All data is anonymized. Individual responses are never visible to leaders.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-border">
        <h2 className="section-header">Soul Check</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">Weekly spiritual wellness</p>
      </div>
      <div className="px-4 sm:px-6 pt-4 flex gap-1 bg-background">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-body font-medium transition-colors ${
              tab === t.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {tab === "checkin" && renderCheckIn()}
          {tab === "personal" && renderPersonal()}
          {tab === "pulse" && renderPulse()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SoulCheck;

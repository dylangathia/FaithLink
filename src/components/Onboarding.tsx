import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Heart, Sparkles, Users } from "lucide-react";

const STORAGE_KEY = "sanctuary-onboarded";

const STEPS = [
  {
    icon: BookOpen,
    title: "Read the Word",
    description:
      "Open any book of the Bible, highlight verses in four colors, and bookmark passages with personal notes. Earn a daily reading streak as you go.",
    accent: "from-amber-400/20 to-amber-200/10",
  },
  {
    icon: Heart,
    title: "Pray Together",
    description:
      "Share requests on the Prayer Wall, keep a private journal with God, or join Live Prayer rooms with your church family in real time.",
    accent: "from-rose-400/20 to-rose-200/10",
  },
  {
    icon: Users,
    title: "Stay Connected",
    description:
      "Chat with community groups, meet your prayer partner, and celebrate milestones. Sanctuary is your church home — anywhere.",
    accent: "from-sky-400/20 to-sky-200/10",
  },
];

/** First-run walkthrough; shown once per browser. */
const Onboarding = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const isLast = step === STEPS.length - 1;
  const next = () => (isLast ? finish() : setStep(step + 1));
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl pointer-events-auto"
            >
              <div className={`relative h-44 bg-gradient-to-br ${current.accent} flex items-center justify-center overflow-hidden`}>
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={`${step}-${i}`}
                    className="absolute text-accent/40"
                    style={{ top: `${[20, 70, 30, 75][i]}%`, left: `${[15, 25, 80, 70][i]}%` }}
                    animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <Sparkles size={12 + i * 2} />
                  </motion.span>
                ))}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.7, opacity: 0, rotate: 10 }}
                    transition={{ type: "spring", damping: 18, stiffness: 280 }}
                    className="w-20 h-20 rounded-2xl bg-card shadow-lg border border-border flex items-center justify-center relative z-10"
                  >
                    <Icon size={36} className="text-accent" />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-[10px] uppercase tracking-widest font-body font-semibold text-accent mb-2">
                      Welcome — Step {step + 1} of {STEPS.length}
                    </p>
                    <h2 className="font-display text-2xl font-semibold mb-3">{current.title}</h2>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed mb-6">{current.description}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-1.5 mb-5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === step ? "w-6 bg-accent" : "w-1.5 bg-border hover:bg-muted-foreground/40"
                      }`}
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={finish}
                    className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  >
                    Skip
                  </button>
                  <button onClick={next} className="gold-button text-sm flex items-center gap-2">
                    {isLast ? "Enter Sanctuary" : "Next"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Onboarding;

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Flame, Heart, Lock, MessageCircle, Send, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PRAYER_PARTNERS, type ChatMessage, type PrayerPartner } from "@/data/mockData";

const PrayerPartners = () => {
  const [activePartner, setActivePartner] = useState<PrayerPartner | null>(null);
  const [conversations, setConversations] = useState<Record<number, ChatMessage[]>>(() =>
    Object.fromEntries(PRAYER_PARTNERS.map((p) => [p.id, p.messages])),
  );
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim() || !activePartner) return;
    setConversations({
      ...conversations,
      [activePartner.id]: [
        ...(conversations[activePartner.id] || []),
        { id: Date.now(), author: "You", text: draft, isOwn: true, time: "Now" },
      ],
    });
    setDraft("");
    toast("Message sent", { description: `To ${activePartner.name}` });
  };

  if (activePartner) {
    const messages = conversations[activePartner.id] || [];
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setActivePartner(null)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-accent/20 text-accent font-body text-sm font-semibold">
                {activePartner.initials}
              </AvatarFallback>
            </Avatar>
            {activePartner.available && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-semibold truncate">{activePartner.name}</p>
            <p className="text-[11px] text-muted-foreground font-body">{activePartner.lastActive}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-body bg-muted/60 px-2 py-1 rounded-full">
            <Lock size={9} /> Private
          </div>
        </div>

        <div className="verse-card-inline mb-4 flex items-start gap-2">
          <BookOpen size={14} className="text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-display italic text-foreground/80">"{activePartner.verse}"</p>
            <p className="text-[10px] font-body text-muted-foreground mt-0.5">— {activePartner.verseRef}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`chat-bubble ${m.isOwn ? "chat-bubble-own" : "chat-bubble-other"}`}>
                <p className="text-sm font-body">{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.isOwn ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Share a prayer or encouragement..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30 transition-shadow"
          />
          <button onClick={send} className="gold-button p-2.5 rounded-xl">
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Available Now", value: PRAYER_PARTNERS.filter((p) => p.available).length.toString(), icon: Sparkles },
    { label: "Prayer Partners", value: PRAYER_PARTNERS.length.toString(), icon: Heart },
    { label: "Community Prayers", value: "248", icon: MessageCircle },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-lg bg-accent/10">
            <Users size={20} className="text-accent" />
          </div>
          <h2 className="section-header">Prayer Partners</h2>
        </div>
        <p className="text-sm text-muted-foreground font-body mt-2 ml-[2.75rem]">
          Church leaders and volunteers selected to pray with you
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="prayer-card text-center py-3 px-2">
            <s.icon size={16} className="text-accent mx-auto mb-1.5" />
            <p className="text-lg font-display font-semibold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {PRAYER_PARTNERS.map((partner, i) => (
            <motion.button
              key={partner.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setActivePartner(partner)}
              className="prayer-card w-full text-left group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500 rounded-xl" />
              <div className="relative flex items-start gap-3">
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 ring-2 ring-border group-hover:ring-accent/30 transition-all">
                    <AvatarFallback className="bg-accent/15 text-accent font-body text-sm font-semibold">
                      {partner.initials}
                    </AvatarFallback>
                  </Avatar>
                  {partner.available && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-body font-semibold truncate group-hover:text-accent transition-colors">
                      {partner.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-body flex items-center gap-1 shrink-0 ml-2">
                      <Clock size={10} /> {partner.lastActive}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body mb-2">{partner.role}</p>
                  <p className="text-[11px] font-display italic text-foreground/50 mb-2 truncate">
                    "{partner.verse}" — {partner.verseRef}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {partner.prayerFocus.map((focus) => (
                        <Badge key={focus} variant="secondary" className="text-[10px] font-body py-0 px-1.5">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-[10px] text-accent font-body font-medium flex items-center gap-0.5 shrink-0">
                      <Flame size={11} /> {partner.streak}d
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PrayerPartners;

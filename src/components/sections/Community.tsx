import { useCallback, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Hash, LoaderCircle, Lock, MessagesSquare, Search, Send, Users, X } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { fetchChapter, parseReference, type VerseRef } from "@/lib/bible";
import { useViewer } from "@/contexts/ChurchContext";
import { CHANNEL_MESSAGES, GROUP_CHANNELS, type ChatMessage } from "@/data/mockData";

const Community = () => {
  const { churchName } = useViewer();
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [scripturePanelOpen, setScripturePanelOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [attachedVerse, setAttachedVerse] = useState<VerseRef | null>(null);
  const [results, setResults] = useState<VerseRef[]>([]);
  const [searching, setSearching] = useState(false);
  const [lookupHint, setLookupHint] = useState<string | null>(null);

  const lookUpVerse = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLookupHint(null);
      return;
    }
    const ref = parseReference(query.trim());
    if (!ref) {
      setResults([]);
      setLookupHint(query.length > 2 ? 'Try a reference like "John 3:16" or "Psalm 23"' : null);
      return;
    }
    setSearching(true);
    setLookupHint(null);
    setResults([]);
    try {
      const verses = await fetchChapter(ref.book, ref.chapter);
      if (ref.verseStart !== undefined) {
        const end = ref.verseEnd ?? ref.verseStart;
        const range = verses.filter((v) => v.number >= ref.verseStart! && v.number <= end);
        if (range.length === 0) {
          setLookupHint("Verse not found in this chapter");
          return;
        }
        const label = ref.verseStart === end ? `${ref.verseStart}` : `${ref.verseStart}-${end}`;
        setResults([{ reference: `${ref.book} ${ref.chapter}:${label}`, text: range.map((v) => v.text).join(" ") }]);
      } else {
        // Whole chapter: offer the full passage plus the first few individual verses
        const options = verses.slice(0, 5).map((v) => ({ reference: `${ref.book} ${ref.chapter}:${v.number}`, text: v.text }));
        if (verses.length > 1)
          options.unshift({
            reference: `${ref.book} ${ref.chapter}:1-${verses.length}`,
            text: verses.slice(0, 3).map((v) => v.text).join(" ") + (verses.length > 3 ? " ..." : ""),
          });
        setResults(options);
      }
    } catch (err) {
      console.error("Verse search error:", err);
      setLookupHint("Could not load this reference. Check the book and chapter.");
    } finally {
      setSearching(false);
    }
  }, []);

  const openChannel = (id: string) => {
    setActiveChannel(id);
    setMessages(CHANNEL_MESSAGES[id] || []);
  };

  const closeScripturePanel = () => {
    setScripturePanelOpen(false);
    setLookupQuery("");
    setResults([]);
    setLookupHint(null);
  };

  const send = () => {
    if (!draft.trim() && !attachedVerse) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        author: "You",
        text: draft,
        isOwn: true,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        verse: attachedVerse || undefined,
      },
    ]);
    setDraft("");
    setAttachedVerse(null);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const channel = GROUP_CHANNELS.find((c) => c.id === activeChannel);

  if (activeChannel) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveChannel(null)}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
              <h2 className="section-header text-lg">{channel?.name}</h2>
              <p className="text-xs text-muted-foreground font-body mt-0.5 flex items-center gap-1">
                <Users size={12} />
                {channel?.members} members
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="Start the conversation"
              description={`No messages in ${channel?.name} yet. Say hello, share a verse, or ask for prayer — the group is listening.`}
              decoration="messages"
            />
          ) : (
            messages.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`${m.isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {!m.isOwn && <span className="text-xs font-body font-medium text-muted-foreground px-1">{m.author}</span>}
                  <div className={`chat-bubble ${m.isOwn ? "chat-bubble-own" : "chat-bubble-other"}`}>
                    {m.text && <p>{m.text}</p>}
                    {m.verse && (
                      <div
                        className={`mt-2 border-l-4 border-accent rounded-r-lg p-3 ${
                          m.isOwn ? "bg-primary-foreground/10" : "bg-background"
                        }`}
                      >
                        <p className="font-display text-sm italic leading-relaxed">"{m.verse.text}"</p>
                        <p className="text-xs font-body font-semibold text-accent mt-1">— {m.verse.reference}</p>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-body px-1">{m.time}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <AnimatePresence>
          {scripturePanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mx-6 mb-2 bg-card border border-border rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-body font-semibold">Insert Scripture</span>
                <button onClick={closeScripturePanel} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      lookUpVerse(lookupQuery);
                    }
                  }}
                  placeholder="e.g. John 3:16, Psalm 23, Romans 8:28-30"
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <button
                onClick={() => lookUpVerse(lookupQuery)}
                disabled={searching || !lookupQuery.trim()}
                className="w-full mb-3 gold-button text-xs py-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {searching ? <LoaderCircle size={14} className="animate-spin" /> : <Search size={14} />}
                {searching ? "Looking up..." : "Look up verse"}
              </button>
              {lookupHint && <p className="text-xs font-body text-muted-foreground mb-3 text-center">{lookupHint}</p>}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {results.map((r) => (
                  <button
                    key={r.reference}
                    onClick={() => {
                      setAttachedVerse(r);
                      closeScripturePanel();
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <p className="text-xs font-body font-semibold text-accent">{r.reference}</p>
                    <p className="text-xs font-body text-muted-foreground line-clamp-2 mt-0.5">{r.text}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {attachedVerse && (
          <div className="mx-6 mb-2 bg-accent/10 border border-accent/20 rounded-lg p-3 flex items-start justify-between">
            <div>
              <p className="text-xs font-body font-semibold text-accent">{attachedVerse.reference}</p>
              <p className="text-xs font-body text-foreground/70 line-clamp-1">{attachedVerse.text}</p>
            </div>
            <button onClick={() => setAttachedVerse(null)} className="text-muted-foreground hover:text-foreground ml-2 mt-0.5">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScripturePanelOpen(!scripturePanelOpen)}
              className={`p-2.5 rounded-lg transition-colors ${
                scripturePanelOpen ? "bg-accent text-accent-foreground" : "hover:bg-secondary text-muted-foreground"
              }`}
            >
              <BookOpen size={18} />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-secondary border-none rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button onClick={send} className="gold-button p-2.5">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-border">
        <h2 className="section-header">Community</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">{churchName}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-body font-semibold px-3 mb-2">
            Group Chats
          </p>
          <div className="space-y-0.5">
            {GROUP_CHANNELS.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openChannel(c.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                  {c.icon === "lock" ? <Lock size={16} /> : <Hash size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-body font-medium text-foreground">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground font-body">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground font-body truncate pr-2">
                      <span className="font-medium">{c.lastAuthor}:</span> {c.lastMessage}
                    </p>
                    {c.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-body font-bold flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;

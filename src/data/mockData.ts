/**
 * Demo content shown until the app is connected to a real backend.
 * Each section seeds its state from here, so replacing these exports with
 * API/database calls is the main step towards a live community.
 */
import type { VerseRef } from "@/lib/bible";

// ---------- Dashboard ----------

export const VERSE_OF_THE_DAY: VerseRef = {
  reference: "Lamentations 3:22-23",
  text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
};

export interface Reflection {
  id: number;
  author: string;
  text: string;
  timeAgo: string;
}

export const VERSE_REFLECTIONS: Reflection[] = [
  { id: 1, author: "Sarah M.", text: "This is exactly what I needed today. His faithfulness is unmatched.", timeAgo: "1h ago" },
  { id: 2, author: "David K.", text: "'New every morning' — what a comfort when yesterday was hard.", timeAgo: "2h ago" },
  { id: 3, author: "Grace L.", text: "Great is thy faithfulness! 🙌", timeAgo: "3h ago" },
];

// ---------- Prayer Wall ----------

export const ATTACHABLE_VERSES: VerseRef[] = [
  { reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord." },
  { reference: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him." },
  { reference: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God." },
  { reference: "Psalm 46:1", text: "God is our refuge and strength, an ever-present help in trouble." },
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding." },
  { reference: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
];

export interface PrayerRequest {
  id: number;
  author: string;
  anonymous: boolean;
  text: string;
  prayerCount: number;
  hasPrayed: boolean;
  timeAgo: string;
  category: string;
  verse?: VerseRef;
}

export const PRAYER_REQUESTS: PrayerRequest[] = [
  {
    id: 1,
    author: "Sarah M.",
    anonymous: false,
    text: "Please pray for my mother's recovery from surgery. She's been in the hospital for a week and we're trusting God for healing.",
    prayerCount: 24,
    hasPrayed: false,
    timeAgo: "2h ago",
    category: "Health",
    verse: { reference: "Psalm 46:1", text: "God is our refuge and strength, an ever-present help in trouble." },
  },
  {
    id: 2,
    author: "Anonymous",
    anonymous: true,
    text: "Struggling with anxiety and doubt. Pray that I find peace and strength in God's word.",
    prayerCount: 31,
    hasPrayed: false,
    timeAgo: "4h ago",
    category: "Personal",
    verse: { reference: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
  },
  {
    id: 3,
    author: "David K.",
    anonymous: false,
    text: "Our youth group is starting a new outreach program. Pray for wisdom and open doors in our community.",
    prayerCount: 15,
    hasPrayed: false,
    timeAgo: "6h ago",
    category: "Ministry",
  },
  {
    id: 4,
    author: "Anonymous",
    anonymous: true,
    text: "Praying for restoration in my marriage. We need God's grace and guidance.",
    prayerCount: 42,
    hasPrayed: false,
    timeAgo: "8h ago",
    category: "Family",
    verse: { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding." },
  },
  {
    id: 5,
    author: "Grace L.",
    anonymous: false,
    text: "Thank God! My son got accepted into college. Pray for his transition and that he stays strong in faith.",
    prayerCount: 18,
    hasPrayed: false,
    timeAgo: "12h ago",
    category: "Gratitude",
  },
  {
    id: 6,
    author: "Michael R.",
    anonymous: false,
    text: "Starting a new job next week. Pray for favor and that I can be a light in my workplace.",
    prayerCount: 9,
    hasPrayed: false,
    timeAgo: "1d ago",
    category: "Work",
    verse: { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord." },
  },
];

// ---------- Community ----------

export interface GroupChannel {
  id: string;
  name: string;
  icon: "hash" | "lock";
  lastMessage: string;
  lastAuthor: string;
  unread: number;
  members: number;
  time: string;
}

export const GROUP_CHANNELS: GroupChannel[] = [
  { id: "general", name: "General", icon: "hash", lastMessage: "Good morning everyone! The sermon today was so powerful.", lastAuthor: "Sarah", unread: 3, members: 124, time: "9:30 AM" },
  { id: "youth", name: "Youth Ministry", icon: "hash", lastMessage: "Camp registration is open! 🏕️", lastAuthor: "Pastor Mike", unread: 0, members: 45, time: "Yesterday" },
  { id: "worship", name: "Worship Team", icon: "lock", lastMessage: "Practice moved to Thursday this week", lastAuthor: "Grace", unread: 1, members: 18, time: "10:15 AM" },
  { id: "bible-study", name: "Bible Study", icon: "hash", lastMessage: "Starting Romans next week, chapters 1-3", lastAuthor: "David", unread: 5, members: 32, time: "8:00 AM" },
  { id: "mens-group", name: "Men's Fellowship", icon: "lock", lastMessage: "Breakfast meetup Saturday at 7am", lastAuthor: "James", unread: 0, members: 28, time: "Mon" },
  { id: "prayer-team", name: "Prayer Team", icon: "lock", lastMessage: "Please keep the Johnson family in prayer", lastAuthor: "Elder Ruth", unread: 2, members: 15, time: "11:00 AM" },
];

export interface ChatMessage {
  id: number;
  author: string;
  text: string;
  isOwn: boolean;
  time: string;
  verse?: VerseRef;
}

export const CHANNEL_MESSAGES: Record<string, ChatMessage[]> = {
  general: [
    { id: 1, author: "Sarah", text: "Good morning everyone! The sermon today was so powerful.", isOwn: false, time: "9:30 AM" },
    { id: 2, author: "You", text: "It really was! The part about grace really spoke to me.", isOwn: true, time: "9:32 AM" },
    {
      id: 3,
      author: "David",
      text: "This verse kept coming to mind during worship:",
      isOwn: false,
      time: "9:35 AM",
      verse: {
        reference: "Isaiah 40:31",
        text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
      },
    },
    { id: 4, author: "Grace", text: "Amen! 🙏 That's beautiful.", isOwn: false, time: "9:36 AM" },
    { id: 5, author: "You", text: "Does anyone want to start a reading plan for Romans this week?", isOwn: true, time: "9:40 AM" },
  ],
  "bible-study": [
    { id: 1, author: "David", text: "Starting Romans next week, chapters 1-3. Please read ahead!", isOwn: false, time: "8:00 AM" },
    { id: 2, author: "You", text: "Looking forward to it! Romans is one of my favorites.", isOwn: true, time: "8:05 AM" },
  ],
};

// ---------- Prayer Journal ----------

export interface JournalEntry {
  id: number;
  text: string;
  date: string;
  answered: boolean;
}

export const JOURNAL_ENTRIES: JournalEntry[] = [
  { id: 1, text: "Pray for guidance in my career decision — should I take the new role?", date: "Mar 12, 2026", answered: false },
  { id: 2, text: "Healing for my grandmother's health.", date: "Mar 8, 2026", answered: false },
  { id: 3, text: "Asked God for peace during a difficult season. He provided through community and His word.", date: "Feb 28, 2026", answered: true },
  { id: 4, text: "Prayed for a friend who was lost. They came back to church last Sunday!", date: "Feb 15, 2026", answered: true },
];

// ---------- Live Prayer ----------

export interface LiveParticipant {
  id: number;
  name: string;
  isPraying: boolean;
  joinedAgo: string;
}

export const LIVE_PARTICIPANTS: LiveParticipant[] = [
  { id: 1, name: "Sarah M.", isPraying: true, joinedAgo: "12m" },
  { id: 2, name: "David K.", isPraying: false, joinedAgo: "8m" },
  { id: 3, name: "Grace L.", isPraying: true, joinedAgo: "5m" },
  { id: 4, name: "Michael R.", isPraying: false, joinedAgo: "3m" },
  { id: 5, name: "Rachel T.", isPraying: true, joinedAgo: "1m" },
];

export const LIVE_PRAYER_POINTS = [
  { id: 1, text: "Pray for healing in our community — several members are dealing with illness.", author: "Pastor James", prayingNow: 4 },
  { id: 2, text: "Lift up the upcoming mission trip team as they prepare to serve.", author: "Sarah M.", prayingNow: 3 },
  { id: 3, text: "Guidance and wisdom for our church leadership during this season of growth.", author: "David K.", prayingNow: 2 },
];

export const UPCOMING_SESSIONS = [
  { name: "Morning Devotion", time: "Tomorrow 6:00 AM", members: 8 },
  { name: "Youth Prayer Night", time: "Friday 7:00 PM", members: 12 },
];

// ---------- Worship ----------

export type WorshipType = "song" | "hymn" | "spoken-word";

export interface WorshipShare {
  id: number;
  author: string;
  title: string;
  artist: string;
  type: WorshipType;
  note: string;
  likes: number;
  hasLiked: boolean;
  timeAgo: string;
  url?: string;
}

export const WORSHIP_SHARES: WorshipShare[] = [
  { id: 1, author: "Sarah M.", title: "Goodness of God", artist: "Bethel Music", type: "song", note: "This song has been my anthem this week. His goodness never fails.", likes: 14, hasLiked: false, timeAgo: "1h ago", url: "https://open.spotify.com" },
  { id: 2, author: "David K.", title: "It Is Well With My Soul", artist: "Horatio Spafford", type: "hymn", note: "A classic that grounds me when life gets turbulent. The story behind it makes it even more powerful.", likes: 22, hasLiked: false, timeAgo: "3h ago" },
  { id: 3, author: "Grace L.", title: "Firm Foundation", artist: "Cody Carnes", type: "song", note: "Been on repeat during my morning prayers. 'I won't be shaken' 🙌", likes: 8, hasLiked: false, timeAgo: "5h ago", url: "https://open.spotify.com" },
  { id: 4, author: "Michael R.", title: "Great Is Thy Faithfulness", artist: "Thomas Chisholm", type: "hymn", note: "Morning by morning new mercies I see. Every word is true.", likes: 31, hasLiked: false, timeAgo: "8h ago" },
  { id: 5, author: "Rachel T.", title: "Surrounded (Fight My Battles)", artist: "UPPERROOM", type: "song", note: "Powerful worship moment when this played at service last Sunday.", likes: 16, hasLiked: false, timeAgo: "1d ago", url: "https://open.spotify.com" },
];

// ---------- Faith Journey ----------

export type MilestoneIcon = "baptism" | "prayer" | "bible" | "church" | "testimony" | "general";

export interface Milestone {
  id: number;
  title: string;
  description: string;
  date: string;
  icon: MilestoneIcon;
  isPublic: boolean;
}

export const MILESTONES: Milestone[] = [
  { id: 1, title: "Baptized", description: "Publicly declared my faith and was baptized at Grace Community Church. A day I'll never forget.", date: "Jan 15, 2024", icon: "baptism", isPublic: true },
  { id: 2, title: "Answered Prayer", description: "After months of praying, God opened the door for a new job that aligns with my calling.", date: "Jun 8, 2025", icon: "prayer", isPublic: true },
  { id: 3, title: "Read Through the Bible", description: "Completed reading the entire Bible in one year. What a transformative journey.", date: "Dec 31, 2025", icon: "bible", isPublic: true },
  { id: 4, title: "First Year at Grace", description: "Celebrating one year of being part of the Grace Community family.", date: "Feb 1, 2026", icon: "church", isPublic: true },
  { id: 5, title: "Overcame Anxiety", description: "Through prayer and community support, I've found lasting peace. God is faithful.", date: "Mar 1, 2026", icon: "testimony", isPublic: false },
];

// ---------- Prayer Partners ----------

export interface PrayerPartner {
  id: number;
  name: string;
  role: string;
  initials: string;
  available: boolean;
  bio: string;
  prayerFocus: string[];
  streak: number;
  lastActive: string;
  verse: string;
  verseRef: string;
  messages: ChatMessage[];
}

export const PRAYER_PARTNERS: PrayerPartner[] = [
  {
    id: 1,
    name: "Pastor David K.",
    role: "Senior Pastor",
    initials: "DK",
    available: true,
    bio: "30+ years in ministry. Always here to listen and pray with you.",
    prayerFocus: ["Healing", "Guidance", "Family"],
    streak: 42,
    lastActive: "Online now",
    verse: "The Lord is near to all who call on him.",
    verseRef: "Psalm 145:18",
    messages: [{ id: 1, author: "Pastor David K.", text: "Welcome! I'm honored to pray alongside you. What's on your heart today?", isOwn: false, time: "Today" }],
  },
  {
    id: 2,
    name: "Sister Grace L.",
    role: "Women's Ministry Lead",
    initials: "GL",
    available: true,
    bio: "Passionate about walking with women through every season of life.",
    prayerFocus: ["Women's Health", "Relationships", "Purpose"],
    streak: 28,
    lastActive: "5 min ago",
    verse: "She is clothed with strength and dignity.",
    verseRef: "Proverbs 31:25",
    messages: [{ id: 1, author: "Sister Grace L.", text: "Hi there! I'd love to pray with you. Feel free to share whatever is on your mind 💛", isOwn: false, time: "Today" }],
  },
  {
    id: 3,
    name: "Elder James M.",
    role: "Church Elder",
    initials: "JM",
    available: true,
    bio: "Retired teacher. Believes in the power of consistent, faithful prayer.",
    prayerFocus: ["Wisdom", "Peace", "Finances"],
    streak: 65,
    lastActive: "1 hr ago",
    verse: "If any of you lacks wisdom, let him ask God.",
    verseRef: "James 1:5",
    messages: [{ id: 1, author: "Elder James M.", text: "God bless you for reaching out. Let's bring your needs before the Lord together.", isOwn: false, time: "Today" }],
  },
  {
    id: 4,
    name: "Deacon Ruth A.",
    role: "Deacon",
    initials: "RA",
    available: false,
    bio: "Serving faithfully for 12 years. Prayer is her greatest joy.",
    prayerFocus: ["Children", "Church Growth", "Missions"],
    streak: 19,
    lastActive: "Yesterday",
    verse: "Train up a child in the way he should go.",
    verseRef: "Proverbs 22:6",
    messages: [{ id: 1, author: "Deacon Ruth A.", text: "Hello! I'm not available right now but leave your prayer request and I'll lift it up.", isOwn: false, time: "Yesterday" }],
  },
  {
    id: 5,
    name: "Brother Marcus T.",
    role: "Youth Pastor",
    initials: "MT",
    available: true,
    bio: "Heart for young people and anyone navigating life's tough transitions.",
    prayerFocus: ["Youth", "Identity", "Anxiety"],
    streak: 33,
    lastActive: "Online now",
    verse: "Cast all your anxiety on him because he cares for you.",
    verseRef: "1 Peter 5:7",
    messages: [{ id: 1, author: "Brother Marcus T.", text: "Hey! No matter what you're going through, you're not alone. Let's pray 🙏", isOwn: false, time: "Today" }],
  },
];

// ---------- Soul Check ----------

export type SoulDimension = "peace" | "joy" | "faith" | "connection" | "purpose";

export const SOUL_CHECK_HISTORY: ({ week: string } & Record<SoulDimension, number>)[] = [
  { week: "Mar 3", peace: 3, joy: 4, faith: 4, connection: 2, purpose: 3 },
  { week: "Mar 10", peace: 3, joy: 3, faith: 3, connection: 3, purpose: 3 },
  { week: "Mar 17", peace: 4, joy: 4, faith: 4, connection: 3, purpose: 4 },
  { week: "Mar 24", peace: 4, joy: 5, faith: 4, connection: 4, purpose: 3 },
];

export const CHURCH_PULSE = {
  totalCheckins: 87,
  totalMembers: 124,
  averages: { peace: 3.4, joy: 3.8, faith: 4.1, connection: 3.0, purpose: 3.5 } as Record<SoulDimension, number>,
  trends: { peace: "up", joy: "up", faith: "stable", connection: "down", purpose: "up" } as Record<SoulDimension, "up" | "down" | "stable">,
  needsPrayer: { connection: 32, peace: 18, purpose: 15 } as Partial<Record<SoulDimension, number>>,
};

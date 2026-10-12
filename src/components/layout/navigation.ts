import {
  BookOpen,
  Bookmark,
  Flame,
  Heart,
  HeartPulse,
  House,
  MessageCircle,
  Music,
  PenLine,
  Settings,
  ShieldCheck,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SectionId =
  | "home"
  | "bible"
  | "bookmarks"
  | "prayers"
  | "live-prayer"
  | "partners"
  | "soul-check"
  | "worship"
  | "milestones"
  | "chat"
  | "journal"
  | "admin"
  | "settings";

export interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  /** Only shown to church owners and admins. */
  adminOnly?: boolean;
}

export const visibleFor = (items: NavItem[], isAdmin: boolean) => items.filter((item) => isAdmin || !item.adminOnly);

/** Desktop sidebar order. */
export const SIDEBAR_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "bible", label: "Bible", icon: BookOpen },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "prayers", label: "Prayer Wall", icon: Heart },
  { id: "live-prayer", label: "Live Prayer", icon: Flame },
  { id: "partners", label: "Prayer Partners", icon: Users },
  { id: "soul-check", label: "Soul Check", icon: HeartPulse },
  { id: "worship", label: "Worship", icon: Music },
  { id: "milestones", label: "Faith Journey", icon: Star },
  { id: "chat", label: "Community", icon: MessageCircle },
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "admin", label: "Church Admin", icon: ShieldCheck, adminOnly: true },
  { id: "settings", label: "Settings", icon: Settings },
];

/** Mobile bottom bar. */
export const MOBILE_PRIMARY_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "bible", label: "Bible", icon: BookOpen },
  { id: "prayers", label: "Prayers", icon: Heart },
  { id: "live-prayer", label: "Live", icon: Flame },
];

/** Mobile "More" sheet. */
export const MOBILE_MORE_ITEMS: NavItem[] = [
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "soul-check", label: "Soul Check", icon: HeartPulse },
  { id: "worship", label: "Worship", icon: Music },
  { id: "milestones", label: "Faith Journey", icon: Star },
  { id: "partners", label: "Prayer Partners", icon: Users },
  { id: "chat", label: "Community", icon: MessageCircle },
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
  { id: "settings", label: "Settings", icon: Settings },
];

/** Order used to decide the slide direction of page transitions. */
export const SECTION_ORDER: SectionId[] = [
  "home",
  "bible",
  "prayers",
  "live-prayer",
  "partners",
  "soul-check",
  "worship",
  "milestones",
  "chat",
  "journal",
  "bookmarks",
  "admin",
  "settings",
];

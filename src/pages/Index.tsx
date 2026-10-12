import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AudioPlayerBar from "@/components/AudioPlayerBar";
import Onboarding from "@/components/Onboarding";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileNav from "@/components/layout/MobileNav";
import { SECTION_ORDER, type SectionId } from "@/components/layout/navigation";
import BibleReader from "@/components/sections/BibleReader";
import Bookmarks from "@/components/sections/Bookmarks";
import Community from "@/components/sections/Community";
import Dashboard from "@/components/sections/Dashboard";
import FaithJourney from "@/components/sections/FaithJourney";
import LivePrayer from "@/components/sections/LivePrayer";
import PrayerJournal from "@/components/sections/PrayerJournal";
import PrayerPartners from "@/components/sections/PrayerPartners";
import PrayerWall from "@/components/sections/PrayerWall";
import Settings from "@/components/sections/Settings";
import SoulCheck from "@/components/sections/SoulCheck";
import Worship from "@/components/sections/Worship";
import AdminPanel from "@/components/sections/admin/AdminPanel";
import { AudioBibleProvider } from "@/contexts/AudioBibleContext";
import { useChurch } from "@/contexts/ChurchContext";
import { useDailyVerseNotifications } from "@/hooks/useDailyVerseNotifications";

const pageVariants = {
  enter: (direction: number) => ({ x: direction * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -60, opacity: 0 }),
};

const AppShell = () => {
  const [section, setSection] = useState<SectionId>("home");
  const previousSection = useRef<SectionId>("home");
  const { isAdmin } = useChurch();
  useDailyVerseNotifications();

  // Slide forward or back depending on where the new section sits in the nav order
  const direction = useMemo(
    () => (SECTION_ORDER.indexOf(section) >= SECTION_ORDER.indexOf(previousSection.current) ? 1 : -1),
    [section],
  );

  const navigate = (next: SectionId) => {
    previousSection.current = section;
    setSection(next);
  };

  const renderSection = () => {
    switch (section) {
      case "bible":
        return <BibleReader />;
      case "prayers":
        return <PrayerWall />;
      case "chat":
        return <Community />;
      case "journal":
        return <PrayerJournal />;
      case "live-prayer":
        return <LivePrayer />;
      case "worship":
        return <Worship />;
      case "milestones":
        return <FaithJourney />;
      case "partners":
        return <PrayerPartners />;
      case "soul-check":
        return <SoulCheck />;
      case "bookmarks":
        return <Bookmarks />;
      case "settings":
        return <Settings />;
      case "admin":
        return isAdmin ? <AdminPanel /> : <Dashboard onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <AppSidebar activeSection={section} onNavigate={navigate} />
      </div>
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={section}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
            className="h-full"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
      <MobileNav activeSection={section} onNavigate={navigate} />
      <AudioPlayerBar />
      <Onboarding />
    </div>
  );
};

const Index = () => {
  const { current } = useChurch();
  return (
    <AudioBibleProvider>
      {/* Remount per church so switching churches starts fresh on Home */}
      <AppShell key={current?.church_id} />
    </AudioBibleProvider>
  );
};

export default Index;

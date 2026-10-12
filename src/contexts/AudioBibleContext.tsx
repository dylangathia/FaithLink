import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Verse } from "@/lib/bible";

interface AudioBibleState {
  isPlaying: boolean;
  isPaused: boolean;
  reference: string | null;
  currentVerse: number | null;
  totalVerses: number;
  rate: number;
  play: (book: string, chapter: number, verses: Verse[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  setRate: (rate: number) => void;
}

const AudioBibleContext = createContext<AudioBibleState | null>(null);

/** Reads chapters aloud verse-by-verse using the browser's Web Speech API. */
export const AudioBibleProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [rate, setRateState] = useState(1);
  const versesRef = useRef<Verse[]>([]);
  const indexRef = useRef(0);
  const rateRef = useRef(1);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speakAt = useCallback(
    (index: number) => {
      if (!supported) return;
      const verses = versesRef.current;
      if (index < 0 || index >= verses.length) {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentVerse(null);
        return;
      }
      indexRef.current = index;
      setCurrentVerse(verses[index].number);
      const utterance = new SpeechSynthesisUtterance(verses[index].text);
      utterance.rate = rateRef.current;
      utterance.pitch = 1;
      utterance.onend = () => {
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.paused) speakAt(indexRef.current + 1);
      };
      utterance.onerror = () => {};
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [supported],
  );

  const play = useCallback(
    (book: string, chapter: number, verses: Verse[], startIndex = 0) => {
      if (!supported || verses.length === 0) return;
      versesRef.current = verses;
      setReference(`${book} ${chapter}`);
      setIsPlaying(true);
      setIsPaused(false);
      speakAt(startIndex);
    },
    [supported, speakAt],
  );

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerse(null);
    setReference(null);
  }, [supported]);

  const next = useCallback(() => {
    if (indexRef.current < versesRef.current.length - 1) {
      speakAt(indexRef.current + 1);
      setIsPaused(false);
    }
  }, [speakAt]);

  const prev = useCallback(() => {
    if (indexRef.current > 0) {
      speakAt(indexRef.current - 1);
      setIsPaused(false);
    }
  }, [speakAt]);

  const setRate = useCallback(
    (value: number) => {
      rateRef.current = value;
      setRateState(value);
      // Restart the current verse so the new speed takes effect immediately
      if (isPlaying && !isPaused) speakAt(indexRef.current);
    },
    [isPlaying, isPaused, speakAt],
  );

  useEffect(
    () => () => {
      if (supported) window.speechSynthesis.cancel();
    },
    [supported],
  );

  return (
    <AudioBibleContext.Provider
      value={{
        isPlaying,
        isPaused,
        reference,
        currentVerse,
        totalVerses: versesRef.current.length,
        rate,
        play,
        pause,
        resume,
        stop,
        next,
        prev,
        setRate,
      }}
    >
      {children}
    </AudioBibleContext.Provider>
  );
};

export const useAudioBible = () => {
  const ctx = useContext(AudioBibleContext);
  if (!ctx) throw new Error("useAudioBible must be used within AudioBibleProvider");
  return ctx;
};

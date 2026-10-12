/**
 * Bible text source. The Lovable build called a Supabase edge function
 * ("get-bible-chapter"); locally we call the free public bible-api.com directly.
 * Swap the body of fetchChapter if you later host your own endpoint.
 */
import { BIBLE_BOOKS } from "./books";

export interface Verse {
  number: number;
  text: string;
}

export interface VerseRef {
  reference: string;
  text: string;
}

const API_BASE = "https://bible-api.com";
const cache = new Map<string, Verse[]>();

export async function fetchChapter(book: string, chapter: number, translation = "kjv"): Promise<Verse[]> {
  const key = `${translation}:${book}:${chapter}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/${encodeURIComponent(`${book} ${chapter}`)}?translation=${translation}`);
  if (!res.ok) throw new Error(`Bible API returned ${res.status}`);
  const data: { verses?: { verse: number; text: string }[] } = await res.json();
  if (!data.verses?.length) throw new Error("No verses returned");

  const verses = data.verses.map((v) => ({ number: v.verse, text: v.text.replace(/\s+/g, " ").trim() }));
  cache.set(key, verses);
  return verses;
}

export interface ParsedReference {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

/** Parses references like "John 3:16", "Psalm 23", "Romans 8:28-30". */
export function parseReference(input: string): ParsedReference | null {
  const match = input.match(/^(\d?\s?[A-Za-z\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;
  const query = match[1].trim().toLowerCase();
  const book = BIBLE_BOOKS.find((b) => b.name.toLowerCase() === query || b.name.toLowerCase().startsWith(query));
  if (!book) return null;
  const verseStart = match[3] ? parseInt(match[3]) : undefined;
  const verseEnd = match[4] ? parseInt(match[4]) : verseStart;
  return { book: book.name, chapter: parseInt(match[2]), verseStart, verseEnd };
}

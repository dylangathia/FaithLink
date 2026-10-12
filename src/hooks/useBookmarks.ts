import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sanctuary-bookmarks";
const CHANGE_EVENT = "sanctuary-bookmarks-changed";

export interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  note: string;
  createdAt: number;
}

const bookmarkId = (book: string, chapter: number, verse: number) => `${book}-${chapter}-${verse}`;

const load = (): Bookmark[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const save = (bookmarks: Bookmark[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
};

/** Bookmarks persisted to localStorage and kept in sync across components and tabs. */
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);

  useEffect(() => {
    const sync = () => setBookmarks(load());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isBookmarked = useCallback(
    (book: string, chapter: number, verse: number) => bookmarks.some((b) => b.id === bookmarkId(book, chapter, verse)),
    [bookmarks],
  );

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "id" | "createdAt"> & { createdAt?: number }) => {
    const id = bookmarkId(bookmark.book, bookmark.chapter, bookmark.verse);
    const next = [{ ...bookmark, id, createdAt: bookmark.createdAt ?? Date.now() }, ...load().filter((b) => b.id !== id)];
    save(next);
    setBookmarks(next);
  }, []);

  const updateNote = useCallback((id: string, note: string) => {
    const next = load().map((b) => (b.id === id ? { ...b, note } : b));
    save(next);
    setBookmarks(next);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    const next = load().filter((b) => b.id !== id);
    save(next);
    setBookmarks(next);
  }, []);

  return { bookmarks, isBookmarked, addBookmark, updateNote, removeBookmark, bookmarkId };
};

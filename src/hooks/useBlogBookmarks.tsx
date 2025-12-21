import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'blog_bookmarks';

export function useBlogBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch {
        setBookmarks([]);
      }
    }
  }, []);

  const saveBookmarks = useCallback((newBookmarks: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    const isBookmarked = bookmarks.includes(slug);
    if (isBookmarked) {
      saveBookmarks(bookmarks.filter(s => s !== slug));
    } else {
      saveBookmarks([...bookmarks, slug]);
    }
    return !isBookmarked;
  }, [bookmarks, saveBookmarks]);

  const isBookmarked = useCallback((slug: string) => {
    return bookmarks.includes(slug);
  }, [bookmarks]);

  const removeBookmark = useCallback((slug: string) => {
    saveBookmarks(bookmarks.filter(s => s !== slug));
  }, [bookmarks, saveBookmarks]);

  return { bookmarks, toggleBookmark, isBookmarked, removeBookmark };
}

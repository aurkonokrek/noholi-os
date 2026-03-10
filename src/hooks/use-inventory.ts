import { useState, useCallback, useMemo, useEffect } from "react";
import { parseBooksExcel } from "@/lib/parse-books-excel";

export type BookStatus = "Available" | "Unavailable" | "Out of Stock";

export type BookLanguage = "Bangla" | "English";

export interface Book {
  id: string;
  title: string;
  titleBangla: string;
  author: string;
  authorBangla: string;
  genre: string;
  category: string;
  language: BookLanguage;
  isbn: string;
  publisher: string;
  yearOfPublication: string;
  edition: string;
  condition: string;
  pages: number;
  price: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  reservedCopies: number;
  location: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export function deriveStatus(book: Book): BookStatus {
  if (book.totalCopies === 0) return "Out of Stock";
  if (book.availableCopies > 0) return "Available";
  return "Unavailable";
}

export function isLowStock(book: Book): boolean {
  return book.availableCopies > 0 && book.availableCopies <= 2;
}

const now = () => new Date().toISOString();

type Result = { success: true; error?: undefined } | { success: false; error: string };

export function useInventory() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parseBooksExcel("/data/All_Book_List.xlsx")
      .then((parsed) => {
        setBooks(parsed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to parse books Excel:", err);
        setLoading(false);
      });
  }, []);

  const updateBook = useCallback((id: string, updater: (b: Book) => Book) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
  }, []);

  const reserve = useCallback((id: string): Result => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (book.availableCopies <= 0) return { success: false, error: "Currently unavailable" };
    updateBook(id, (b) => ({
      ...b,
      availableCopies: b.availableCopies - 1,
      reservedCopies: b.reservedCopies + 1,
      updatedAt: now(),
    }));
    return { success: true };
  }, [books, updateBook]);

  const issue = useCallback((id: string): Result => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (book.reservedCopies > 0) {
      updateBook(id, (b) => ({
        ...b,
        reservedCopies: b.reservedCopies - 1,
        issuedCopies: b.issuedCopies + 1,
        updatedAt: now(),
      }));
      return { success: true };
    }
    if (book.availableCopies > 0) {
      updateBook(id, (b) => ({
        ...b,
        availableCopies: b.availableCopies - 1,
        issuedCopies: b.issuedCopies + 1,
        updatedAt: now(),
      }));
      return { success: true };
    }
    return { success: false, error: "No copies available to issue" };
  }, [books, updateBook]);

  const returnBook = useCallback((id: string): Result => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (book.issuedCopies <= 0) return { success: false, error: "No issued copies to return" };
    updateBook(id, (b) => ({
      ...b,
      issuedCopies: b.issuedCopies - 1,
      availableCopies: b.availableCopies + 1,
      updatedAt: now(),
    }));
    return { success: true };
  }, [books, updateBook]);

  const cancelReservation = useCallback((id: string): Result => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (book.reservedCopies <= 0) return { success: false, error: "No reservations to cancel" };
    updateBook(id, (b) => ({
      ...b,
      reservedCopies: b.reservedCopies - 1,
      availableCopies: b.availableCopies + 1,
      updatedAt: now(),
    }));
    return { success: true };
  }, [books, updateBook]);

  const adjustStock = useCallback((id: string, newTotal: number): Result => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (newTotal < 0) return { success: false, error: "Total copies cannot be negative" };
    const minRequired = book.issuedCopies + book.reservedCopies;
    if (newTotal < minRequired) {
      return { success: false, error: `Cannot go below ${minRequired} (${book.issuedCopies} issued + ${book.reservedCopies} reserved)` };
    }
    const diff = newTotal - book.totalCopies;
    updateBook(id, (b) => ({
      ...b,
      totalCopies: newTotal,
      availableCopies: b.availableCopies + diff,
      updatedAt: now(),
    }));
    return { success: true };
  }, [books, updateBook]);

  const deleteBook = useCallback((id: string): Result => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (book.issuedCopies > 0 || book.reservedCopies > 0) {
      return { success: false, error: "Cannot delete a book with issued or reserved copies" };
    }
    setBooks((prev) => prev.filter((b) => b.id !== id));
    return { success: true };
  }, [books]);

  const addBook = useCallback((book: Omit<Book, "id" | "createdAt" | "updatedAt">) => {
    const id = `BK-${String(books.length + 1).padStart(4, "0")}`;
    const newBook: Book = { ...book, id, createdAt: now(), updatedAt: now() };
    setBooks((prev) => [newBook, ...prev]);
    return id;
  }, [books.length]);

  const addBooks = useCallback((newBooks: Omit<Book, "id" | "createdAt" | "updatedAt">[]) => {
    setBooks((prev) => {
      let nextIdx = prev.length + 1;
      const mapped = newBooks.map((b) => {
        const id = `BK-${String(nextIdx++).padStart(4, "0")}`;
        return { ...b, id, createdAt: now(), updatedAt: now() } as Book;
      });
      return [...mapped, ...prev];
    });
    return newBooks.length;
  }, []);

  const updateCover = useCallback((id: string, thumbnail: string) => {
    updateBook(id, (b) => ({ ...b, thumbnail, updatedAt: now() }));
  }, [updateBook]);

  const uniqueGenres = useMemo(() => {
    const genres = new Set(books.map((b) => b.genre));
    return ["All", ...Array.from(genres).sort()];
  }, [books]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(books.map((b) => b.category));
    return ["All", ...Array.from(categories).sort()];
  }, [books]);

  const stats = useMemo(() => ({
    total: books.length,
    totalCopies: books.reduce((s, b) => s + b.totalCopies, 0),
    available: books.reduce((s, b) => s + b.availableCopies, 0),
    issued: books.reduce((s, b) => s + b.issuedCopies, 0),
    reserved: books.reduce((s, b) => s + b.reservedCopies, 0),
    lowStock: books.filter(isLowStock).length,
  }), [books]);

  return { books, loading, stats, uniqueGenres, uniqueCategories, reserve, issue, returnBook, cancelReservation, adjustStock, deleteBook };
}

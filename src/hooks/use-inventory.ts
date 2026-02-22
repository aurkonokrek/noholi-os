import { useState, useCallback, useMemo } from "react";

export type BookStatus = "Available" | "Unavailable" | "Out of Stock";

export type BookLanguage = "Bangla" | "English";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  language: BookLanguage;
  isbn: string;
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

const SEED: Book[] = [
  { id: "BK-001", title: "Things Fall Apart", author: "Chinua Achebe", genre: "Fiction", language: "English", isbn: "978-0385474542", totalCopies: 5, availableCopies: 3, issuedCopies: 1, reservedCopies: 1, location: "Shelf A-12", createdAt: "2025-06-01", updatedAt: "2026-02-20" },
  { id: "BK-002", title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", language: "English", isbn: "978-0062316097", totalCopies: 3, availableCopies: 0, issuedCopies: 2, reservedCopies: 1, location: "Shelf B-03", createdAt: "2025-06-05", updatedAt: "2026-02-19" },
  { id: "BK-003", title: "1984", author: "George Orwell", genre: "Fiction", language: "English", isbn: "978-0451524935", totalCopies: 4, availableCopies: 2, issuedCopies: 2, reservedCopies: 0, location: "Shelf A-07", createdAt: "2025-06-10", updatedAt: "2026-02-18" },
  { id: "BK-004", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", language: "English", isbn: "978-0743273565", totalCopies: 2, availableCopies: 1, issuedCopies: 1, reservedCopies: 0, location: "Shelf A-14", createdAt: "2025-07-01", updatedAt: "2026-02-17" },
  { id: "BK-005", title: "Beloved", author: "Toni Morrison", genre: "Fiction", language: "English", isbn: "978-1400033416", totalCopies: 3, availableCopies: 0, issuedCopies: 3, reservedCopies: 0, location: "Shelf C-01", createdAt: "2025-07-15", updatedAt: "2026-02-16" },
  { id: "BK-006", title: "Americanah", author: "Chimamanda Ngozi Adichie", genre: "Fiction", language: "English", isbn: "978-0307455925", totalCopies: 6, availableCopies: 4, issuedCopies: 1, reservedCopies: 1, location: "Shelf A-20", createdAt: "2025-08-01", updatedAt: "2026-02-15" },
  { id: "BK-007", title: "Atomic Habits", author: "James Clear", genre: "Self-Help", language: "English", isbn: "978-0735211292", totalCopies: 4, availableCopies: 1, issuedCopies: 2, reservedCopies: 1, location: "Shelf D-05", createdAt: "2025-08-10", updatedAt: "2026-02-14" },
  { id: "BK-008", title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", genre: "Fiction", language: "English", isbn: "978-1400095209", totalCopies: 2, availableCopies: 2, issuedCopies: 0, reservedCopies: 0, location: "Shelf A-21", createdAt: "2025-09-01", updatedAt: "2026-02-13" },
  { id: "BK-009", title: "Educated", author: "Tara Westover", genre: "Memoir", language: "English", isbn: "978-0399590504", totalCopies: 3, availableCopies: 0, issuedCopies: 2, reservedCopies: 1, location: "Shelf B-11", createdAt: "2025-09-15", updatedAt: "2026-02-12" },
  { id: "BK-010", title: "Weep Not, Child", author: "Ngũgĩ wa Thiong'o", genre: "Fiction", language: "English", isbn: "978-0143106692", totalCopies: 0, availableCopies: 0, issuedCopies: 0, reservedCopies: 0, location: "Shelf A-03", createdAt: "2025-10-01", updatedAt: "2026-02-11" },
  { id: "BK-011", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Non-Fiction", language: "English", isbn: "978-0374533557", totalCopies: 5, availableCopies: 2, issuedCopies: 3, reservedCopies: 0, location: "Shelf B-08", createdAt: "2025-10-15", updatedAt: "2026-02-10" },
  { id: "BK-012", title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", language: "Bangla", isbn: "978-0062315007", totalCopies: 7, availableCopies: 5, issuedCopies: 1, reservedCopies: 1, location: "Shelf A-09", createdAt: "2025-11-01", updatedAt: "2026-02-09" },
];

type Result = { success: true; error?: undefined } | { success: false; error: string };

export function useInventory() {
  const [books, setBooks] = useState<Book[]>(SEED);

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

  const stats = useMemo(() => ({
    total: books.length,
    totalCopies: books.reduce((s, b) => s + b.totalCopies, 0),
    available: books.reduce((s, b) => s + b.availableCopies, 0),
    issued: books.reduce((s, b) => s + b.issuedCopies, 0),
    reserved: books.reduce((s, b) => s + b.reservedCopies, 0),
    lowStock: books.filter(isLowStock).length,
  }), [books]);

  return { books, stats, reserve, issue, returnBook, cancelReservation, adjustStock, deleteBook };
}

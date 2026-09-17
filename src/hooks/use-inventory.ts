import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

type Result = { success: true; error?: undefined } | { success: false; error: string };

function dbToBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    titleBangla: row.title_bangla ?? "",
    author: row.author,
    authorBangla: row.author_bangla ?? "",
    genre: row.genre ?? "Uncategorized",
    category: row.category ?? "General",
    language: (row.language === "English" ? "English" : "Bangla") as BookLanguage,
    isbn: row.isbn ?? "",
    publisher: row.publisher ?? "",
    yearOfPublication: row.year_of_publication ?? "",
    edition: row.edition ?? "",
    condition: row.condition ?? "",
    pages: row.pages ?? 0,
    price: Number(row.price) ?? 0,
    totalCopies: row.total_copies ?? 0,
    availableCopies: row.available_copies ?? 0,
    issuedCopies: row.issued_copies ?? 0,
    reservedCopies: row.reserved_copies ?? 0,
    location: row.location ?? "",
    thumbnail: row.thumbnail ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function bookToDb(book: Omit<Book, "createdAt" | "updatedAt"> & { id: string }) {
  return {
    id: book.id,
    title: book.title,
    title_bangla: book.titleBangla,
    author: book.author,
    author_bangla: book.authorBangla,
    genre: book.genre,
    category: book.category,
    language: book.language,
    isbn: book.isbn,
    publisher: book.publisher,
    year_of_publication: book.yearOfPublication,
    edition: book.edition,
    condition: book.condition,
    pages: book.pages,
    price: book.price,
    total_copies: book.totalCopies,
    available_copies: book.availableCopies,
    issued_copies: book.issuedCopies,
    reserved_copies: book.reservedCopies,
    location: book.location,
    thumbnail: book.thumbnail ?? null,
  };
}

export function useInventory() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from DB, seed from Excel if empty
  useEffect(() => {
    (async () => {
      try {
        // Fetch ALL books (Supabase default limit is 1000)
        let allRows: any[] = [];
        let from = 0;
        const PAGE = 1000;
        while (true) {
          const { data, error } = await supabase.from("books").select("*").order("id").range(from, from + PAGE - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          allRows = allRows.concat(data);
          if (data.length < PAGE) break;
          from += PAGE;
        }

        if (allRows.length > 0) {
          setBooks(allRows.map(dbToBook));
        } else {
          // Seed from Excel
          const parsed = await parseBooksExcel("/data/All_Book_List.xlsx");
          const rows = parsed.map((b) => bookToDb(b as any));
          // Insert in batches of 500
          for (let i = 0; i < rows.length; i += 500) {
            const batch = rows.slice(i, i + 500);
            const { error: insertErr } = await supabase.from("books").insert(batch);
            if (insertErr) console.error("Seed insert error:", insertErr);
          }
          setBooks(parsed);
        }
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateBook = useCallback(async (id: string, updater: (b: Book) => Book) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
    // Get updated version
    const book = books.find((b) => b.id === id);
    if (!book) return;
    const updated = updater(book);
    await supabase.from("books").update(bookToDb(updated)).eq("id", id);
  }, [books]);

  const updateBookDetails = useCallback(async (
    id: string,
    updates: Partial<Omit<Book, "id" | "createdAt" | "updatedAt" | "availableCopies" | "issuedCopies" | "reservedCopies">>,
  ): Promise<Result> => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (!updates.title?.toString().trim() && !book.title) return { success: false, error: "Title is required" };

    const totalCopies = updates.totalCopies ?? book.totalCopies;
    const minRequired = book.issuedCopies + book.reservedCopies;
    if (totalCopies < 0) return { success: false, error: "Total copies cannot be negative" };
    if (totalCopies < minRequired) {
      return { success: false, error: `Total copies cannot go below ${minRequired} (${book.issuedCopies} issued + ${book.reservedCopies} reserved)` };
    }

    const merged: Book = {
      ...book,
      ...updates,
      totalCopies,
      availableCopies: totalCopies - book.issuedCopies - book.reservedCopies,
      issuedCopies: book.issuedCopies,
      reservedCopies: book.reservedCopies,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("books")
      .update({ ...bookToDb(merged), updated_at: merged.updatedAt })
      .eq("id", id);
    if (error) return { success: false, error: error.message };

    setBooks((prev) => prev.map((b) => (b.id === id ? merged : b)));
    return { success: true };
  }, [books]);

  const adjustStock = useCallback(async (id: string, newTotal: number): Promise<Result> => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (newTotal < 0) return { success: false, error: "Total copies cannot be negative" };
    const minRequired = book.issuedCopies + book.reservedCopies;
    if (newTotal < minRequired) {
      return { success: false, error: `Cannot go below ${minRequired} (${book.issuedCopies} issued + ${book.reservedCopies} reserved)` };
    }
    const diff = newTotal - book.totalCopies;
    const updates = {
      total_copies: newTotal,
      available_copies: book.availableCopies + diff,
      updated_at: new Date().toISOString(),
    };
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, totalCopies: newTotal, availableCopies: b.availableCopies + diff, updatedAt: updates.updated_at } : b));
    await supabase.from("books").update(updates).eq("id", id);
    return { success: true };
  }, [books]);

  const deleteBook = useCallback(async (id: string): Promise<Result> => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, error: "Book not found" };
    if (book.issuedCopies > 0 || book.reservedCopies > 0) {
      return { success: false, error: "Cannot delete a book with issued or reserved copies" };
    }
    setBooks((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("books").delete().eq("id", id);
    return { success: true };
  }, [books]);

  const addBook = useCallback(async (book: Omit<Book, "id" | "createdAt" | "updatedAt">) => {
    const id = `BK-${String(books.length + 1).padStart(4, "0")}`;
    const now = new Date().toISOString();
    const newBook: Book = { ...book, id, createdAt: now, updatedAt: now };
    setBooks((prev) => [newBook, ...prev]);
    await supabase.from("books").insert(bookToDb(newBook));
    return id;
  }, [books.length]);

  const addBooks = useCallback(async (newBooks: Omit<Book, "id" | "createdAt" | "updatedAt">[]) => {
    const now = new Date().toISOString();
    let nextIdx = books.length + 1;
    const mapped = newBooks.map((b) => {
      const id = `BK-${String(nextIdx++).padStart(4, "0")}`;
      return { ...b, id, createdAt: now, updatedAt: now } as Book;
    });
    setBooks((prev) => [...mapped, ...prev]);
    const rows = mapped.map((b) => bookToDb(b));
    for (let i = 0; i < rows.length; i += 500) {
      await supabase.from("books").insert(rows.slice(i, i + 500));
    }
    return newBooks.length;
  }, [books.length]);

  const updateCover = useCallback(async (id: string, thumbnail: string) => {
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, thumbnail, updatedAt: new Date().toISOString() } : b));
    await supabase.from("books").update({ thumbnail, updated_at: new Date().toISOString() }).eq("id", id);
  }, []);

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

  return { books, loading, stats, uniqueGenres, uniqueCategories, adjustStock, deleteBook, addBook, addBooks, updateCover };
}

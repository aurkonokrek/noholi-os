import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Persists book cover images to Supabase Storage + book_covers table.
 * Returns a map of bookId → coverUrl and an upload function.
 */
export function useBookCovers() {
  const [coverMap, setCoverMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load all saved covers on mount
  useEffect(() => {
    supabase
      .from("book_covers")
      .select("book_id, cover_url")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load covers:", error);
        } else if (data) {
          const map: Record<string, string> = {};
          data.forEach((row: { book_id: string; cover_url: string }) => {
            map[row.book_id] = row.cover_url;
          });
          setCoverMap(map);
        }
        setLoading(false);
      });
  }, []);

  /**
   * Upload a cover image file for a book.
   * Stores the file in Supabase Storage and saves the public URL in book_covers table.
   */
  const uploadCover = useCallback(async (bookId: string, file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${bookId}_${Date.now()}.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Cover upload failed:", uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("book-covers")
      .getPublicUrl(filePath);

    const coverUrl = urlData.publicUrl;

    // Upsert into book_covers table
    const { error: dbError } = await supabase
      .from("book_covers")
      .upsert(
        { book_id: bookId, cover_url: coverUrl, updated_at: new Date().toISOString() },
        { onConflict: "book_id" }
      );

    if (dbError) {
      console.error("Failed to save cover URL:", dbError);
      return null;
    }

    // Update local state
    setCoverMap((prev) => ({ ...prev, [bookId]: coverUrl }));
    return coverUrl;
  }, []);

  return { coverMap, loading: loading, uploadCover };
}

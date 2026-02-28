import * as XLSX from "xlsx";

interface ExcelRow {
  "Book Title (Bangla)"?: string;
  "Book Title (English)"?: string;
  "Author Name (Bangla)"?: string;
  "Author Name (English)"?: string;
  "Genre"?: string;
  "Publications"?: string;
  "Year of Publication"?: string | number;
  "Edition"?: string;
  "Language"?: string;
  "Category"?: string;
  "ISBN"?: string;
  "Total Copies"?: number;
  "Book Condition"?: string;
  "Pages"?: number | string;
  "৳ Price"?: number | string;
  "Cover Image URL"?: string;
}

function str(val: unknown): string {
  if (val == null) return "";
  return String(val).trim();
}

function sanitizeUrl(url?: unknown): string | undefined {
  const s = str(url);
  if (!s || s === "-") return undefined;
  const match = s.match(/<(.+)>/);
  return match ? match[1] : s;
}

export async function parseBooksExcel(url: string) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

  return rows.map((row, i) => {
    const totalCopies = Number(row["Total Copies"]) || 0;
    const pages = Number(row["Pages"]) || 0;
    const price = Number(row["৳ Price"]) || 0;

    return {
      id: `BK-${String(i + 1).padStart(4, "0")}`,
      title: str(row["Book Title (English)"]) || str(row["Book Title (Bangla)"]) || "Untitled",
      titleBangla: str(row["Book Title (Bangla)"]),
      author: str(row["Author Name (English)"]) || str(row["Author Name (Bangla)"]) || "Unknown",
      authorBangla: str(row["Author Name (Bangla)"]),
      genre: str(row["Genre"]) || "Uncategorized",
      category: str(row["Category"]) || "General",
      language: (str(row["Language"]) === "English" ? "English" : "Bangla") as "Bangla" | "English",
      isbn: str(row["ISBN"]),
      publisher: str(row["Publications"]),
      yearOfPublication: str(row["Year of Publication"]),
      edition: str(row["Edition"]),
      condition: str(row["Book Condition"]),
      pages,
      price,
      totalCopies,
      availableCopies: totalCopies,
      issuedCopies: 0,
      reservedCopies: 0,
      location: "",
      thumbnail: sanitizeUrl(row["Cover Image URL"]),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

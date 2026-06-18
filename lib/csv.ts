// Minimale, dependency-vrije CSV-parser. Ondersteunt:
// - velden tussen dubbele quotes (met komma's, newlines en "" als escape)
// - CRLF en LF regeleindes
// - een header-rij die kolomnamen op waarden mapt
//
// Niet bedoeld als volledige RFC4180-implementatie, wel robuust genoeg voor
// de game-import (Fase 3.3).

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const text = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }

  // Laatste veld/rij (geen trailing newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Filter volledig lege regels (bv. trailing newline → [""]).
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

// Parse CSV met header-rij naar een lijst van objecten (key = lowercase header).
export function parseCsvObjects(input: string): Record<string, string>[] {
  const rows = parseCsv(input);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((cells) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (cells[idx] ?? "").trim();
    });
    return obj;
  });
}

// Titel → URL-veilige slug (accentloos, lowercase, koppeltekens).
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

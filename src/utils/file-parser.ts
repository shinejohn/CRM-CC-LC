// ============================================
// FILE PARSER UTILITIES
// ============================================

export interface ParsedRow {
  [key: string]: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  columns: string[];
  errors: string[];
}

export const parseCSV = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const errors: string[] = [];
    const rows: ParsedRow[] = [];
    let columns: string[] = [];

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        resolve({ rows: [], columns: [], errors: ['File is empty'] });
        return;
      }

      const lines = text.split('\n').filter((line) => line.trim());
      if (lines.length === 0) {
        resolve({ rows: [], columns: [], errors: ['No data found in file'] });
        return;
      }

      // Parse header
      const headerLine = lines[0];
      columns = parseCSVLine(headerLine);

      if (columns.length === 0) {
        errors.push('Could not parse CSV header');
        resolve({ rows: [], columns: [], errors });
        return;
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        try {
          const values = parseCSVLine(line);
          if (values.length !== columns.length) {
            errors.push(`Row ${i + 1}: Column count mismatch (expected ${columns.length}, got ${values.length})`);
            continue;
          }

          const row: ParsedRow = {};
          columns.forEach((col, idx) => {
            row[col] = values[idx] || '';
          });
          rows.push(row);
        } catch (err) {
          errors.push(`Row ${i + 1}: Parse error - ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      resolve({ rows, columns, errors });
    };

    reader.onerror = () => {
      resolve({ rows: [], columns: [], errors: ['Failed to read file'] });
    };

    reader.readAsText(file);
  });
};

const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

export const parseJSON = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const errors: string[] = [];

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          resolve({ rows: [], columns: [], errors: ['File is empty'] });
          return;
        }

        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
          resolve({ rows: [], columns: [], errors: ['JSON must be an array of objects'] });
          return;
        }

        if (data.length === 0) {
          resolve({ rows: [], columns: [], errors: ['No data found in file'] });
          return;
        }

        // Extract columns from first object
        const columns = Object.keys(data[0]);
        if (columns.length === 0) {
          resolve({ rows: [], columns: [], errors: ['No columns found in data'] });
          return;
        }

        // Convert to rows
        const rows: ParsedRow[] = data.map((item, index) => {
          if (typeof item !== 'object' || item === null) {
            errors.push(`Row ${index + 1}: Not an object`);
            return null;
          }

          const row: ParsedRow = {};
          columns.forEach((col) => {
            row[col] = String(item[col] || '');
          });
          return row;
        }).filter((row): row is ParsedRow => row !== null);

        resolve({ rows, columns, errors });
      } catch (err) {
        resolve({
          rows: [],
          columns: [],
          errors: [`JSON parse error: ${err instanceof Error ? err.message : 'Unknown error'}`],
        });
      }
    };

    reader.onerror = () => {
      resolve({ rows: [], columns: [], errors: ['Failed to read file'] });
    };

    reader.readAsText(file);
  });
};

export const parseFile = async (file: File): Promise<ParseResult> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'json':
      return parseJSON(file);
    case 'xlsx':
      return {
        rows: [],
        columns: [],
        errors: ['XLSX files require server-side processing. Please convert to CSV or JSON.'],
      };
    default:
      return {
        rows: [],
        columns: [],
        errors: [`Unsupported file type: .${extension}. Please use CSV or JSON.`],
      };
  }
};



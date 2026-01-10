import { describe, it, expect } from 'vitest';
import { parseCSV, parseJSON } from './file-parser';

// Helper function to create a File object from string content
const createFile = (content: string, filename: string, mimeType: string): File => {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};

describe('file-parser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV data', async () => {
      const csvData = 'name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com';
      const file = createFile(csvData, 'test.csv', 'text/csv');
      const result = await parseCSV(file);
      
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ name: 'John Doe', email: 'john@example.com' });
      expect(result.rows[1]).toEqual({ name: 'Jane Smith', email: 'jane@example.com' });
      expect(result.columns).toEqual(['name', 'email']);
    });

    it('should handle CSV with headers', async () => {
      const csvData = 'id,title,content\n1,Test,Content\n2,Test2,Content2';
      const file = createFile(csvData, 'test.csv', 'text/csv');
      const result = await parseCSV(file);
      
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ id: '1', title: 'Test', content: 'Content' });
      expect(result.columns).toEqual(['id', 'title', 'content']);
    });

    it('should handle empty CSV', async () => {
      const file = createFile('', 'test.csv', 'text/csv');
      const result = await parseCSV(file);
      expect(result.rows).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle CSV with only headers', async () => {
      const file = createFile('name,email', 'test.csv', 'text/csv');
      const result = await parseCSV(file);
      expect(result.rows).toEqual([]);
      expect(result.columns).toEqual(['name', 'email']);
    });

    it('should handle CSV with quoted values', async () => {
      const csvData = 'name,description\nJohn,"John Doe, the developer"';
      const file = createFile(csvData, 'test.csv', 'text/csv');
      const result = await parseCSV(file);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].description).toBe('John Doe, the developer');
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON array', async () => {
      const jsonData = '[{"name":"John","email":"john@example.com"}]';
      const file = createFile(jsonData, 'test.json', 'application/json');
      const result = await parseJSON(file);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ name: 'John', email: 'john@example.com' });
      expect(result.columns).toEqual(['name', 'email']);
    });

    it('should handle empty JSON array', async () => {
      const file = createFile('[]', 'test.json', 'application/json');
      const result = await parseJSON(file);
      expect(result.rows).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle invalid JSON', async () => {
      const file = createFile('invalid json', 'test.json', 'application/json');
      const result = await parseJSON(file);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle JSON with nested objects', async () => {
      const jsonData = '[{"user":{"name":"John"},"meta":{"id":1}}]';
      const file = createFile(jsonData, 'test.json', 'application/json');
      const result = await parseJSON(file);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].user).toBe('[object Object]');
      expect(result.rows[0].meta).toBe('[object Object]');
    });
  });
});

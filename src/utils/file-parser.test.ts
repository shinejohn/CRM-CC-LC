import { describe, it, expect } from 'vitest';
import { parseCSV, parseJSON } from './file-parser';

describe('file-parser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV data', () => {
      const csvData = 'name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com';
      const result = parseCSV(csvData);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'John Doe', email: 'john@example.com' });
      expect(result[1]).toEqual({ name: 'Jane Smith', email: 'jane@example.com' });
    });

    it('should handle CSV with headers', () => {
      const csvData = 'id,title,content\n1,Test,Content\n2,Test2,Content2';
      const result = parseCSV(csvData);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '1', title: 'Test', content: 'Content' });
    });

    it('should handle empty CSV', () => {
      const result = parseCSV('');
      expect(result).toEqual([]);
    });

    it('should handle CSV with only headers', () => {
      const result = parseCSV('name,email');
      expect(result).toEqual([]);
    });

    it('should handle CSV with quoted values', () => {
      const csvData = 'name,description\nJohn,"John Doe, the developer"';
      const result = parseCSV(csvData);
      
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('John Doe, the developer');
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON array', () => {
      const jsonData = '[{"name":"John","email":"john@example.com"}]';
      const result = parseJSON(jsonData);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should parse valid JSON object (single item)', () => {
      const jsonData = '{"name":"John","email":"john@example.com"}';
      const result = parseJSON(jsonData);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should handle empty JSON array', () => {
      const result = parseJSON('[]');
      expect(result).toEqual([]);
    });

    it('should throw error on invalid JSON', () => {
      expect(() => parseJSON('invalid json')).toThrow();
    });

    it('should handle JSON with nested objects', () => {
      const jsonData = '[{"user":{"name":"John"},"meta":{"id":1}}]';
      const result = parseJSON(jsonData);
      
      expect(result).toHaveLength(1);
      expect(result[0].user.name).toBe('John');
      expect(result[0].meta.id).toBe(1);
    });
  });
});

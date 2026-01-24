import { expect } from '@open-wc/testing';
import { StorageService } from './storage-service.js';
import type { WorkspaceState } from '../types/index.js';

describe('StorageService', () => {
  const testKey = 'test-storage-key';
  let service: StorageService;

  beforeEach(() => {
    localStorage.removeItem(testKey);
    service = new StorageService(testKey);
  });

  afterEach(() => {
    localStorage.removeItem(testKey);
  });

  describe('save', () => {
    it('should save a valid workspace state to localStorage', async () => {
      const state: WorkspaceState = {
        iframes: [
          { id: '1', url: 'https://example.com', position: { row: 0, col: 0 } }
        ],
        grid: {
          columns: 1,
          rows: 1,
          columnRatios: [1],
          rowRatios: [1]
        }
      };

      const result = service.save(state);
      expect(result).to.be.true;

      const stored = localStorage.getItem(testKey);
      expect(stored).to.not.be.null;
      expect(JSON.parse(stored!)).to.deep.equal(state);
    });

    it('should overwrite existing state', async () => {
      const state1: WorkspaceState = {
        iframes: [],
        grid: { columns: 1, rows: 1, columnRatios: [1], rowRatios: [1] }
      };
      const state2: WorkspaceState = {
        iframes: [
          { id: '1', url: 'https://example.com', position: { row: 0, col: 0 } }
        ],
        grid: { columns: 2, rows: 2, columnRatios: [1, 1], rowRatios: [1, 1] }
      };

      service.save(state1);
      service.save(state2);

      const stored = localStorage.getItem(testKey);
      expect(JSON.parse(stored!)).to.deep.equal(state2);
    });
  });

  describe('load', () => {
    it('should return null when no state is saved', async () => {
      const result = service.load();
      expect(result).to.be.null;
    });

    it('should load a valid workspace state', async () => {
      const state: WorkspaceState = {
        iframes: [
          { id: '1', url: 'https://example.com', position: { row: 0, col: 0 } },
          { id: '2', url: 'https://test.com', position: { row: 0, col: 1 } }
        ],
        grid: {
          columns: 2,
          rows: 1,
          columnRatios: [1, 2],
          rowRatios: [1]
        }
      };

      localStorage.setItem(testKey, JSON.stringify(state));
      const result = service.load();
      expect(result).to.deep.equal(state);
    });

    it('should return null and clear storage for invalid JSON', async () => {
      localStorage.setItem(testKey, 'not valid json');
      const result = service.load();
      expect(result).to.be.null;
      expect(localStorage.getItem(testKey)).to.be.null;
    });

    it('should return null and clear storage for missing iframes array', async () => {
      localStorage.setItem(testKey, JSON.stringify({
        grid: { columns: 1, rows: 1, columnRatios: [1], rowRatios: [1] }
      }));
      const result = service.load();
      expect(result).to.be.null;
      expect(localStorage.getItem(testKey)).to.be.null;
    });

    it('should return null and clear storage for invalid iframe config', async () => {
      localStorage.setItem(testKey, JSON.stringify({
        iframes: [{ id: '', url: 'https://test.com', position: { row: 0, col: 0 } }],
        grid: { columns: 1, rows: 1, columnRatios: [1], rowRatios: [1] }
      }));
      const result = service.load();
      expect(result).to.be.null;
    });

    it('should return null and clear storage for missing grid config', async () => {
      localStorage.setItem(testKey, JSON.stringify({
        iframes: []
      }));
      const result = service.load();
      expect(result).to.be.null;
    });

    it('should return null for invalid grid config with wrong columnRatios length', async () => {
      localStorage.setItem(testKey, JSON.stringify({
        iframes: [],
        grid: { columns: 2, rows: 1, columnRatios: [1], rowRatios: [1] }
      }));
      const result = service.load();
      expect(result).to.be.null;
    });

    it('should return null for invalid grid config with wrong rowRatios length', async () => {
      localStorage.setItem(testKey, JSON.stringify({
        iframes: [],
        grid: { columns: 1, rows: 2, columnRatios: [1], rowRatios: [1] }
      }));
      const result = service.load();
      expect(result).to.be.null;
    });

    it('should return null for negative position values', async () => {
      localStorage.setItem(testKey, JSON.stringify({
        iframes: [{ id: '1', url: 'https://test.com', position: { row: -1, col: 0 } }],
        grid: { columns: 1, rows: 1, columnRatios: [1], rowRatios: [1] }
      }));
      const result = service.load();
      expect(result).to.be.null;
    });

    it('should return null for zero or negative ratios', async () => {
      localStorage.setItem(testKey, JSON.stringify({
        iframes: [],
        grid: { columns: 1, rows: 1, columnRatios: [0], rowRatios: [1] }
      }));
      const result = service.load();
      expect(result).to.be.null;
    });

    it('should return null for non-numeric ratios', async () => {
      localStorage.setItem(testKey, JSON.stringify({
        iframes: [],
        grid: { columns: 1, rows: 1, columnRatios: ['1'], rowRatios: [1] }
      }));
      const result = service.load();
      expect(result).to.be.null;
    });
  });

  describe('clear', () => {
    it('should remove the stored state', async () => {
      const state: WorkspaceState = {
        iframes: [],
        grid: { columns: 1, rows: 1, columnRatios: [1], rowRatios: [1] }
      };
      service.save(state);
      expect(localStorage.getItem(testKey)).to.not.be.null;

      service.clear();
      expect(localStorage.getItem(testKey)).to.be.null;
    });

    it('should not throw when clearing empty storage', async () => {
      expect(() => service.clear()).to.not.throw();
    });
  });

  describe('load with empty iframes array', () => {
    it('should accept an empty iframes array', async () => {
      const state: WorkspaceState = {
        iframes: [],
        grid: { columns: 1, rows: 1, columnRatios: [1], rowRatios: [1] }
      };
      localStorage.setItem(testKey, JSON.stringify(state));
      const result = service.load();
      expect(result).to.deep.equal(state);
    });
  });

  describe('complex workspace state', () => {
    it('should handle a 2x2 grid with multiple iframes', async () => {
      const state: WorkspaceState = {
        iframes: [
          { id: 'a', url: 'https://a.com', position: { row: 0, col: 0 } },
          { id: 'b', url: 'https://b.com', position: { row: 0, col: 1 } },
          { id: 'c', url: 'https://c.com', position: { row: 1, col: 0 } },
          { id: 'd', url: 'https://d.com', position: { row: 1, col: 1 } }
        ],
        grid: {
          columns: 2,
          rows: 2,
          columnRatios: [1.5, 2.5],
          rowRatios: [3, 1]
        }
      };

      service.save(state);
      const result = service.load();
      expect(result).to.deep.equal(state);
    });
  });
});

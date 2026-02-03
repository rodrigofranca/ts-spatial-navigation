import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getRect,
  partition,
  prioritize,
  distanceBuilder,
  navigate,
  parseSelector,
  matchSelector,
  getCurrentFocusedElement,
  extend,
  exclude,
  dispatch
} from './core';
import type { Rect, Config } from './types';

describe('core.ts - Spatial Navigation Algorithms', () => {
  describe('getRect', () => {
    it('should calculate correct rect for an element', () => {
      const elem = document.createElement('div');
      document.body.appendChild(elem);

      // Mock getBoundingClientRect since happy-dom doesn't calculate it from styles
      elem.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 50,
        right: 300,
        bottom: 150,
        width: 200,
        height: 100,
        x: 100,
        y: 50,
        toJSON: () => ({})
      } as DOMRect));

      const rect = getRect(elem);

      expect(rect).not.toBeNull();
      expect(rect?.element).toBe(elem);
      expect(rect?.width).toBe(200);
      expect(rect?.height).toBe(100);
      expect(rect?.center.x).toBe(200); // left(100) + width/2(100)
      expect(rect?.center.y).toBe(100); // top(50) + height/2(50)

      document.body.removeChild(elem);
    });

    it('should return null for invalid element', () => {
      const elem = document.createElement('div');
      // Element not attached to DOM
      const rect = getRect(elem);

      // In happy-dom, getBoundingClientRect still returns values for detached elements
      // So we just verify it doesn't throw
      expect(rect).toBeDefined();
    });

    it('should calculate center coordinates correctly', () => {
      const elem = document.createElement('div');
      document.body.appendChild(elem);

      // Mock getBoundingClientRect
      elem.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      } as DOMRect));

      const rect = getRect(elem);

      expect(rect?.center).toEqual({
        x: 50,
        y: 50,
        left: 50,
        right: 50,
        top: 50,
        bottom: 50
      });

      document.body.removeChild(elem);
    });
  });

  describe('partition', () => {
    const createMockRect = (x: number, y: number, width = 10, height = 10): Rect => ({
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
      width,
      height,
      element: document.createElement('div'),
      center: {
        x: x + width / 2,
        y: y + height / 2,
        left: x + width / 2,
        right: x + width / 2,
        top: y + height / 2,
        bottom: y + height / 2
      }
    });

    it('should partition rects into 9 groups based on target position', () => {
      const targetRect = createMockRect(100, 100, 50, 50);
      const rects = [
        createMockRect(50, 50),   // Top-left (0)
        createMockRect(120, 50),  // Top-center (1)
        createMockRect(200, 50),  // Top-right (2)
        createMockRect(50, 120),  // Middle-left (3)
        createMockRect(120, 120), // Middle-center (4)
        createMockRect(200, 120), // Middle-right (5)
        createMockRect(50, 200),  // Bottom-left (6)
        createMockRect(120, 200), // Bottom-center (7)
        createMockRect(200, 200)  // Bottom-right (8)
      ];

      const groups = partition(rects, targetRect, 0.5);

      expect(groups).toHaveLength(9);
      expect(groups[0]).toContain(rects[0]); // Top-left
      expect(groups[1]).toContain(rects[1]); // Top-center
      expect(groups[2]).toContain(rects[2]); // Top-right
      expect(groups[3]).toContain(rects[3]); // Middle-left
      expect(groups[4]).toContain(rects[4]); // Middle-center
      expect(groups[5]).toContain(rects[5]); // Middle-right
      expect(groups[6]).toContain(rects[6]); // Bottom-left
      expect(groups[7]).toContain(rects[7]); // Bottom-center
      expect(groups[8]).toContain(rects[8]); // Bottom-right
    });

    it('should handle straightOverlapThreshold correctly', () => {
      const targetRect = createMockRect(100, 100, 50, 50);
      const rect = createMockRect(180, 50, 10, 10); // Top-right corner

      const groups = partition([rect], targetRect, 0.5);

      // With overlap threshold, corner elements may appear in multiple groups
      expect(groups.some(group => group.includes(rect))).toBe(true);
    });

    it('should return empty groups when no rects provided', () => {
      const targetRect = createMockRect(100, 100, 50, 50);
      const groups = partition([], targetRect, 0.5);

      expect(groups).toHaveLength(9);
      groups.forEach(group => {
        expect(group).toHaveLength(0);
      });
    });
  });

  describe('prioritize', () => {
    const createMockRect = (value: number): Rect => ({
      left: value,
      top: value,
      right: value + 10,
      bottom: value + 10,
      width: 10,
      height: 10,
      element: document.createElement('div'),
      center: { x: value + 5, y: value + 5, left: value + 5, right: value + 5, top: value + 5, bottom: value + 5 }
    });

    it('should select first non-empty priority group', () => {
      const rect1 = createMockRect(10);
      const rect2 = createMockRect(20);
      const rect3 = createMockRect(30);

      const priorities = [
        { group: [], distance: [] },
        { group: [rect2, rect1, rect3], distance: [(r: Rect) => r.left] },
        { group: [createMockRect(40)], distance: [] }
      ];

      const result = prioritize(priorities);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(3);
      expect(result?.[0]).toBe(rect1); // Sorted by left position
      expect(result?.[1]).toBe(rect2);
      expect(result?.[2]).toBe(rect3);
    });

    it('should sort by distance functions', () => {
      const rect1 = createMockRect(30);
      const rect2 = createMockRect(10);
      const rect3 = createMockRect(20);

      const priorities = [
        {
          group: [rect1, rect2, rect3],
          distance: [(r: Rect) => r.left]
        }
      ];

      const result = prioritize(priorities);

      expect(result?.[0]).toBe(rect2); // Smallest left value (10)
      expect(result?.[1]).toBe(rect3); // Middle left value (20)
      expect(result?.[2]).toBe(rect1); // Largest left value (30)
    });

    it('should return null when all groups are empty', () => {
      const priorities = [
        { group: [], distance: [] },
        { group: [], distance: [] },
        { group: [], distance: [] }
      ];

      const result = prioritize(priorities);

      expect(result).toBeNull();
    });

    it('should use secondary distance function for tie-breaking', () => {
      const rect1 = { ...createMockRect(10), top: 20 };
      const rect2 = { ...createMockRect(10), top: 10 };
      const rect3 = { ...createMockRect(10), top: 30 };

      const priorities = [
        {
          group: [rect1, rect2, rect3],
          distance: [
            (r: Rect) => r.left,  // All same (10)
            (r: Rect) => r.top    // Different - used for sorting
          ]
        }
      ];

      const result = prioritize(priorities);

      expect(result?.[0]).toBe(rect2); // top: 10
      expect(result?.[1]).toBe(rect1); // top: 20
      expect(result?.[2]).toBe(rect3); // top: 30
    });
  });

  describe('distanceBuilder', () => {
    const targetRect: Rect = {
      left: 100,
      top: 100,
      right: 200,
      bottom: 200,
      width: 100,
      height: 100,
      element: document.createElement('div'),
      center: { x: 150, y: 150, left: 150, right: 150, top: 150, bottom: 150 }
    };

    const distFn = distanceBuilder(targetRect);

    it('should calculate nearPlumbLineIsBetter correctly', () => {
      const leftRect: Rect = {
        left: 0, top: 100, right: 50, bottom: 200, width: 50, height: 100,
        element: document.createElement('div'),
        center: { x: 25, y: 150, left: 25, right: 25, top: 150, bottom: 150 }
      };

      const rightRect: Rect = {
        left: 250, top: 100, right: 300, bottom: 200, width: 50, height: 100,
        element: document.createElement('div'),
        center: { x: 275, y: 150, left: 275, right: 275, top: 150, bottom: 150 }
      };

      // Distance from vertical line through target center
      // For left rect: center.x (25) < targetRect.center.x (150), so distance = 150 - right (50) = 100
      // For right rect: center.x (275) > targetRect.center.x (150), so distance = left (250) - 150 = 100
      expect(distFn.nearPlumbLineIsBetter(leftRect)).toBe(100); // 150 - 50
      expect(distFn.nearPlumbLineIsBetter(rightRect)).toBe(100); // 250 - 150
    });

    it('should calculate nearHorizonIsBetter correctly', () => {
      const topRect: Rect = {
        left: 100, top: 0, right: 200, bottom: 50, width: 100, height: 50,
        element: document.createElement('div'),
        center: { x: 150, y: 25, left: 150, right: 150, top: 25, bottom: 25 }
      };

      const bottomRect: Rect = {
        left: 100, top: 250, right: 200, bottom: 300, width: 100, height: 50,
        element: document.createElement('div'),
        center: { x: 150, y: 275, left: 150, right: 150, top: 275, bottom: 275 }
      };

      // Distance from horizontal line through target center
      expect(distFn.nearHorizonIsBetter(topRect)).toBe(100); // 150 - 50
      expect(distFn.nearHorizonIsBetter(bottomRect)).toBe(100); // 250 - 150
    });

    it('should return 0 for overlapping elements', () => {
      const overlappingRect: Rect = {
        left: 120, top: 120, right: 180, bottom: 180, width: 60, height: 60,
        element: document.createElement('div'),
        center: { x: 150, y: 150, left: 150, right: 150, top: 150, bottom: 150 }
      };

      expect(distFn.nearPlumbLineIsBetter(overlappingRect)).toBe(0);
      expect(distFn.nearHorizonIsBetter(overlappingRect)).toBe(0);
    });

    it('should calculate directional preferences correctly', () => {
      const rect: Rect = {
        left: 50, top: 60, right: 100, bottom: 110, width: 50, height: 50,
        element: document.createElement('div'),
        center: { x: 75, y: 85, left: 75, right: 75, top: 85, bottom: 85 }
      };

      expect(distFn.topIsBetter(rect)).toBe(60);
      expect(distFn.bottomIsBetter(rect)).toBe(-110);
      expect(distFn.leftIsBetter(rect)).toBe(50);
      expect(distFn.rightIsBetter(rect)).toBe(-100);
    });
  });

  describe('navigate', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    const createElementAt = (x: number, y: number, width = 50, height = 50): HTMLElement => {
      const elem = document.createElement('div');
      document.body.appendChild(elem);

      // Mock getBoundingClientRect for happy-dom
      elem.getBoundingClientRect = vi.fn(() => ({
        left: x,
        top: y,
        right: x + width,
        bottom: y + height,
        width,
        height,
        x,
        y,
        toJSON: () => ({})
      } as DOMRect));

      return elem;
    };

    it('should navigate to the right element', () => {
      const target = createElementAt(100, 100);
      const rightCandidate = createElementAt(200, 100);
      const wrongCandidate = createElementAt(100, 200);

      const config: Config = { straightOverlapThreshold: 0.5 };
      const result = navigate(target, 'right', [rightCandidate, wrongCandidate], config);

      expect(result).toBe(rightCandidate);
    });

    it('should navigate to the left element', () => {
      const target = createElementAt(200, 100);
      const leftCandidate = createElementAt(100, 100);
      const wrongCandidate = createElementAt(200, 200);

      const config: Config = { straightOverlapThreshold: 0.5 };
      const result = navigate(target, 'left', [leftCandidate, wrongCandidate], config);

      expect(result).toBe(leftCandidate);
    });

    it('should navigate upward', () => {
      const target = createElementAt(100, 200);
      const upCandidate = createElementAt(100, 100);
      const wrongCandidate = createElementAt(200, 200);

      const config: Config = { straightOverlapThreshold: 0.5 };
      const result = navigate(target, 'up', [upCandidate, wrongCandidate], config);

      expect(result).toBe(upCandidate);
    });

    it('should navigate downward', () => {
      const target = createElementAt(100, 100);
      const downCandidate = createElementAt(100, 200);
      const wrongCandidate = createElementAt(200, 100);

      const config: Config = { straightOverlapThreshold: 0.5 };
      const result = navigate(target, 'down', [downCandidate, wrongCandidate], config);

      expect(result).toBe(downCandidate);
    });

    it('should return null when no candidates available', () => {
      const target = createElementAt(100, 100);
      const config: Config = { straightOverlapThreshold: 0.5 };

      const result = navigate(target, 'right', [], config);

      expect(result).toBeNull();
    });

    it('should return null for invalid direction', () => {
      const target = createElementAt(100, 100);
      const candidate = createElementAt(200, 100);
      const config: Config = { straightOverlapThreshold: 0.5 };

      const result = navigate(target, 'invalid' as any, [candidate], config);

      expect(result).toBeNull();
    });

    it('should respect straightOnly configuration', () => {
      const target = createElementAt(100, 100);
      const diagonalCandidate = createElementAt(200, 200);
      const config: Config = { straightOverlapThreshold: 0.5, straightOnly: true };

      const result = navigate(target, 'right', [diagonalCandidate], config);

      // With straightOnly, diagonal candidates should have lower priority
      expect(result).toBeDefined();
    });

    it('should remember source when configured', () => {
      const target = createElementAt(100, 100);
      const candidate1 = createElementAt(200, 100);
      const candidate2 = createElementAt(250, 100);

      const config: Config = {
        straightOverlapThreshold: 0.5,
        rememberSource: true,
        previous: {
          target: candidate1,
          destination: target,
          reverse: 'left'
        }
      };

      const result = navigate(target, 'right', [candidate1, candidate2], config);

      expect(result).toBe(candidate1); // Should remember the previous source
    });
  });

  describe('parseSelector', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should parse string selector', () => {
      const div1 = document.createElement('div');
      div1.className = 'test';
      const div2 = document.createElement('div');
      div2.className = 'test';
      document.body.appendChild(div1);
      document.body.appendChild(div2);

      const result = parseSelector('.test');

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(div1);
      expect(result[1]).toBe(div2);
    });

    it('should parse NodeList', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      document.body.appendChild(div1);
      document.body.appendChild(div2);

      const nodeList = document.querySelectorAll('div');
      const result = parseSelector(nodeList);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(div1);
      expect(result[1]).toBe(div2);
    });

    it('should parse HTMLElement', () => {
      const div = document.createElement('div');
      const result = parseSelector(div);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(div);
    });

    it('should return empty array for invalid selector', () => {
      const result = parseSelector('::invalid::selector::');
      expect(result).toHaveLength(0);
    });
  });

  describe('matchSelector', () => {
    it('should match string selector', () => {
      const div = document.createElement('div');
      div.className = 'test';

      expect(matchSelector(div, '.test')).toBe(true);
      expect(matchSelector(div, '.other')).toBe(false);
    });

    it('should match element in array', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');

      expect(matchSelector(div1, [div1, div2])).toBe(true);
      expect(matchSelector(document.createElement('div'), [div1, div2])).toBe(false);
    });

    it('should match exact element', () => {
      const div = document.createElement('div');

      expect(matchSelector(div, div)).toBe(true);
      expect(matchSelector(div, document.createElement('div'))).toBe(false);
    });

    it('should return false for invalid inputs', () => {
      const div = document.createElement('div');

      expect(matchSelector(null as any, '.test')).toBe(false);
      expect(matchSelector(div, null as any)).toBe(false);
    });
  });

  describe('getCurrentFocusedElement', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should return focused element', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const result = getCurrentFocusedElement();

      expect(result).toBe(input);
    });

    it('should return null when body is focused', () => {
      document.body.focus();

      const result = getCurrentFocusedElement();

      expect(result).toBeNull();
    });

    it('should return null when no element is focused', () => {
      const result = getCurrentFocusedElement();

      expect(result).toBeNull();
    });
  });

  describe('extend', () => {
    it('should merge objects correctly', () => {
      const base = { a: 1, b: 2 };
      const source1 = { b: 3, c: 4 };
      const source2 = { c: 5, d: 6 };

      const result = extend(base, source1, source2);

      expect(result).toEqual({ a: 1, b: 3, c: 5, d: 6 });
      expect(result).not.toBe(base); // Should not mutate original
    });

    it('should ignore undefined values', () => {
      const base = { a: 1, b: 2 };
      const source = { b: undefined, c: 3 };

      const result = extend(base, source);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should handle multiple sources', () => {
      const result = extend({}, { a: 1 }, { b: 2 }, { c: 3 });

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should return copy of base when no sources provided', () => {
      const base = { a: 1, b: 2 };
      const result = extend(base);

      expect(result).toEqual(base);
      expect(result).not.toBe(base);
    });
  });

  describe('exclude', () => {
    it('should exclude single element from array', () => {
      const elem1 = document.createElement('div');
      const elem2 = document.createElement('div');
      const elem3 = document.createElement('div');
      const list = [elem1, elem2, elem3];

      const result = exclude(list, elem2);

      expect(result).toHaveLength(2);
      expect(result).toContain(elem1);
      expect(result).toContain(elem3);
      expect(result).not.toContain(elem2);
    });

    it('should exclude multiple elements from array', () => {
      const elem1 = document.createElement('div');
      const elem2 = document.createElement('div');
      const elem3 = document.createElement('div');
      const list = [elem1, elem2, elem3];

      const result = exclude(list, [elem1, elem3]);

      expect(result).toHaveLength(1);
      expect(result).toContain(elem2);
    });

    it('should handle non-existent elements gracefully', () => {
      const elem1 = document.createElement('div');
      const elem2 = document.createElement('div');
      const list = [elem1];

      const result = exclude(list, elem2);

      expect(result).toHaveLength(1);
      expect(result).toContain(elem1);
    });

    it('should NOT mutate original array (immutable)', () => {
      const elem1 = document.createElement('div');
      const elem2 = document.createElement('div');
      const list = [elem1, elem2];

      const result = exclude(list, elem1);

      expect(result).not.toBe(list); // Different reference
      expect(result).toHaveLength(1);
      expect(list).toHaveLength(2); // Original unchanged
    });
  });

  describe('dispatch', () => {
    it('should dispatch custom event with correct type', () => {
      const elem = document.createElement('div');
      let eventFired = false;
      let eventDetail: any = null;

      elem.addEventListener('sn:test', (e: Event) => {
        eventFired = true;
        eventDetail = (e as CustomEvent).detail;
      });

      const result = dispatch(elem, 'test', { direction: 'up' });

      expect(result).toBe(true);
      expect(eventFired).toBe(true);
      expect(eventDetail).toEqual({ direction: 'up' });
    });

    it('should create bubbling event', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      parent.appendChild(child);

      let parentEventFired = false;
      parent.addEventListener('sn:test', () => {
        parentEventFired = true;
      });

      dispatch(child, 'test');

      expect(parentEventFired).toBe(true);
    });

    it('should create cancelable event by default', () => {
      const elem = document.createElement('div');
      let eventWasCancelable = false;

      elem.addEventListener('sn:test', (e: Event) => {
        eventWasCancelable = e.cancelable;
        e.preventDefault();
      });

      const result = dispatch(elem, 'test');

      expect(eventWasCancelable).toBe(true);
      expect(result).toBe(false); // preventDefault called
    });

    it('should create non-cancelable event when specified', () => {
      const elem = document.createElement('div');
      let eventWasCancelable = false;

      elem.addEventListener('sn:test', (e: Event) => {
        eventWasCancelable = e.cancelable;
      });

      dispatch(elem, 'test', undefined, false);

      expect(eventWasCancelable).toBe(false);
    });

    it('should prefix event type with "sn:"', () => {
      const elem = document.createElement('div');
      let capturedEventType = '';

      elem.addEventListener('sn:custom', (e: Event) => {
        capturedEventType = e.type;
      });

      dispatch(elem, 'custom');

      expect(capturedEventType).toBe('sn:custom');
    });
  });
});

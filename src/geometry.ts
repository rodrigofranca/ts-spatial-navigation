/**
 * Geometry Module
 * Pure functions for spatial calculations and partitioning.
 * No side effects, no DOM dependencies beyond getBoundingClientRect.
 */

import type { DistanceFunctions, Rect } from './types';
import { Grid } from './constants';

/**
 * Gets the bounding rectangle of an element with center point calculations.
 *
 * @param elem - HTML element to measure
 * @returns Rect object with position, dimensions, and center points, or null if unavailable
 */
export const getRect = (elem: HTMLElement): Rect | null => {
  const cr = elem.getBoundingClientRect();
  if (!cr) {
    return null;
  }
  const { left, top, right, bottom, width, height } = cr;
  const x = left + Math.floor(width / 2);
  const y = top + Math.floor(height / 2);
  const rect: Rect = {
    left,
    top,
    right,
    bottom,
    width,
    height,
    element: elem,
    center: {
      x,
      y,
      left: x,
      right: x,
      top: y,
      bottom: y
    }
  };
  return rect;
};

/**
 * Partitions rectangles into a 3x3 grid relative to a target rectangle.
 *
 * The grid layout:
 *   0 | 1 | 2    (top-left, top-center, top-right)
 *   ---------
 *   3 | 4 | 5    (middle-left, middle-center, middle-right)
 *   ---------
 *   6 | 7 | 8    (bottom-left, bottom-center, bottom-right)
 *
 * Elements in corners may also be added to edge groups based on
 * straightOverlapThreshold for diagonal navigation support.
 *
 * @param rects - Array of rectangles to partition
 * @param targetRect - Reference rectangle (usually the currently focused element)
 * @param straightOverlapThreshold - Threshold (0-1) for including corner elements in edge groups
 * @returns 9-element array of rectangle arrays, one per grid position
 */
export const partition = (
  rects: Rect[],
  targetRect: Rect,
  straightOverlapThreshold: number
): Rect[][] => {
  const groups: Rect[][] = [[], [], [], [], [], [], [], [], []];

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const { center } = rect;

    // Determine grid position (0-8)
    const x = center.x < targetRect.left ? 0 : center.x <= targetRect.right ? 1 : 2;
    const y = center.y < targetRect.top ? 0 : center.y <= targetRect.bottom ? 1 : 2;
    const groupId = y * Grid.SIZE + x;
    groups[groupId].push(rect);

    // For corner elements, check if they overlap enough to be included in edge groups
    if (Grid.CORNERS.includes(groupId as typeof Grid.CORNERS[number])) {
      // Check horizontal overlap for top/bottom edges
      if (rect.left <= targetRect.right - targetRect.width * straightOverlapThreshold) {
        if (groupId === Grid.TOP_RIGHT) groups[Grid.TOP_CENTER].push(rect);
        else if (groupId === Grid.BOTTOM_RIGHT) groups[Grid.BOTTOM_CENTER].push(rect);
      }
      if (rect.right >= targetRect.left + targetRect.width * straightOverlapThreshold) {
        if (groupId === Grid.TOP_LEFT) groups[Grid.TOP_CENTER].push(rect);
        else if (groupId === Grid.BOTTOM_LEFT) groups[Grid.BOTTOM_CENTER].push(rect);
      }

      // Check vertical overlap for left/right edges
      if (rect.top <= targetRect.bottom - targetRect.height * straightOverlapThreshold) {
        if (groupId === Grid.BOTTOM_LEFT) groups[Grid.MIDDLE_LEFT].push(rect);
        else if (groupId === Grid.BOTTOM_RIGHT) groups[Grid.MIDDLE_RIGHT].push(rect);
      }
      if (rect.bottom >= targetRect.top + targetRect.height * straightOverlapThreshold) {
        if (groupId === Grid.TOP_LEFT) groups[Grid.MIDDLE_LEFT].push(rect);
        else if (groupId === Grid.TOP_RIGHT) groups[Grid.MIDDLE_RIGHT].push(rect);
      }
    }
  }

  return groups;
};

/**
 * Creates distance calculation functions for prioritizing navigation candidates.
 *
 * These functions measure different aspects of distance from a target rectangle
 * to help determine the best navigation target in each direction.
 *
 * @param targetRect - Reference rectangle to measure distances from
 * @returns Object containing distance functions for various criteria
 */
export const distanceBuilder = (targetRect: Rect): DistanceFunctions => {
  return {
    /**
     * Distance from center vertical line (plumb line).
     * Prefers elements aligned vertically with the target.
     */
    nearPlumbLineIsBetter: (rect: Rect): number => {
      const d =
        rect.center.x < targetRect.center.x
          ? targetRect.center.x - rect.right
          : rect.left - targetRect.center.x;
      return d < 0 ? 0 : d;
    },

    /**
     * Distance from center horizontal line (horizon).
     * Prefers elements aligned horizontally with the target.
     */
    nearHorizonIsBetter: (rect: Rect): number => {
      const d =
        rect.center.y < targetRect.center.y
          ? targetRect.center.y - rect.bottom
          : rect.top - targetRect.center.y;
      return d < 0 ? 0 : d;
    },

    /**
     * Distance from target's left edge.
     * Used for horizontal navigation alignment.
     */
    nearTargetLeftIsBetter: (rect: Rect): number => {
      const d =
        rect.center.x < targetRect.center.x
          ? targetRect.left - rect.right
          : rect.left - targetRect.left;
      return d < 0 ? 0 : d;
    },

    /**
     * Distance from target's top edge.
     * Used for vertical navigation alignment.
     */
    nearTargetTopIsBetter: (rect: Rect): number => {
      const d =
        rect.center.y < targetRect.center.y
          ? targetRect.top - rect.bottom
          : rect.top - targetRect.top;
      return d < 0 ? 0 : d;
    },

    /** Prefers elements with smaller top values (higher on screen) */
    topIsBetter: (rect: Rect): number => rect.top,

    /** Prefers elements with larger bottom values (lower on screen) */
    bottomIsBetter: (rect: Rect): number => -1 * rect.bottom,

    /** Prefers elements with smaller left values (more to the left) */
    leftIsBetter: (rect: Rect): number => rect.left,

    /** Prefers elements with larger right values (more to the right) */
    rightIsBetter: (rect: Rect): number => -1 * rect.right
  };
};

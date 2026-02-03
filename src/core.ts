import type {
  Config,
  Direction,
  Priorities,
  Priority,
  Rect,
  SpatialEventDetail
} from './types';

// Re-export geometry functions for backwards compatibility
export { getRect, partition, distanceBuilder } from './geometry';
import { getRect, partition, distanceBuilder } from './geometry';

/*****************/
/* Core Function */
/*****************/
let EVENT_PREFIX = 'sn:';

/**
 * Sets the event prefix for custom events dispatched by the library.
 * @param prefix The new prefix to use (e.g., 'spatial:')
 */
export const setEventPrefix = (prefix: string): void => {
  EVENT_PREFIX = prefix;
};

/**
 * Gets the current event prefix.
 * @returns The current event prefix
 */
export const getEventPrefix = (): string => {
  return EVENT_PREFIX;
};

export const prioritize = (priorities: Priorities): Rect[] | null => {
  let destPriority: Priority | null = null;

  for (let i = 0; i < priorities.length; i++) {
    if (priorities[i].group.length) {
      destPriority = priorities[i];
      break;
    }
  }

  if (!destPriority) {
    return null;
  }

  const destDistance = destPriority.distance;

  destPriority.group.sort((a, b) => {
    for (let i = 0; i < destDistance.length; i++) {
      const distance = destDistance[i];
      const delta = distance(a) - distance(b);

      if (delta) {
        return delta;
      }
    }

    return 0;
  });

  return destPriority.group;
};

export const navigate = (
  target: HTMLElement,
  direction: Direction,
  candidates: HTMLElement[],
  config: Config
) => {
  if (!target || !direction || !candidates || !candidates.length) {
    return null;
  }

  const rects: Rect[] = [];
  const targetRect = getRect(target);

  if (!targetRect) return null;

  for (var i = 0; i < candidates.length; i++) {
    var rect = getRect(candidates[i]);
    if (rect) rects.push(rect);
  }
  if (!rects.length) return null;

  const distanceFunction = distanceBuilder(targetRect);
  const groups = partition(rects, targetRect, config.straightOverlapThreshold || 0.5);
  const internalGroups = partition(groups[4], targetRect, config.straightOverlapThreshold || 0.5);
  let priorities;

  switch (direction) {
    case 'left':
      priorities = [
        {
          group: internalGroups[0].concat(internalGroups[3]).concat(internalGroups[6]),
          distance: [distanceFunction.nearPlumbLineIsBetter, distanceFunction.topIsBetter]
        },
        {
          group: groups[3],
          distance: [distanceFunction.nearPlumbLineIsBetter, distanceFunction.topIsBetter]
        },
        {
          group: groups[0].concat(groups[6]),
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.rightIsBetter,
            distanceFunction.nearTargetTopIsBetter
          ]
        }
      ];
      break;
    case 'right':
      priorities = [
        {
          group: internalGroups[2].concat(internalGroups[5]).concat(internalGroups[8]),
          distance: [distanceFunction.nearPlumbLineIsBetter, distanceFunction.topIsBetter]
        },
        {
          group: groups[5],
          distance: [distanceFunction.nearPlumbLineIsBetter, distanceFunction.topIsBetter]
        },
        {
          group: groups[2].concat(groups[8]),
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.leftIsBetter,
            distanceFunction.nearTargetTopIsBetter
          ]
        }
      ];
      break;
    case 'up':
      priorities = [
        {
          group: internalGroups[0].concat(internalGroups[1]).concat(internalGroups[2]),
          distance: [distanceFunction.nearHorizonIsBetter, distanceFunction.leftIsBetter]
        },
        {
          group: groups[1],
          distance: [distanceFunction.nearHorizonIsBetter, distanceFunction.leftIsBetter]
        },
        {
          group: groups[0].concat(groups[2]),
          distance: [
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.bottomIsBetter,
            distanceFunction.nearTargetLeftIsBetter
          ]
        }
      ];
      break;
    case 'down':
      priorities = [
        {
          group: internalGroups[6].concat(internalGroups[7]).concat(internalGroups[8]),
          distance: [distanceFunction.nearHorizonIsBetter, distanceFunction.leftIsBetter]
        },
        {
          group: groups[7],
          distance: [distanceFunction.nearHorizonIsBetter, distanceFunction.leftIsBetter]
        },
        {
          group: groups[6].concat(groups[8]),
          distance: [
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.topIsBetter,
            distanceFunction.nearTargetLeftIsBetter
          ]
        }
      ];
      break;
    default:
      return null;
  }

  if (config.straightOnly) priorities.pop();

  const destGroup = prioritize(priorities);
  if (!destGroup) return null;

  let dest: HTMLElement | null = null;
  if (
    config.rememberSource &&
    config.previous &&
    config.previous.destination === target &&
    config.previous.reverse === direction
  ) {
    for (let j = 0; j < destGroup.length; j++) {
      if (destGroup[j].element === config.previous.target) {
        dest = destGroup[j].element;
        break;
      }
    }
  }

  if (!dest) {
    dest = destGroup[0].element;
  }

  return dest;
};

export const parseSelector = (selector: string | NodeList | HTMLElement): HTMLElement[] => {
  let result: HTMLElement[] = [];
  try {
    if (selector) {
      if (typeof selector === 'string') {
        result = [].slice.call(document.querySelectorAll(selector));
      } else if (selector instanceof NodeList) {
        result = [].slice.call(selector);
      } else if (selector instanceof HTMLElement) {
        result = [selector];
      }
    }
  } catch (err) {
    console.error(err);
  }
  return result;
};

export const matchSelector = (
  elem: HTMLElement | null | undefined,
  selector: string | HTMLElement[] | HTMLElement
): boolean => {
  if (!elem) return false;
  if (typeof selector === 'string') {
    return elem.matches(selector);
  } else if (Array.isArray(selector)) {
    return selector.includes(elem);
  } else if (selector instanceof HTMLElement) {
    return elem === selector;
  }
  return false;
};

export const getCurrentFocusedElement = (): HTMLElement | null => {
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement && activeElement !== document.body) {
    return activeElement;
  } else {
    return null;
  }
};

/**
 * Merges multiple source objects into a new object.
 * Properties from later sources override earlier ones.
 * Undefined values are ignored.
 *
 * @param out - Base object to extend
 * @param sources - Source objects to merge from
 * @returns New merged object (does not mutate inputs)
 */
// Overload: when first arg is empty object, infer from second
export function extend<T extends object>(out: object, source: T): T;
// Overload: when first arg is empty object with two sources
export function extend<T extends object, U extends object>(out: object, source1: T, source2: U): T & U;
// Overload: generic case
export function extend<T extends object>(out: T, ...sources: object[]): T;
// Implementation
export function extend(out: object, ...sources: object[]): object {
  const result = { ...out };
  for (const source of sources) {
    if (source) {
      for (const key of Object.keys(source)) {
        const value = (source as Record<string, unknown>)[key];
        if (value !== undefined) {
          (result as Record<string, unknown>)[key] = value;
        }
      }
    }
  }
  return result;
}

/**
 * Returns a new array with excluded elements removed.
 * Does not mutate the original array.
 *
 * @param elemList - Array of elements to filter
 * @param excludedElem - Element(s) to exclude
 * @returns New filtered array
 */
export const exclude = <T>(
  elemList: T[],
  excludedElem: T | T[]
): T[] => {
  const excludedSet = new Set(
    Array.isArray(excludedElem) ? excludedElem : [excludedElem]
  );
  return elemList.filter((elem) => !excludedSet.has(elem));
};

export const dispatch = (
  elem: HTMLElement,
  type: string,
  details?: SpatialEventDetail,
  cancelable = true
): boolean => {
  const evt = new CustomEvent(EVENT_PREFIX + type, { bubbles: true, cancelable, detail: details });
  return elem.dispatchEvent(evt);
};

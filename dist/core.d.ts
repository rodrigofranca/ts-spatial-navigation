import type { Config, Direction, Priorities, Rect, SpatialEventDetail } from './types';
export { getRect, partition, distanceBuilder } from './geometry';
/**
 * Sets the event prefix for custom events dispatched by the library.
 * @param prefix The new prefix to use (e.g., 'spatial:')
 */
export declare const setEventPrefix: (prefix: string) => void;
/**
 * Gets the current event prefix.
 * @returns The current event prefix
 */
export declare const getEventPrefix: () => string;
export declare const prioritize: (priorities: Priorities) => Rect[] | null;
export declare const navigate: (target: HTMLElement, direction: Direction, candidates: HTMLElement[], config: Config) => HTMLElement;
export declare const parseSelector: (selector: string | NodeList | HTMLElement) => HTMLElement[];
export declare const matchSelector: (elem: HTMLElement | null | undefined, selector: string | HTMLElement[] | HTMLElement) => boolean;
export declare const getCurrentFocusedElement: () => HTMLElement | null;
/**
 * Merges multiple source objects into a new object.
 * Properties from later sources override earlier ones.
 * Undefined values are ignored.
 *
 * @param out - Base object to extend
 * @param sources - Source objects to merge from
 * @returns New merged object (does not mutate inputs)
 */
export declare function extend<T extends object>(out: object, source: T): T;
export declare function extend<T extends object, U extends object>(out: object, source1: T, source2: U): T & U;
export declare function extend<T extends object>(out: T, ...sources: object[]): T;
/**
 * Returns a new array with excluded elements removed.
 * Does not mutate the original array.
 *
 * @param elemList - Array of elements to filter
 * @param excludedElem - Element(s) to exclude
 * @returns New filtered array
 */
export declare const exclude: <T>(elemList: T[], excludedElem: T | T[]) => T[];
export declare const dispatch: (elem: HTMLElement, type: string, details?: SpatialEventDetail, cancelable?: boolean) => boolean;

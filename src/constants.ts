/**
 * Constants for Spatial Navigation
 * Replaces magic numbers with named constants
 */

/**
 * Keyboard key codes for navigation
 */
export const KeyCode = {
  ENTER: 13,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
} as const;

export type KeyCodeValue = (typeof KeyCode)[keyof typeof KeyCode];

/**
 * Key code to direction mapping
 */
export const KEY_TO_DIRECTION = {
  [KeyCode.LEFT]: 'left',
  [KeyCode.UP]: 'up',
  [KeyCode.RIGHT]: 'right',
  [KeyCode.DOWN]: 'down',
} as const;

/**
 * Reverse direction mapping
 */
export const REVERSE_DIRECTION = {
  left: 'right',
  up: 'down',
  right: 'left',
  down: 'up',
} as const;

/**
 * Grid configuration for spatial partitioning
 * The navigation algorithm divides space into a 3x3 grid
 *
 *   0 | 1 | 2
 *   ---------
 *   3 | 4 | 5
 *   ---------
 *   6 | 7 | 8
 */
export const Grid = {
  SIZE: 3,
  TOTAL_CELLS: 9,

  // Named positions
  TOP_LEFT: 0,
  TOP_CENTER: 1,
  TOP_RIGHT: 2,
  MIDDLE_LEFT: 3,
  MIDDLE_CENTER: 4,
  MIDDLE_RIGHT: 5,
  BOTTOM_LEFT: 6,
  BOTTOM_CENTER: 7,
  BOTTOM_RIGHT: 8,

  // Corner positions (used for overlap calculations)
  CORNERS: [0, 2, 6, 8] as const,
} as const;

export type GridPosition = (typeof Grid)[
  | 'TOP_LEFT'
  | 'TOP_CENTER'
  | 'TOP_RIGHT'
  | 'MIDDLE_LEFT'
  | 'MIDDLE_CENTER'
  | 'MIDDLE_RIGHT'
  | 'BOTTOM_LEFT'
  | 'BOTTOM_CENTER'
  | 'BOTTOM_RIGHT'];

/**
 * Default configuration values
 */
export const Defaults = {
  SECTION_PREFIX: 'section-',
  EVENT_PREFIX: 'sn:',
  STRAIGHT_OVERLAP_THRESHOLD: 0.5,
  RESTRICT_MODE: 'self-first' as const,
  TAB_INDEX_IGNORE_LIST: 'a, input, select, textarea, button, iframe, [contentEditable=true]',
} as const;

/**
 * Event names (without prefix)
 */
export const EventName = {
  WILL_MOVE: 'willmove',
  WILL_FOCUS: 'willfocus',
  WILL_UNFOCUS: 'willunfocus',
  FOCUSED: 'focused',
  UNFOCUSED: 'unfocused',
  ENTER_DOWN: 'enter-down',
  ENTER_UP: 'enter-up',
  NAVIGATE_FAILED: 'navigatefailed',
} as const;

export type EventNameValue = (typeof EventName)[keyof typeof EventName];

/**
 * Restriction modes for section navigation
 */
export const RestrictMode = {
  SELF_FIRST: 'self-first',
  SELF_ONLY: 'self-only',
  NONE: 'none',
} as const;

export type RestrictModeValue = (typeof RestrictMode)[keyof typeof RestrictMode];

/**
 * Enter behavior options
 */
export const EnterTo = {
  LAST_FOCUSED: 'last-focused',
  DEFAULT_ELEMENT: 'default-element',
  NONE: '',
} as const;

export type EnterToValue = (typeof EnterTo)[keyof typeof EnterTo];

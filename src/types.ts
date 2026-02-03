/**
 * Spatial Navigation Type Definitions
 * Following Interface Segregation Principle (ISP)
 */

import type { EnterToValue, RestrictModeValue } from './constants';

// ============================================================================
// Core Types
// ============================================================================

/**
 * Navigation direction
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Selector type - can be CSS selector string, NodeList, or HTMLElement
 */
export type Selector = string | NodeList | HTMLElement | HTMLElement[];

/**
 * Extended selector - includes @sectionId syntax
 */
export type ExtendedSelector = Selector | `@${string}`;

// ============================================================================
// Geometry Types
// ============================================================================

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle with center point calculation
 */
export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  element: HTMLElement;
  center: {
    x: number;
    y: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

// ============================================================================
// Navigation Priority Types
// ============================================================================

/**
 * Distance calculation function
 */
export type DistanceFunction = (rect: Rect) => number;

/**
 * Collection of distance functions for navigation
 */
export interface DistanceFunctions {
  nearPlumbLineIsBetter: DistanceFunction;
  nearHorizonIsBetter: DistanceFunction;
  nearTargetLeftIsBetter: DistanceFunction;
  nearTargetTopIsBetter: DistanceFunction;
  topIsBetter: DistanceFunction;
  bottomIsBetter: DistanceFunction;
  leftIsBetter: DistanceFunction;
  rightIsBetter: DistanceFunction;
}

/**
 * Priority group with distance functions for sorting
 */
export interface Priority {
  group: Rect[];
  distance: DistanceFunction[];
}

/**
 * Array of priority groups
 */
export type Priorities = Priority[];

// ============================================================================
// Configuration Types (ISP - Segregated Interfaces)
// ============================================================================

/**
 * Basic section identification
 */
export interface SectionIdentity {
  /**
   * Unique identifier for the section
   */
  id?: string;

  /**
   * CSS selector for navigable elements in this section
   */
  selector?: string;
}

/**
 * Navigation behavior configuration
 */
export interface NavigationBehavior {
  /**
   * Only allow navigation in cardinal directions (no diagonal)
   * @default false
   */
  straightOnly?: boolean;

  /**
   * Threshold for straight direction overlap (0 to 1)
   * @default 0.5
   */
  straightOverlapThreshold?: number;

  /**
   * Remember previously focused element when navigating back
   * @default false
   */
  rememberSource?: boolean;
}

/**
 * Section transition configuration
 */
export interface SectionTransition {
  /**
   * Behavior when entering this section
   * - 'last-focused': Focus the last focused element
   * - 'default-element': Focus the default element
   * - '': Natural focus behavior
   * @default ''
   */
  enterTo?: EnterToValue | 'last-focused' | 'default-element' | '';

  /**
   * Configuration for leaving the section in specific directions
   */
  leaveFor?: Partial<LeaveFor>;

  /**
   * How to restrict navigation at section boundaries
   * - 'self-first': Prefer staying in section
   * - 'self-only': Never leave section via keyboard
   * - 'none': No restriction
   * @default 'self-first'
   */
  restrict?: RestrictModeValue | 'self-first' | 'self-only' | 'none';
}

/**
 * LeaveFor configuration - what to focus when leaving in each direction
 */
export interface LeaveFor {
  up?: string | HTMLElement;
  down?: string | HTMLElement;
  left?: string | HTMLElement;
  right?: string | HTMLElement;
}

/**
 * Filter configuration for navigable elements
 */
export interface FilterConfig {
  /**
   * Custom filter function for navigable elements
   * Return false to exclude an element from navigation
   */
  navigableFilter?: NavigableFilter;

  /**
   * Elements matching this selector will not have tabindex modified
   * @default 'a, input, select, textarea, button, iframe, [contentEditable=true]'
   */
  tabIndexIgnoreList?: string;

  /**
   * Whether to ignore hidden elements
   * @default false
   */
  ignoreHidden?: boolean;
}

/**
 * Navigable filter function signature
 */
export type NavigableFilter = (element: HTMLElement, sectionId: string) => boolean;

/**
 * Section state (internal)
 */
export interface SectionState {
  /**
   * Whether this section is disabled
   */
  disabled?: boolean;

  /**
   * Default element to focus when entering section
   */
  defaultElement?: HTMLElement | string;

  /**
   * Last focused element in this section
   */
  lastFocusedElement?: HTMLElement;

  /**
   * Previous navigation state for rememberSource
   */
  previous?: PreviousFocus;
}

/**
 * Previous focus state for rememberSource feature
 */
export interface PreviousFocus {
  target: HTMLElement;
  destination: HTMLElement;
  reverse: Direction;
}

// ============================================================================
// Combined Configuration Types
// ============================================================================

/**
 * Full section configuration
 * Combines all configuration interfaces
 */
export interface SectionConfig extends
  SectionIdentity,
  NavigationBehavior,
  SectionTransition,
  FilterConfig,
  SectionState {}

/**
 * Configuration for adding a new section
 * All properties optional except selector
 */
export interface AddSectionConfig extends Partial<SectionConfig> {
  selector: string;
}

/**
 * Global configuration
 */
export interface GlobalConfig extends
  Omit<SectionConfig, 'id' | 'lastFocusedElement' | 'previous'> {
  /**
   * Prefix for auto-generated section IDs
   * @default 'section-'
   */
  sectionPrefix?: string;

  /**
   * Prefix for custom events
   * @default 'sn:'
   */
  eventPrefix?: string;
}

/**
 * Legacy Config type for backwards compatibility
 * @deprecated Use SectionConfig instead
 */
export type Config = SectionConfig;

// ============================================================================
// Event Types
// ============================================================================

/**
 * Detail object for spatial navigation events
 */
export interface SpatialEventDetail {
  /**
   * Direction of navigation
   */
  direction?: Direction;

  /**
   * Current section ID
   */
  id?: string;

  /**
   * Next section ID (for cross-section navigation)
   */
  nextId?: string;

  /**
   * Element that will receive focus
   */
  nextElement?: HTMLElement;

  /**
   * Element that had focus before
   */
  previousElement?: HTMLElement;

  /**
   * Whether triggered by native focus events
   */
  native?: boolean;

  /**
   * What caused this navigation
   */
  cause?: 'keydown' | 'api';
}

/**
 * Spatial navigation custom event
 */
export interface SpatialEvent extends CustomEvent<SpatialEventDetail> {
  type: `sn:${string}`;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Section store - Map of section ID to configuration
 */
export type SectionStore = Map<string, SectionConfig>;

/**
 * Navigation state
 */
export interface NavigationState {
  ready: boolean;
  paused: boolean;
  duringFocusChange: boolean;
  sections: SectionStore;
  sectionCount: number;
  defaultSectionId: string;
  lastSectionId: string;
  idPool: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Extract non-undefined properties
 */
export type NonUndefined<T> = T extends undefined ? never : T;

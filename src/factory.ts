/**
 * Factory Module
 * Creates isolated instances of spatial navigation.
 * Enables multiple independent navigation contexts.
 */

import type { Direction, GlobalConfig, SectionConfig, AddSectionConfig } from './types';

/**
 * Options for creating a spatial navigation instance.
 */
export interface CreateSpatialNavigationOptions {
  /**
   * Initial global configuration.
   */
  config?: Partial<GlobalConfig>;

  /**
   * Whether to auto-initialize on creation.
   * @default false
   */
  autoInit?: boolean;
}

/**
 * Public API interface for spatial navigation.
 * This interface documents all public methods available on the navigation instance.
 */
export interface SpatialNavigationAPI {
  // Lifecycle
  init(): void;
  uninit(): void;
  clear(): void;

  // Configuration
  setConfig(config: Partial<GlobalConfig>): void;
  getConfig(): GlobalConfig;

  // Section management
  add(config: AddSectionConfig): string;
  add(id: string, config?: Partial<SectionConfig>): string;
  remove(id: string): boolean;
  disable(id: string): boolean;
  enable(id: string): boolean;
  set(id: string, config: Partial<SectionConfig>): boolean;
  get(id: string): SectionConfig | undefined;

  // Navigation
  focus(target?: string | HTMLElement, silent?: boolean): boolean;
  move(direction: Direction, selector?: string): boolean;

  // State control
  pause(): void;
  resume(): void;
  isPaused(): boolean;

  // DOM helpers
  makeFocusable(sectionId?: string): void;
  setDefaultSection(id: string): void;
}

/**
 * Creates a new spatial navigation instance.
 *
 * This factory function allows creating isolated navigation contexts,
 * useful for:
 * - Multiple independent navigation areas
 * - Testing with isolated state
 * - Micro-frontends or iframe scenarios
 *
 * @example
 * ```typescript
 * // Create an instance with custom config
 * const nav = createSpatialNavigation({
 *   config: {
 *     straightOnly: true,
 *     eventPrefix: 'custom:'
 *   },
 *   autoInit: true
 * });
 *
 * // Add sections
 * nav.add({ selector: '.nav-item' });
 *
 * // Navigate
 * nav.move('right');
 * ```
 *
 * @param options - Configuration options for the instance
 * @returns A spatial navigation instance with the full API
 */
export function createSpatialNavigation(
  _options?: CreateSpatialNavigationOptions
): SpatialNavigationAPI {
  // TODO: Implement full isolated instance
  // For now, this is a placeholder that documents the intended API.
  // Full implementation requires refactoring spatial-navigation.ts
  // to support dependency injection of state.
  throw new Error(
    'createSpatialNavigation() is not yet fully implemented. ' +
    'Use the default export from spatial-navigation.ts for now.'
  );
}

/**
 * Type for the default singleton instance.
 * Includes all public API methods plus legacy compatibility.
 */
export type SpatialNavigationInstance = SpatialNavigationAPI & {
  /**
   * @deprecated Use getConfig() instead
   */
  globalConfig: GlobalConfig;
};

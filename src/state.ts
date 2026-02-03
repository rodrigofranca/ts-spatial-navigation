/**
 * State Management Module
 * Encapsulates navigation state with type-safe access.
 */

import type { GlobalConfig, SectionConfig, NavigationState, SectionStore } from './types';
import { Defaults } from './constants';

/**
 * Creates initial global configuration with default values.
 */
export const createDefaultGlobalConfig = (): GlobalConfig => ({
  selector: '',
  straightOnly: false,
  straightOverlapThreshold: Defaults.STRAIGHT_OVERLAP_THRESHOLD,
  rememberSource: false,
  disabled: false,
  defaultElement: '',
  enterTo: '',
  leaveFor: null,
  restrict: Defaults.RESTRICT_MODE,
  tabIndexIgnoreList: Defaults.TAB_INDEX_IGNORE_LIST,
  sectionPrefix: Defaults.SECTION_PREFIX,
  eventPrefix: Defaults.EVENT_PREFIX,
});

/**
 * Creates initial navigation state.
 */
export const createInitialState = (): NavigationState => ({
  ready: false,
  paused: false,
  duringFocusChange: false,
  sections: new Map<string, SectionConfig>(),
  sectionCount: 0,
  defaultSectionId: '',
  lastSectionId: '',
  idPool: 0,
});

/**
 * State Manager class for encapsulating navigation state.
 * Provides type-safe access to state with controlled mutations.
 */
export class StateManager {
  private _state: NavigationState;
  private _globalConfig: GlobalConfig;

  constructor() {
    this._state = createInitialState();
    this._globalConfig = createDefaultGlobalConfig();
  }

  // ============================================================================
  // Global Config Accessors
  // ============================================================================

  get globalConfig(): GlobalConfig {
    return this._globalConfig;
  }

  setGlobalConfig(config: Partial<GlobalConfig>): void {
    this._globalConfig = { ...this._globalConfig, ...config };
  }

  // ============================================================================
  // State Accessors
  // ============================================================================

  get ready(): boolean {
    return this._state.ready;
  }

  setReady(value: boolean): void {
    this._state.ready = value;
  }

  get paused(): boolean {
    return this._state.paused;
  }

  setPaused(value: boolean): void {
    this._state.paused = value;
  }

  get duringFocusChange(): boolean {
    return this._state.duringFocusChange;
  }

  setDuringFocusChange(value: boolean): void {
    this._state.duringFocusChange = value;
  }

  get defaultSectionId(): string {
    return this._state.defaultSectionId;
  }

  setDefaultSectionId(value: string): void {
    this._state.defaultSectionId = value;
  }

  get lastSectionId(): string {
    return this._state.lastSectionId;
  }

  setLastSectionId(value: string): void {
    this._state.lastSectionId = value;
  }

  // ============================================================================
  // Section Management
  // ============================================================================

  get sectionCount(): number {
    return this._state.sectionCount;
  }

  get sections(): SectionStore {
    return this._state.sections;
  }

  /**
   * Generates a unique section ID.
   */
  generateSectionId(): string {
    const prefix = this._globalConfig.sectionPrefix || Defaults.SECTION_PREFIX;
    const id = `${prefix}${++this._state.idPool}`;
    return id;
  }

  /**
   * Checks if a section exists.
   */
  hasSection(id: string): boolean {
    return this._state.sections.has(id);
  }

  /**
   * Gets a section configuration.
   */
  getSection(id: string): SectionConfig | undefined {
    return this._state.sections.get(id);
  }

  /**
   * Adds or updates a section.
   */
  setSection(id: string, config: SectionConfig): void {
    const isNew = !this._state.sections.has(id);
    this._state.sections.set(id, config);
    if (isNew) {
      this._state.sectionCount++;
    }
  }

  /**
   * Removes a section.
   */
  removeSection(id: string): boolean {
    const existed = this._state.sections.delete(id);
    if (existed) {
      this._state.sectionCount--;
    }
    return existed;
  }

  /**
   * Gets all section IDs.
   */
  getSectionIds(): string[] {
    return Array.from(this._state.sections.keys());
  }

  /**
   * Clears all sections.
   */
  clearSections(): void {
    this._state.sections.clear();
    this._state.sectionCount = 0;
    this._state.defaultSectionId = '';
    this._state.lastSectionId = '';
  }

  // ============================================================================
  // State Reset
  // ============================================================================

  /**
   * Resets state to initial values.
   */
  reset(): void {
    this._state = createInitialState();
  }

  /**
   * Resets global config to defaults.
   */
  resetGlobalConfig(): void {
    this._globalConfig = createDefaultGlobalConfig();
  }

  /**
   * Full reset of both state and config.
   */
  fullReset(): void {
    this.reset();
    this.resetGlobalConfig();
  }
}

/**
 * Default singleton instance for backwards compatibility.
 * New code should prefer creating instances via createSpatialNavigation().
 */
export const defaultStateManager = new StateManager();

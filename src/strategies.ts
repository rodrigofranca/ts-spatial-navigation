/**
 * Navigation Strategy Module
 * Implements Strategy Pattern for directional navigation.
 *
 * Each direction has its own strategy for determining navigation priorities
 * based on spatial relationships between elements.
 */

import type { Direction, DistanceFunctions, Priority, Rect } from './types';
import { Grid } from './constants';

/**
 * Strategy interface for navigation direction.
 * Each direction implements this interface to define its priority rules.
 */
export interface NavigationStrategy {
  /**
   * The direction this strategy handles.
   */
  readonly direction: Direction;

  /**
   * Builds priority groups for candidate selection.
   *
   * @param groups - 9-element array from partition() (external groups)
   * @param internalGroups - 9-element array from partition() (internal groups for overlapping)
   * @param distanceFunctions - Distance calculation functions
   * @returns Array of priority groups, ordered by preference
   */
  buildPriorities(
    groups: Rect[][],
    internalGroups: Rect[][],
    distanceFunctions: DistanceFunctions
  ): Priority[];
}

/**
 * Strategy for navigating LEFT.
 * Prioritizes elements to the left of the current focus.
 */
export const leftStrategy: NavigationStrategy = {
  direction: 'left',

  buildPriorities(groups, internalGroups, df): Priority[] {
    return [
      {
        // First priority: internal elements to the left (within overlapping zone)
        group: internalGroups[Grid.TOP_LEFT]
          .concat(internalGroups[Grid.MIDDLE_LEFT])
          .concat(internalGroups[Grid.BOTTOM_LEFT]),
        distance: [df.nearPlumbLineIsBetter, df.topIsBetter]
      },
      {
        // Second priority: external elements directly to the left
        group: groups[Grid.MIDDLE_LEFT],
        distance: [df.nearPlumbLineIsBetter, df.topIsBetter]
      },
      {
        // Third priority: corner elements (diagonal)
        group: groups[Grid.TOP_LEFT].concat(groups[Grid.BOTTOM_LEFT]),
        distance: [df.nearHorizonIsBetter, df.rightIsBetter, df.nearTargetTopIsBetter]
      }
    ];
  }
};

/**
 * Strategy for navigating RIGHT.
 * Prioritizes elements to the right of the current focus.
 */
export const rightStrategy: NavigationStrategy = {
  direction: 'right',

  buildPriorities(groups, internalGroups, df): Priority[] {
    return [
      {
        group: internalGroups[Grid.TOP_RIGHT]
          .concat(internalGroups[Grid.MIDDLE_RIGHT])
          .concat(internalGroups[Grid.BOTTOM_RIGHT]),
        distance: [df.nearPlumbLineIsBetter, df.topIsBetter]
      },
      {
        group: groups[Grid.MIDDLE_RIGHT],
        distance: [df.nearPlumbLineIsBetter, df.topIsBetter]
      },
      {
        group: groups[Grid.TOP_RIGHT].concat(groups[Grid.BOTTOM_RIGHT]),
        distance: [df.nearHorizonIsBetter, df.leftIsBetter, df.nearTargetTopIsBetter]
      }
    ];
  }
};

/**
 * Strategy for navigating UP.
 * Prioritizes elements above the current focus.
 */
export const upStrategy: NavigationStrategy = {
  direction: 'up',

  buildPriorities(groups, internalGroups, df): Priority[] {
    return [
      {
        group: internalGroups[Grid.TOP_LEFT]
          .concat(internalGroups[Grid.TOP_CENTER])
          .concat(internalGroups[Grid.TOP_RIGHT]),
        distance: [df.nearHorizonIsBetter, df.leftIsBetter]
      },
      {
        group: groups[Grid.TOP_CENTER],
        distance: [df.nearHorizonIsBetter, df.leftIsBetter]
      },
      {
        group: groups[Grid.TOP_LEFT].concat(groups[Grid.TOP_RIGHT]),
        distance: [df.nearPlumbLineIsBetter, df.bottomIsBetter, df.nearTargetLeftIsBetter]
      }
    ];
  }
};

/**
 * Strategy for navigating DOWN.
 * Prioritizes elements below the current focus.
 */
export const downStrategy: NavigationStrategy = {
  direction: 'down',

  buildPriorities(groups, internalGroups, df): Priority[] {
    return [
      {
        group: internalGroups[Grid.BOTTOM_LEFT]
          .concat(internalGroups[Grid.BOTTOM_CENTER])
          .concat(internalGroups[Grid.BOTTOM_RIGHT]),
        distance: [df.nearHorizonIsBetter, df.leftIsBetter]
      },
      {
        group: groups[Grid.BOTTOM_CENTER],
        distance: [df.nearHorizonIsBetter, df.leftIsBetter]
      },
      {
        group: groups[Grid.BOTTOM_LEFT].concat(groups[Grid.BOTTOM_RIGHT]),
        distance: [df.nearPlumbLineIsBetter, df.topIsBetter, df.nearTargetLeftIsBetter]
      }
    ];
  }
};

/**
 * Map of direction to strategy.
 * Allows O(1) lookup of strategy by direction.
 */
export const navigationStrategies: Record<Direction, NavigationStrategy> = {
  left: leftStrategy,
  right: rightStrategy,
  up: upStrategy,
  down: downStrategy
};

/**
 * Gets the navigation strategy for a direction.
 *
 * @param direction - Navigation direction
 * @returns The strategy for that direction, or undefined if invalid
 */
export function getStrategy(direction: Direction): NavigationStrategy | undefined {
  return navigationStrategies[direction];
}

/**
 * Builds priorities for a given direction using the Strategy pattern.
 *
 * @param direction - Navigation direction
 * @param groups - External partition groups
 * @param internalGroups - Internal partition groups
 * @param distanceFunctions - Distance calculation functions
 * @returns Priority array or null if direction is invalid
 */
export function buildPrioritiesForDirection(
  direction: Direction,
  groups: Rect[][],
  internalGroups: Rect[][],
  distanceFunctions: DistanceFunctions
): Priority[] | null {
  const strategy = getStrategy(direction);
  if (!strategy) {
    return null;
  }
  return strategy.buildPriorities(groups, internalGroups, distanceFunctions);
}

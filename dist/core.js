var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Re-export geometry functions for backwards compatibility
export { getRect, partition, distanceBuilder } from './geometry';
import { getRect, partition, distanceBuilder } from './geometry';
/*****************/
/* Core Function */
/*****************/
var EVENT_PREFIX = 'sn:';
/**
 * Sets the event prefix for custom events dispatched by the library.
 * @param prefix The new prefix to use (e.g., 'spatial:')
 */
export var setEventPrefix = function (prefix) {
    EVENT_PREFIX = prefix;
};
/**
 * Gets the current event prefix.
 * @returns The current event prefix
 */
export var getEventPrefix = function () {
    return EVENT_PREFIX;
};
export var prioritize = function (priorities) {
    var destPriority = null;
    for (var i = 0; i < priorities.length; i++) {
        if (priorities[i].group.length) {
            destPriority = priorities[i];
            break;
        }
    }
    if (!destPriority) {
        return null;
    }
    var destDistance = destPriority.distance;
    destPriority.group.sort(function (a, b) {
        for (var i = 0; i < destDistance.length; i++) {
            var distance = destDistance[i];
            var delta = distance(a) - distance(b);
            if (delta) {
                return delta;
            }
        }
        return 0;
    });
    return destPriority.group;
};
export var navigate = function (target, direction, candidates, config) {
    if (!target || !direction || !candidates || !candidates.length) {
        return null;
    }
    var rects = [];
    var targetRect = getRect(target);
    if (!targetRect)
        return null;
    for (var i = 0; i < candidates.length; i++) {
        var rect = getRect(candidates[i]);
        if (rect)
            rects.push(rect);
    }
    if (!rects.length)
        return null;
    var distanceFunction = distanceBuilder(targetRect);
    var groups = partition(rects, targetRect, config.straightOverlapThreshold || 0.5);
    var internalGroups = partition(groups[4], targetRect, config.straightOverlapThreshold || 0.5);
    var priorities;
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
    if (config.straightOnly)
        priorities.pop();
    var destGroup = prioritize(priorities);
    if (!destGroup)
        return null;
    var dest = null;
    if (config.rememberSource &&
        config.previous &&
        config.previous.destination === target &&
        config.previous.reverse === direction) {
        for (var j = 0; j < destGroup.length; j++) {
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
export var parseSelector = function (selector) {
    var result = [];
    try {
        if (selector) {
            if (typeof selector === 'string') {
                result = [].slice.call(document.querySelectorAll(selector));
            }
            else if (selector instanceof NodeList) {
                result = [].slice.call(selector);
            }
            else if (selector instanceof HTMLElement) {
                result = [selector];
            }
        }
    }
    catch (err) {
        console.error(err);
    }
    return result;
};
export var matchSelector = function (elem, selector) {
    if (!elem)
        return false;
    if (typeof selector === 'string') {
        return elem.matches(selector);
    }
    else if (Array.isArray(selector)) {
        return selector.includes(elem);
    }
    else if (selector instanceof HTMLElement) {
        return elem === selector;
    }
    return false;
};
export var getCurrentFocusedElement = function () {
    var activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) {
        return activeElement;
    }
    else {
        return null;
    }
};
// Implementation
export function extend(out) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    var result = __assign({}, out);
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        if (source) {
            for (var _b = 0, _c = Object.keys(source); _b < _c.length; _b++) {
                var key = _c[_b];
                var value = source[key];
                if (value !== undefined) {
                    result[key] = value;
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
export var exclude = function (elemList, excludedElem) {
    var excludedSet = new Set(Array.isArray(excludedElem) ? excludedElem : [excludedElem]);
    return elemList.filter(function (elem) { return !excludedSet.has(elem); });
};
export var dispatch = function (elem, type, details, cancelable) {
    if (cancelable === void 0) { cancelable = true; }
    var evt = new CustomEvent(EVENT_PREFIX + type, { bubbles: true, cancelable: cancelable, detail: details });
    return elem.dispatchEvent(evt);
};

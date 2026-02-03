# ts-spatial-navigation

A TypeScript library for spatial navigation in Smart TV applications, TV boxes, and any interface that requires arrow key navigation.

[![npm version](https://badge.fury.io/js/ts-spatial-navigation.svg)](https://www.npmjs.com/package/ts-spatial-navigation)
[![CI](https://github.com/user/ts-spatial-navigation/actions/workflows/ci.yml/badge.svg)](https://github.com/user/ts-spatial-navigation/actions/workflows/ci.yml)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

## Features

- 🎯 **Intuitive Navigation** - Determines which element to focus based on arrow key direction
- 📦 **Section Management** - Group elements logically (menu, content, modal)
- ⚙️ **Highly Configurable** - Customize navigation behavior per section
- 🔒 **Type Safe** - Written in TypeScript with full type definitions
- 🪶 **Zero Dependencies** - No external runtime dependencies
- 📱 **Platform Support** - Works on webOS, Tizen, Android TV, Fire TV, and web browsers

## Installation

```bash
npm install ts-spatial-navigation
```

## Quick Start

```typescript
import SpatialNavigation from 'ts-spatial-navigation';

// Initialize
SpatialNavigation.init();

// Add a section with focusable elements
SpatialNavigation.add({
  id: 'menu',
  selector: '.menu-item'
});

// Make elements focusable
SpatialNavigation.makeFocusable();

// Focus the first element
SpatialNavigation.focus();
```

## Usage

### Basic Setup

```html
<nav>
  <button class="menu-item">Home</button>
  <button class="menu-item">Movies</button>
  <button class="menu-item">Series</button>
  <button class="menu-item">Settings</button>
</nav>
```

```typescript
import SpatialNavigation from 'ts-spatial-navigation';

SpatialNavigation.init();

SpatialNavigation.add({
  id: 'main-menu',
  selector: '.menu-item',
  defaultElement: '.menu-item:first-child'
});

SpatialNavigation.makeFocusable();
SpatialNavigation.focus();
```

### Multiple Sections

```typescript
// Menu section
SpatialNavigation.add({
  id: 'menu',
  selector: '.menu-item',
  restrict: 'self-only' // Cannot leave this section via keyboard
});

// Content section
SpatialNavigation.add({
  id: 'content',
  selector: '.content-card',
  enterTo: 'last-focused' // Remember last focused element
});
```

### Configuration Options

```typescript
SpatialNavigation.add({
  id: 'my-section',
  selector: '.focusable',

  // Navigation behavior
  straightOnly: false,           // Allow diagonal navigation
  straightOverlapThreshold: 0.5, // Threshold for straight navigation
  rememberSource: true,          // Remember where we came from

  // Section transitions
  enterTo: 'last-focused',       // 'last-focused' | 'default-element' | ''
  restrict: 'self-first',        // 'self-first' | 'self-only' | 'none'

  // Default element
  defaultElement: '.first-item',

  // Leave behavior
  leaveFor: {
    left: '#other-section',
    right: '@another-section',   // @ syntax for section ID
    up: null,                    // Prevent leaving in this direction
    down: '.specific-element'
  }
});
```

### Events

```typescript
// Listen for navigation events
document.addEventListener('sn:willfocus', (e) => {
  console.log('About to focus:', e.detail.nextElement);
  // e.preventDefault() to cancel
});

document.addEventListener('sn:focused', (e) => {
  console.log('Focused:', e.target);
  console.log('Direction:', e.detail.direction);
});

document.addEventListener('sn:willunfocus', (e) => {
  console.log('About to unfocus:', e.target);
});

document.addEventListener('sn:unfocused', (e) => {
  console.log('Unfocused:', e.target);
});

// Enter key events
document.addEventListener('sn:enter-down', (e) => {
  console.log('Enter pressed on:', e.target);
});

document.addEventListener('sn:enter-up', (e) => {
  console.log('Enter released on:', e.target);
});

// Navigation failed (no element found in direction)
document.addEventListener('sn:navigatefailed', (e) => {
  console.log('Cannot navigate:', e.detail.direction);
});
```

### Programmatic Navigation

```typescript
// Focus specific element
SpatialNavigation.focus('#my-element');
SpatialNavigation.focus(document.getElementById('my-element'));

// Focus a section
SpatialNavigation.focus('@menu'); // Focus default/last element in 'menu' section

// Move in a direction
SpatialNavigation.move('right');
SpatialNavigation.move('up');

// Pause/Resume navigation
SpatialNavigation.pause();
SpatialNavigation.resume();

// Enable/Disable sections
SpatialNavigation.disable('menu');
SpatialNavigation.enable('menu');
```

### Global Configuration

```typescript
SpatialNavigation.init();

// Set global configuration
SpatialNavigation.set({
  straightOnly: true,
  tabIndexIgnoreList: 'a, input, select, textarea, button'
});

// Set default section
SpatialNavigation.setDefaultSection('main-content');
```

## API Reference

### Methods

| Method | Description |
|--------|-------------|
| `init()` | Initialize spatial navigation |
| `uninit()` | Uninitialize and cleanup |
| `clear()` | Remove all sections |
| `add(config)` | Add a new section |
| `remove(id)` | Remove a section |
| `set(id, config)` | Update section configuration |
| `get(id)` | Get section configuration |
| `disable(id)` | Disable a section |
| `enable(id)` | Enable a section |
| `focus(target?, silent?)` | Focus an element or section |
| `move(direction, selector?)` | Move focus in a direction |
| `pause()` | Pause navigation |
| `resume()` | Resume navigation |
| `makeFocusable(id?)` | Add tabindex to elements |
| `setDefaultSection(id)` | Set default section |

### Types

```typescript
import type {
  Direction,           // 'up' | 'down' | 'left' | 'right'
  SectionConfig,       // Section configuration
  GlobalConfig,        // Global configuration
  SpatialEventDetail   // Event detail object
} from 'ts-spatial-navigation';
```

### Sub-module Imports

```typescript
// Import specific modules
import { getRect, partition } from 'ts-spatial-navigation/geometry';
import { KeyCode, Grid, Defaults } from 'ts-spatial-navigation/constants';
import { navigationStrategies } from 'ts-spatial-navigation/strategies';
```

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Samsung Tizen TV
- LG webOS TV
- Android TV (Chrome-based)
- Amazon Fire TV

## CSS Styling

```css
/* Focus styles */
.focusable:focus {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}

/* Optional: Add focus-visible for better UX */
.focusable:focus:not(:focus-visible) {
  outline: none;
}

.focusable:focus-visible {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}
```

## Migration from js-spatial-navigation

This library is a TypeScript port of [js-spatial-navigation](https://github.com/luke-chang/js-spatial-navigation). The API is fully compatible:

```diff
- <script src="spatial_navigation.js"></script>
- <script>SpatialNavigation.init();</script>
+ import SpatialNavigation from 'ts-spatial-navigation';
+ SpatialNavigation.init();
```

## License

[MPL-2.0](LICENSE) - Mozilla Public License 2.0

## Credits

Based on [js-spatial-navigation](https://github.com/luke-chang/js-spatial-navigation) by Luke Chang.

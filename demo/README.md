# Spatial Navigation - Interactive Demos

This folder contains a modern Vite-based demo application showcasing all features of the `spatial-navigation` TypeScript library.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Demos

### 1. Basic Navigation
Demonstrates the core API:
- `init()`, `add()`, `makeFocusable()`, `focus()`
- Event system (willmove, willfocus, focused, etc.)
- Configuration options (straightOnly, rememberSource, straightOverlapThreshold)
- Pause/Resume functionality

### 2. Filters
Shows element filtering and navigation override:
- `navigableFilter` function to exclude elements
- `data-sn-up`, `data-sn-down`, `data-sn-left`, `data-sn-right` attributes
- Custom navigation paths using selectors

### 3. Sections
Multiple section management:
- Creating and managing multiple sections
- `@sectionId` syntax for cross-section navigation
- `enterTo` behavior (last-focused, default-element)
- Section-specific default elements

### 4. Restrictions
Section boundary control:
- `restrict` modes: self-first, self-only, none
- `leaveFor` configuration for controlled exits
- Visual demonstration of each mode

### 5. Integration
Complete Smart TV-style application:
- Sidebar menu navigation
- Content grid with cards
- Modal dialog with trapped focus
- ESC key handling
- Real-world navigation patterns

## Features

### Event Log
All spatial navigation events are logged in real-time in the sidebar. Enable "Debug Mode" in the footer to see detailed event data.

### Keyboard Controls
- **Arrow Keys**: Navigate between focusable elements
- **Enter**: Select/activate focused element
- **ESC**: Close modal dialogs (in Integration demo)

## Project Structure

```
demo/
├── index.html              # Main HTML entry point
├── package.json            # Demo dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
└── src/
    ├── main.ts             # App initialization & event logging
    ├── styles/
    │   ├── main.css        # Layout & theme styles
    │   └── focus.css       # Focus states & animations
    └── examples/
        ├── basic.ts        # Basic navigation demo
        ├── filters.ts      # Filters & override demo
        ├── sections.ts     # Multi-section demo
        ├── restrictions.ts # Restrict modes demo
        └── integration.ts  # Smart TV integration demo
```

## Development

### Adding a New Demo

1. Create a new file in `src/examples/`:

```typescript
import { getDemoContainer, log, SpatialNavigation } from '../main';

export function loadMyDemo() {
  const container = getDemoContainer();

  container.innerHTML = `
    <div class="demo-section">
      <!-- Your demo HTML -->
    </div>
  `;

  // Setup spatial navigation sections
  SpatialNavigation.add({
    id: 'my-section',
    selector: '.my-focusable',
  });

  SpatialNavigation.makeFocusable('my-section');
  SpatialNavigation.focus('my-section');

  log('my-demo-loaded');

  return {
    load: () => {},
    cleanup: () => {
      SpatialNavigation.remove('my-section');
    },
  };
}
```

2. Add to `main.ts`:

```typescript
import { loadMyDemo } from './examples/mydemo';

const demos = {
  // ...existing demos
  mydemo: loadMyDemo,
};
```

3. Add navigation button in `index.html`:

```html
<button class="nav-btn" data-demo="mydemo">My Demo</button>
```

### Styling Focusable Elements

Use the `.focusable` class for consistent focus styling:

```html
<div class="focusable" tabindex="-1">
  Focusable Element
</div>
```

Focus states are handled automatically via CSS in `focus.css`.

## Building for Production

```bash
# Build static files
pnpm build

# Preview production build
pnpm preview
```

Output will be in the `dist/` folder.

## Browser Compatibility

The demo app uses modern JavaScript features but the library itself is compiled to ES5 for broad compatibility:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

For Smart TV browsers, test with your target platform.

## License

MPL-2.0 - See [LICENSE](../LICENSE) in the parent directory.

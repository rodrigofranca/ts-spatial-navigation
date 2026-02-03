import SpatialNavigation from 'spatial-navigation';
import { loadBasicDemo } from './examples/basic';
import { loadFiltersDemo } from './examples/filters';
import { loadSectionsDemo } from './examples/sections';
import { loadRestrictionsDemo } from './examples/restrictions';
import { loadIntegrationDemo } from './examples/integration';

// Types
type DemoName = 'basic' | 'filters' | 'sections' | 'restrictions' | 'integration';

interface DemoModule {
  load: () => void;
  cleanup: () => void;
}

// State
let currentDemo: DemoName = 'basic';
let debugMode = false;
const eventLog: HTMLUListElement = document.getElementById('events') as HTMLUListElement;
const demoContainer: HTMLDivElement = document.getElementById('demo-container') as HTMLDivElement;

// Demo loaders map
const demos: Record<DemoName, () => DemoModule> = {
  basic: loadBasicDemo,
  filters: loadFiltersDemo,
  sections: loadSectionsDemo,
  restrictions: loadRestrictionsDemo,
  integration: loadIntegrationDemo,
};

let currentDemoModule: DemoModule | null = null;

// Event logging
function logEvent(eventName: string, detail?: Record<string, unknown>) {
  const li = document.createElement('li');
  const typeSpan = document.createElement('span');
  typeSpan.className = 'event-type';
  typeSpan.textContent = eventName;
  li.appendChild(typeSpan);

  if (detail && debugMode) {
    const detailSpan = document.createElement('span');
    detailSpan.className = 'event-detail';
    detailSpan.textContent = JSON.stringify(detail);
    li.appendChild(detailSpan);
  }

  eventLog.insertBefore(li, eventLog.firstChild);

  // Keep only last 50 events
  while (eventLog.children.length > 50) {
    eventLog.removeChild(eventLog.lastChild!);
  }
}

// Setup global event listeners for spatial navigation
function setupEventListeners() {
  const events = [
    'sn:willmove',
    'sn:willfocus',
    'sn:willunfocus',
    'sn:focused',
    'sn:unfocused',
    'sn:enter-down',
    'sn:enter-up',
    'sn:navigatefailed',
  ];

  events.forEach((eventName) => {
    document.addEventListener(eventName, (e: Event) => {
      const customEvent = e as CustomEvent;
      logEvent(eventName.replace('sn:', ''), {
        direction: customEvent.detail?.direction,
        sectionId: customEvent.detail?.sectionId || customEvent.detail?.id,
      });
    });
  });
}

// Load a demo
function loadDemo(name: DemoName) {
  // Cleanup previous demo
  if (currentDemoModule) {
    currentDemoModule.cleanup();
  }

  // Clear container
  demoContainer.innerHTML = '';

  // Clear spatial navigation state
  SpatialNavigation.clear();

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-demo') === name);
  });

  // Load new demo
  currentDemo = name;
  currentDemoModule = demos[name]();
  currentDemoModule.load();

  logEvent('demo-loaded', { name });
}

// Initialize
function init() {
  // Setup spatial navigation event listeners
  setupEventListeners();

  // Initialize spatial navigation
  SpatialNavigation.init();

  // Setup demo navigation
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const demoName = btn.getAttribute('data-demo') as DemoName;
      if (demoName) {
        loadDemo(demoName);
      }
    });
  });

  // Setup clear log button
  document.getElementById('clear-log')?.addEventListener('click', () => {
    eventLog.innerHTML = '';
    logEvent('log-cleared');
  });

  // Setup debug mode toggle
  const debugToggle = document.getElementById('debug-mode') as HTMLInputElement;
  debugToggle?.addEventListener('change', () => {
    debugMode = debugToggle.checked;
    logEvent('debug-mode', { enabled: debugMode });
  });

  // Load initial demo
  loadDemo('basic');

  logEvent('app-initialized');
}

// Export utilities for demos
export function getDemoContainer(): HTMLDivElement {
  return demoContainer;
}

export function log(message: string, detail?: Record<string, unknown>) {
  logEvent(message, detail);
}

export { SpatialNavigation };

// Start app
init();

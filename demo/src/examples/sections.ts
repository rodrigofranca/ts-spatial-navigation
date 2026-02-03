/**
 * Sections Demo
 * Demonstrates: Multiple sections, @sectionId syntax, enterTo, defaultElement
 * Consolidates: 2.1_multiple_sections, 2.2_specify_next_section, 2.3_enter_to_last_focused, 2.4_enter_to_default_element
 */

import { getDemoContainer, log, SpatialNavigation } from '../main';

export function loadSectionsDemo() {
  const container = getDemoContainer();

  container.innerHTML = `
    <div class="demo-section">
      <h2>Multiple Sections</h2>
      <p class="demo-description">
        Spatial Navigation supports multiple independent sections. Each section can have
        its own configuration and behavior.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <!-- Section A -->
        <div class="section" id="section-a-container">
          <div class="section-label">Section A <span class="indicator" id="indicator-a" style="display: none;">Active</span></div>
          <div class="demo-grid" id="section-a" style="grid-template-columns: repeat(2, 1fr);">
            ${Array.from({ length: 4 }, (_, i) => `
              <div class="focusable section-a-item" tabindex="-1" data-index="A${i + 1}"
                   ${i === 0 ? 'id="default-a"' : ''}>
                A${i + 1}${i === 0 ? ' (default)' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section B -->
        <div class="section" id="section-b-container">
          <div class="section-label">Section B <span class="indicator" id="indicator-b" style="display: none;">Active</span></div>
          <div class="demo-grid" id="section-b" style="grid-template-columns: repeat(2, 1fr);">
            ${Array.from({ length: 4 }, (_, i) => `
              <div class="focusable section-b-item" tabindex="-1" data-index="B${i + 1}"
                   ${i === 0 ? 'id="default-b"' : ''}>
                B${i + 1}${i === 0 ? ' (default)' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <h3>Cross-Section Navigation</h3>
      <p class="demo-description">
        Press right from Section A to go to Section B, or left from Section B to go to Section A.
        The <code>@sectionId</code> syntax allows targeting another section directly.
      </p>

      <h3>Enter Behavior</h3>
      <div class="demo-config">
        <label>
          <span>Section A enterTo:</span>
          <select id="enter-to-a">
            <option value="">None (natural focus)</option>
            <option value="default-element" selected>default-element</option>
            <option value="last-focused">last-focused</option>
          </select>
        </label>
        <label>
          <span>Section B enterTo:</span>
          <select id="enter-to-b">
            <option value="">None (natural focus)</option>
            <option value="default-element" selected>default-element</option>
            <option value="last-focused">last-focused</option>
          </select>
        </label>
      </div>

      <h3>Quick Jump</h3>
      <div class="demo-config">
        <button class="btn focusable" id="focus-section-a">Focus Section A</button>
        <button class="btn focusable" id="focus-section-b">Focus Section B</button>
      </div>

      <div style="margin-top: 1rem;">
        <span class="status" id="current-section">Current: None</span>
      </div>
    </div>
  `;

  const indicatorA = document.getElementById('indicator-a') as HTMLSpanElement;
  const indicatorB = document.getElementById('indicator-b') as HTMLSpanElement;
  const currentSection = document.getElementById('current-section') as HTMLSpanElement;
  const sectionAContainer = document.getElementById('section-a-container') as HTMLDivElement;
  const sectionBContainer = document.getElementById('section-b-container') as HTMLDivElement;

  // Update active section indicator
  function updateActiveSection(sectionId: string | null) {
    indicatorA.style.display = sectionId === 'section-a' ? 'inline-block' : 'none';
    indicatorB.style.display = sectionId === 'section-b' ? 'inline-block' : 'none';
    sectionAContainer.classList.toggle('active', sectionId === 'section-a');
    sectionBContainer.classList.toggle('active', sectionId === 'section-b');
    currentSection.textContent = `Current: ${sectionId || 'None'}`;
  }

  // Setup Section A
  SpatialNavigation.add({
    id: 'section-a',
    selector: '.section-a-item',
    enterTo: 'default-element',
    defaultElement: '#default-a',
    leaveFor: {
      right: '@section-b',
    },
  });

  // Setup Section B
  SpatialNavigation.add({
    id: 'section-b',
    selector: '.section-b-item',
    enterTo: 'default-element',
    defaultElement: '#default-b',
    leaveFor: {
      left: '@section-a',
    },
  });

  // Add button section
  SpatialNavigation.add({
    id: 'sections-buttons',
    selector: '.demo-config .focusable',
  });

  SpatialNavigation.makeFocusable('section-a');
  SpatialNavigation.makeFocusable('section-b');
  SpatialNavigation.makeFocusable('sections-buttons');
  SpatialNavigation.focus('section-a');

  // Track focus to update indicators
  container.addEventListener('focus', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('section-a-item')) {
      updateActiveSection('section-a');
    } else if (target.classList.contains('section-b-item')) {
      updateActiveSection('section-b');
    }
  }, true);

  // EnterTo configuration handlers
  const enterToA = document.getElementById('enter-to-a') as HTMLSelectElement;
  const enterToB = document.getElementById('enter-to-b') as HTMLSelectElement;

  enterToA.addEventListener('change', () => {
    SpatialNavigation.set({
      id: 'section-a',
      enterTo: enterToA.value as '' | 'default-element' | 'last-focused',
    });
    log('section-a-config', { enterTo: enterToA.value || 'none' });
  });

  enterToB.addEventListener('change', () => {
    SpatialNavigation.set({
      id: 'section-b',
      enterTo: enterToB.value as '' | 'default-element' | 'last-focused',
    });
    log('section-b-config', { enterTo: enterToB.value || 'none' });
  });

  // Quick jump buttons
  document.getElementById('focus-section-a')?.addEventListener('click', () => {
    SpatialNavigation.focus('section-a');
    log('jump-to-section', { section: 'section-a' });
  });

  document.getElementById('focus-section-b')?.addEventListener('click', () => {
    SpatialNavigation.focus('section-b');
    log('jump-to-section', { section: 'section-b' });
  });

  updateActiveSection('section-a');
  log('sections-demo-loaded');

  return {
    load: () => {},
    cleanup: () => {
      SpatialNavigation.remove('section-a');
      SpatialNavigation.remove('section-b');
      SpatialNavigation.remove('sections-buttons');
    },
  };
}

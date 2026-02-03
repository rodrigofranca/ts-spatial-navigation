/**
 * Basic Demo
 * Demonstrates: init(), add(), makeFocusable(), focus(), events, basic config
 * Consolidates: 1.1_basic, 1.3_events, 1.4_basic_config
 */

import { getDemoContainer, log, SpatialNavigation } from '../main';

export function loadBasicDemo() {
  const container = getDemoContainer();

  // Create demo HTML
  container.innerHTML = `
    <div class="demo-section">
      <h2>Basic Navigation</h2>
      <p class="demo-description">
        Use arrow keys to navigate between elements. The focused element is highlighted.
        This demo shows the core API: init(), add(), makeFocusable(), and focus().
      </p>

      <h3>Navigation Grid</h3>
      <div class="demo-grid" id="basic-grid">
        ${Array.from({ length: 8 }, (_, i) => `
          <div class="focusable" tabindex="-1" data-index="${i + 1}">
            ${i + 1}
          </div>
        `).join('')}
      </div>

      <h3>Configuration Options</h3>
      <div class="demo-config">
        <label>
          <input type="checkbox" id="straight-only">
          <span>straightOnly</span>
          <small style="color: #888; margin-left: 0.5rem;">
            (Only allow navigation in cardinal directions)
          </small>
        </label>
        <label>
          <input type="checkbox" id="remember-source">
          <span>rememberSource</span>
          <small style="color: #888; margin-left: 0.5rem;">
            (Remember previous element when navigating back)
          </small>
        </label>
      </div>

      <h3>Threshold Control</h3>
      <div class="demo-config">
        <label>
          <span>straightOverlapThreshold:</span>
          <input type="range" id="overlap-threshold" min="0" max="1" step="0.1" value="0.5">
          <span id="threshold-value">0.5</span>
        </label>
      </div>

      <h3>API Actions</h3>
      <div class="demo-config">
        <button class="btn focusable" id="btn-focus-1">Focus Element 1</button>
        <button class="btn focusable" id="btn-focus-5">Focus Element 5</button>
        <button class="btn focusable" id="btn-pause">Pause Navigation</button>
        <button class="btn focusable" id="btn-resume">Resume Navigation</button>
      </div>

      <div class="status" id="nav-status">Navigation Active</div>
    </div>
  `;

  // Get elements
  const straightOnlyCheckbox = document.getElementById('straight-only') as HTMLInputElement;
  const rememberSourceCheckbox = document.getElementById('remember-source') as HTMLInputElement;
  const thresholdSlider = document.getElementById('overlap-threshold') as HTMLInputElement;
  const thresholdValue = document.getElementById('threshold-value') as HTMLSpanElement;
  const navStatus = document.getElementById('nav-status') as HTMLDivElement;

  // Setup spatial navigation section
  SpatialNavigation.add({
    id: 'basic-section',
    selector: '#basic-grid .focusable, .demo-config .focusable',
    straightOnly: false,
    rememberSource: false,
    straightOverlapThreshold: 0.5,
  });

  SpatialNavigation.makeFocusable('basic-section');
  SpatialNavigation.focus('basic-section');

  // Configuration handlers
  straightOnlyCheckbox.addEventListener('change', () => {
    SpatialNavigation.set({
      id: 'basic-section',
      straightOnly: straightOnlyCheckbox.checked,
    });
    log('config-changed', { straightOnly: straightOnlyCheckbox.checked });
  });

  rememberSourceCheckbox.addEventListener('change', () => {
    SpatialNavigation.set({
      id: 'basic-section',
      rememberSource: rememberSourceCheckbox.checked,
    });
    log('config-changed', { rememberSource: rememberSourceCheckbox.checked });
  });

  thresholdSlider.addEventListener('input', () => {
    const value = parseFloat(thresholdSlider.value);
    thresholdValue.textContent = value.toFixed(1);
    SpatialNavigation.set({
      id: 'basic-section',
      straightOverlapThreshold: value,
    });
    log('config-changed', { straightOverlapThreshold: value });
  });

  // Action buttons
  document.getElementById('btn-focus-1')?.addEventListener('click', () => {
    const elem = container.querySelector('[data-index="1"]') as HTMLElement;
    if (elem) {
      SpatialNavigation.focus(elem);
      log('focus-requested', { element: 1 });
    }
  });

  document.getElementById('btn-focus-5')?.addEventListener('click', () => {
    const elem = container.querySelector('[data-index="5"]') as HTMLElement;
    if (elem) {
      SpatialNavigation.focus(elem);
      log('focus-requested', { element: 5 });
    }
  });

  document.getElementById('btn-pause')?.addEventListener('click', () => {
    SpatialNavigation.pause();
    navStatus.textContent = 'Navigation Paused';
    navStatus.classList.add('paused');
    log('navigation-paused');
  });

  document.getElementById('btn-resume')?.addEventListener('click', () => {
    SpatialNavigation.resume();
    navStatus.textContent = 'Navigation Active';
    navStatus.classList.remove('paused');
    log('navigation-resumed');
  });

  // Enter key handling for grid elements
  container.querySelectorAll('#basic-grid .focusable').forEach((elem) => {
    elem.addEventListener('sn:enter-down', () => {
      elem.classList.toggle('selected');
      log('element-selected', { index: elem.getAttribute('data-index') });
    });
  });

  log('basic-demo-loaded');

  return {
    load: () => {},
    cleanup: () => {
      SpatialNavigation.remove('basic-section');
    },
  };
}

/**
 * Filters Demo
 * Demonstrates: navigableFilter function, data-sn-* attributes for navigation override
 * Consolidates: 1.5_navigable_filter, 1.6_specify_next_element
 */

import { getDemoContainer, log, SpatialNavigation } from '../main';

export function loadFiltersDemo() {
  const container = getDemoContainer();

  container.innerHTML = `
    <div class="demo-section">
      <h2>Filters & Navigation Override</h2>
      <p class="demo-description">
        This demo shows how to filter elements from navigation and override navigation
        direction using data attributes.
      </p>

      <h3>Navigable Filter</h3>
      <p class="demo-description">
        Elements 3 and 6 are filtered out using <code>navigableFilter</code>.
        Navigation will skip them automatically.
      </p>
      <div class="demo-grid" id="filter-grid">
        ${Array.from({ length: 8 }, (_, i) => {
          const isFiltered = i === 2 || i === 5;
          return `
            <div class="focusable ${isFiltered ? 'disabled' : ''}"
                 tabindex="-1"
                 data-index="${i + 1}"
                 ${isFiltered ? 'data-filtered="true"' : ''}>
              ${i + 1}${isFiltered ? ' (filtered)' : ''}
            </div>
          `;
        }).join('')}
      </div>

      <h3>Custom Navigation Override (data-sn-*)</h3>
      <p class="demo-description">
        Use <code>data-sn-up</code>, <code>data-sn-down</code>, <code>data-sn-left</code>,
        <code>data-sn-right</code> attributes to override navigation direction.
        Try navigating from A - the arrows show custom paths.
      </p>
      <div id="custom-nav-grid" style="position: relative; margin: 2rem 0;">
        <div style="display: flex; gap: 2rem; align-items: center; justify-content: center;">
          <!-- Row 1 -->
          <div class="focusable custom-nav" tabindex="-1" data-id="A"
               data-sn-right="#elem-C"
               data-sn-down="#elem-D"
               style="width: 80px; height: 80px;">
            A
            <small style="font-size: 0.6rem; display: block;">right->C, down->D</small>
          </div>

          <div class="focusable custom-nav" tabindex="-1" data-id="B"
               style="width: 80px; height: 80px;">
            B
          </div>

          <div class="focusable custom-nav" tabindex="-1" data-id="C"
               data-sn-left="#elem-A"
               style="width: 80px; height: 80px;">
            C
            <small style="font-size: 0.6rem; display: block;">left->A</small>
          </div>
        </div>

        <div style="display: flex; gap: 2rem; align-items: center; justify-content: center; margin-top: 1rem;">
          <!-- Row 2 -->
          <div class="focusable custom-nav" tabindex="-1" data-id="D"
               data-sn-up="#elem-A"
               style="width: 80px; height: 80px;">
            D
            <small style="font-size: 0.6rem; display: block;">up->A</small>
          </div>

          <div class="focusable custom-nav" tabindex="-1" data-id="E"
               style="width: 80px; height: 80px;">
            E
          </div>

          <div class="focusable custom-nav" tabindex="-1" data-id="F"
               data-sn-left="@filter-section"
               style="width: 80px; height: 80px;">
            F
            <small style="font-size: 0.6rem; display: block;">left->section</small>
          </div>
        </div>
      </div>

      <h3>Filter Control</h3>
      <div class="demo-config">
        <label>
          <input type="checkbox" id="enable-filter" checked>
          <span>Enable navigable filter (skip elements 3 & 6)</span>
        </label>
      </div>
    </div>
  `;

  // Custom filter function
  const filterFunction = (elem: HTMLElement) => {
    return elem.getAttribute('data-filtered') !== 'true';
  };

  // Setup filter section
  SpatialNavigation.add({
    id: 'filter-section',
    selector: '#filter-grid .focusable',
    navigableFilter: filterFunction,
  });

  // Setup custom navigation section
  SpatialNavigation.add({
    id: 'custom-nav-section',
    selector: '.custom-nav',
  });

  SpatialNavigation.makeFocusable('filter-section');
  SpatialNavigation.makeFocusable('custom-nav-section');
  SpatialNavigation.focus('filter-section');

  // Add IDs for data-sn selectors
  container.querySelectorAll('.custom-nav').forEach((elem) => {
    const id = elem.getAttribute('data-id');
    if (id) {
      elem.id = `elem-${id}`;
    }
  });

  // Filter toggle
  const enableFilter = document.getElementById('enable-filter') as HTMLInputElement;
  enableFilter.addEventListener('change', () => {
    SpatialNavigation.set({
      id: 'filter-section',
      navigableFilter: enableFilter.checked ? filterFunction : null,
    });
    log('filter-toggled', { enabled: enableFilter.checked });

    // Visual feedback
    container.querySelectorAll('[data-filtered="true"]').forEach((elem) => {
      elem.classList.toggle('disabled', enableFilter.checked);
    });
  });

  // Log navigation for custom elements
  container.querySelectorAll('.custom-nav').forEach((elem) => {
    elem.addEventListener('focus', () => {
      log('custom-nav-focused', { id: elem.getAttribute('data-id') });
    });
  });

  log('filters-demo-loaded');

  return {
    load: () => {},
    cleanup: () => {
      SpatialNavigation.remove('filter-section');
      SpatialNavigation.remove('custom-nav-section');
    },
  };
}

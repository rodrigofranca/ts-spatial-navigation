/**
 * Restrictions Demo
 * Demonstrates: restrict modes (self-first, self-only, none), leaveFor configuration
 * Consolidates: 2.5_restrict, 2.6_leave_current_section_for
 */

import { getDemoContainer, log, SpatialNavigation } from '../main';

export function loadRestrictionsDemo() {
  const container = getDemoContainer();

  container.innerHTML = `
    <div class="demo-section">
      <h2>Section Restrictions</h2>
      <p class="demo-description">
        Control how navigation behaves at section boundaries using the <code>restrict</code>
        property and <code>leaveFor</code> configuration.
      </p>

      <h3>Restrict Modes</h3>
      <p class="demo-description">
        <strong>self-first:</strong> Try to stay in section, but allow leaving if no element found<br>
        <strong>self-only:</strong> Never leave the section (trapped)<br>
        <strong>none:</strong> Ignore section boundaries completely
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <!-- Restricted Section -->
        <div class="section" id="restricted-container">
          <div class="section-label">
            Restricted Section
            <span class="indicator" id="restricted-indicator" style="display: none;">Active</span>
          </div>
          <div class="demo-grid" id="restricted-section" style="grid-template-columns: repeat(2, 1fr);">
            ${Array.from({ length: 4 }, (_, i) => `
              <div class="focusable restricted-item" tabindex="-1" data-index="R${i + 1}">
                R${i + 1}
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 1rem;">
            <label>
              <span>Restrict mode:</span>
              <select id="restrict-mode">
                <option value="self-first" selected>self-first (default)</option>
                <option value="self-only">self-only (trapped)</option>
                <option value="none">none (no boundaries)</option>
              </select>
            </label>
          </div>
        </div>

        <!-- Free Section -->
        <div class="section" id="free-container">
          <div class="section-label">
            Free Section
            <span class="indicator" id="free-indicator" style="display: none;">Active</span>
          </div>
          <div class="demo-grid" id="free-section" style="grid-template-columns: repeat(2, 1fr);">
            ${Array.from({ length: 4 }, (_, i) => `
              <div class="focusable free-item" tabindex="-1" data-index="F${i + 1}">
                F${i + 1}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <h3>LeaveFor Configuration</h3>
      <p class="demo-description">
        Define where focus should go when leaving a section in a specific direction.
        Configure exit points for the restricted section below.
      </p>

      <div class="demo-config">
        <label>
          <input type="checkbox" id="leave-up" checked>
          <span>Allow leave up (→ Free Section)</span>
        </label>
        <label>
          <input type="checkbox" id="leave-down">
          <span>Allow leave down</span>
        </label>
        <label>
          <input type="checkbox" id="leave-left">
          <span>Allow leave left</span>
        </label>
        <label>
          <input type="checkbox" id="leave-right" checked>
          <span>Allow leave right (→ Free Section)</span>
        </label>
      </div>

      <h3>Visual Guide</h3>
      <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 4px; font-size: 0.875rem;">
        <p><strong>self-first:</strong> Navigation tries to stay within the section first.
        If no focusable element is found in that direction within the section, it may leave.</p>
        <p><strong>self-only:</strong> Navigation is completely trapped within the section.
        You cannot leave regardless of direction.</p>
        <p><strong>none:</strong> Section boundaries are ignored.
        Navigation flows freely to the nearest element in any direction.</p>
      </div>

      <div style="margin-top: 1rem;">
        <span class="status" id="restrict-status">Mode: self-first</span>
      </div>
    </div>
  `;

  const restrictedIndicator = document.getElementById('restricted-indicator') as HTMLSpanElement;
  const freeIndicator = document.getElementById('free-indicator') as HTMLSpanElement;
  const restrictedContainer = document.getElementById('restricted-container') as HTMLDivElement;
  const freeContainer = document.getElementById('free-container') as HTMLDivElement;
  const restrictStatus = document.getElementById('restrict-status') as HTMLSpanElement;

  // Update section indicators
  function updateIndicators(sectionId: string | null) {
    restrictedIndicator.style.display = sectionId === 'restricted-section' ? 'inline-block' : 'none';
    freeIndicator.style.display = sectionId === 'free-section' ? 'inline-block' : 'none';
    restrictedContainer.classList.toggle('active', sectionId === 'restricted-section');
    freeContainer.classList.toggle('active', sectionId === 'free-section');
  }

  // Get leaveFor configuration
  function getLeaveFor() {
    const leaveFor: Record<string, string | null> = {};

    if ((document.getElementById('leave-up') as HTMLInputElement).checked) {
      leaveFor.up = '@free-section';
    }
    if ((document.getElementById('leave-down') as HTMLInputElement).checked) {
      leaveFor.down = '@free-section';
    }
    if ((document.getElementById('leave-left') as HTMLInputElement).checked) {
      leaveFor.left = '@free-section';
    }
    if ((document.getElementById('leave-right') as HTMLInputElement).checked) {
      leaveFor.right = '@free-section';
    }

    return Object.keys(leaveFor).length > 0 ? leaveFor : null;
  }

  // Setup restricted section
  SpatialNavigation.add({
    id: 'restricted-section',
    selector: '.restricted-item',
    restrict: 'self-first',
    leaveFor: getLeaveFor(),
  });

  // Setup free section
  SpatialNavigation.add({
    id: 'free-section',
    selector: '.free-item',
    restrict: 'none',
    leaveFor: {
      left: '@restricted-section',
    },
  });

  SpatialNavigation.makeFocusable('restricted-section');
  SpatialNavigation.makeFocusable('free-section');
  SpatialNavigation.focus('restricted-section');

  // Track focus changes
  container.addEventListener('focus', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('restricted-item')) {
      updateIndicators('restricted-section');
    } else if (target.classList.contains('free-item')) {
      updateIndicators('free-section');
    }
  }, true);

  // Restrict mode handler
  const restrictMode = document.getElementById('restrict-mode') as HTMLSelectElement;
  restrictMode.addEventListener('change', () => {
    const mode = restrictMode.value as 'self-first' | 'self-only' | 'none';
    SpatialNavigation.set({
      id: 'restricted-section',
      restrict: mode,
    });
    restrictStatus.textContent = `Mode: ${mode}`;
    log('restrict-mode-changed', { mode });
  });

  // LeaveFor handlers
  ['leave-up', 'leave-down', 'leave-left', 'leave-right'].forEach((id) => {
    document.getElementById(id)?.addEventListener('change', () => {
      SpatialNavigation.set({
        id: 'restricted-section',
        leaveFor: getLeaveFor(),
      });
      log('leaveFor-changed', { leaveFor: getLeaveFor() });
    });
  });

  updateIndicators('restricted-section');
  log('restrictions-demo-loaded');

  return {
    load: () => {},
    cleanup: () => {
      SpatialNavigation.remove('restricted-section');
      SpatialNavigation.remove('free-section');
    },
  };
}

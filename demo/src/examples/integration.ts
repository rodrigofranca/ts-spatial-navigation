/**
 * Integration Demo
 * Demonstrates: Full Smart TV-style application with menu, content grid, and modal
 * Consolidates: 3.1_put_all_together
 */

import { getDemoContainer, log, SpatialNavigation } from '../main';

export function loadIntegrationDemo() {
  const container = getDemoContainer();

  container.innerHTML = `
    <div class="demo-section" style="height: calc(100vh - 300px); min-height: 400px;">
      <h2>Smart TV Integration Example</h2>
      <p class="demo-description">
        A complete Smart TV-style interface with sidebar menu, content grid, and modal dialog.
        Press Enter on any content card to open a modal.
      </p>

      <div id="tv-app" style="display: flex; height: calc(100% - 80px); gap: 1rem; margin-top: 1rem;">
        <!-- Sidebar Menu -->
        <nav id="sidebar" style="width: 160px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.5rem 0;">
          <div class="section-label" style="padding: 0.5rem 1rem;">Menu</div>
          <div class="menu-item focusable" tabindex="-1" data-category="home" id="menu-home">
            <span>Home</span>
          </div>
          <div class="menu-item focusable" tabindex="-1" data-category="movies">
            <span>Movies</span>
          </div>
          <div class="menu-item focusable" tabindex="-1" data-category="series">
            <span>Series</span>
          </div>
          <div class="menu-item focusable" tabindex="-1" data-category="sports">
            <span>Sports</span>
          </div>
          <div class="menu-item focusable" tabindex="-1" data-category="settings">
            <span>Settings</span>
          </div>
        </nav>

        <!-- Main Content Area -->
        <main id="content-area" style="flex: 1; overflow: hidden;">
          <div class="section-label" id="content-title">Featured Content</div>
          <div id="content-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 0.5rem;">
            ${Array.from({ length: 6 }, (_, i) => `
              <div class="card focusable" tabindex="-1" data-id="card-${i + 1}">
                <div class="card-image">${['🎬', '🎭', '🏀', '🎮', '🎵', '📺'][i]}</div>
                <div class="card-content">
                  <p class="card-title">Content ${i + 1}</p>
                  <p class="card-subtitle">Press Enter to view details</p>
                </div>
              </div>
            `).join('')}
          </div>
        </main>
      </div>

      <!-- Modal Overlay -->
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <h2 id="modal-title">Content Details</h2>
          <p id="modal-description">This is a modal dialog. Navigation is trapped inside until you close it.</p>
          <div class="modal-actions">
            <button class="modal-btn secondary focusable" tabindex="-1" id="modal-cancel">Cancel</button>
            <button class="modal-btn primary focusable" tabindex="-1" id="modal-confirm">Play</button>
          </div>
        </div>
      </div>

      <div style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;">
        <span class="status" id="app-status">Ready</span>
        <small style="color: #888;">Press ESC to close modal</small>
      </div>
    </div>
  `;

  const sidebar = document.getElementById('sidebar') as HTMLElement;
  const contentArea = document.getElementById('content-area') as HTMLElement;
  const modalOverlay = document.getElementById('modal-overlay') as HTMLDivElement;
  const modalTitle = document.getElementById('modal-title') as HTMLHeadingElement;
  const appStatus = document.getElementById('app-status') as HTMLSpanElement;
  const contentTitle = document.getElementById('content-title') as HTMLDivElement;

  let isModalOpen = false;

  // Update app status
  function updateStatus(status: string) {
    appStatus.textContent = status;
    log('app-status', { status });
  }

  // Open modal
  function openModal(cardId: string) {
    modalTitle.textContent = `Details: ${cardId}`;
    modalOverlay.classList.add('visible');
    isModalOpen = true;

    // Pause main navigation and enable modal
    SpatialNavigation.disable('sidebar-section');
    SpatialNavigation.disable('content-section');
    SpatialNavigation.enable('modal-section');
    SpatialNavigation.focus('modal-section');

    updateStatus('Modal Open');
    log('modal-opened', { cardId });
  }

  // Close modal
  function closeModal() {
    modalOverlay.classList.remove('visible');
    isModalOpen = false;

    // Re-enable main navigation
    SpatialNavigation.disable('modal-section');
    SpatialNavigation.enable('sidebar-section');
    SpatialNavigation.enable('content-section');
    SpatialNavigation.focus('content-section');

    updateStatus('Ready');
    log('modal-closed');
  }

  // Setup sidebar section
  SpatialNavigation.add({
    id: 'sidebar-section',
    selector: '#sidebar .focusable',
    restrict: 'self-first',
    leaveFor: {
      right: '@content-section',
    },
    enterTo: 'last-focused',
    defaultElement: '#menu-home',
  });

  // Setup content section
  SpatialNavigation.add({
    id: 'content-section',
    selector: '#content-grid .focusable',
    restrict: 'self-first',
    leaveFor: {
      left: '@sidebar-section',
    },
  });

  // Setup modal section (initially disabled)
  SpatialNavigation.add({
    id: 'modal-section',
    selector: '.modal .focusable',
    restrict: 'self-only',
    disabled: true,
  });

  SpatialNavigation.makeFocusable('sidebar-section');
  SpatialNavigation.makeFocusable('content-section');
  SpatialNavigation.makeFocusable('modal-section');

  // Set default section and focus
  SpatialNavigation.setDefaultSection('content-section');
  SpatialNavigation.focus('sidebar-section');

  // Track active section for visual feedback
  container.addEventListener('focus', (e) => {
    const target = e.target as HTMLElement;

    // Update menu item active state
    if (target.classList.contains('menu-item')) {
      sidebar.querySelectorAll('.menu-item').forEach((item) => {
        item.classList.remove('active');
      });
      target.classList.add('active');

      const category = target.getAttribute('data-category');
      contentTitle.textContent = `${category?.charAt(0).toUpperCase()}${category?.slice(1)} Content`;
    }
  }, true);

  // Card enter handler
  container.querySelectorAll('#content-grid .card').forEach((card) => {
    card.addEventListener('sn:enter-down', () => {
      const cardId = card.getAttribute('data-id');
      if (cardId) {
        openModal(cardId);
      }
    });
  });

  // Modal button handlers
  document.getElementById('modal-cancel')?.addEventListener('sn:enter-down', closeModal);
  document.getElementById('modal-confirm')?.addEventListener('sn:enter-down', () => {
    log('play-requested', { title: modalTitle.textContent });
    closeModal();
    updateStatus('Playing...');
    setTimeout(() => updateStatus('Ready'), 2000);
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  });

  // Menu item handler
  sidebar.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('sn:enter-down', () => {
      sidebar.querySelectorAll('.menu-item').forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const category = item.getAttribute('data-category');
      contentTitle.textContent = `${category?.charAt(0).toUpperCase()}${category?.slice(1)} Content`;
      log('menu-selected', { category });
    });
  });

  // Set initial active menu
  document.getElementById('menu-home')?.classList.add('active');

  updateStatus('Ready');
  log('integration-demo-loaded');

  return {
    load: () => {},
    cleanup: () => {
      SpatialNavigation.remove('sidebar-section');
      SpatialNavigation.remove('content-section');
      SpatialNavigation.remove('modal-section');
    },
  };
}

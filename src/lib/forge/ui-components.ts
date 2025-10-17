/**
 * VibeLux UI Components Library
 * Reusable UI components for CAD interface
 */

export class VibeLuxUI {
  /**
   * Create a toolbar button
   */
  static createToolButton(options: {
    id: string;
    icon: string;
    tooltip: string;
    onClick: () => void;
    active?: boolean;
  }): HTMLElement {
    const button = document.createElement('button');
    button.id = options.id;
    button.className = 'vibelux-tool-button';
    if (options.active) button.classList.add('active');
    
    button.innerHTML = `<span class="vibelux-tool-icon">${options.icon}</span>`;
    button.title = options.tooltip;
    button.onclick = options.onClick;
    
    return button;
  }

  /**
   * Create a snap indicator
   */
  static showSnapIndicator(position: { x: number; y: number }, type: string): HTMLElement {
    const indicator = document.createElement('div');
    indicator.className = 'vibelux-snap-indicator';
    indicator.style.left = position.x + 'px';
    indicator.style.top = position.y + 'px';
    
    const label = document.createElement('div');
    label.className = 'vibelux-snap-label';
    label.textContent = type;
    indicator.appendChild(label);
    
    document.body.appendChild(indicator);
    
    // Remove after animation
    setTimeout(() => indicator.remove(), 1000);
    
    return indicator;
  }

  /**
   * Create a dimension display
   */
  static createDimension(start: THREE.Vector3, end: THREE.Vector3, value: string): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'vibelux-dimension');
    
    // Calculate positions
    const startScreen = this.worldToScreen(start);
    const endScreen = this.worldToScreen(end);
    
    // Create line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'vibelux-dimension-line');
    line.setAttribute('x1', startScreen.x.toString());
    line.setAttribute('y1', startScreen.y.toString());
    line.setAttribute('x2', endScreen.x.toString());
    line.setAttribute('y2', endScreen.y.toString());
    
    // Create text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'vibelux-dimension-text');
    text.setAttribute('x', ((startScreen.x + endScreen.x) / 2).toString());
    text.setAttribute('y', ((startScreen.y + endScreen.y) / 2 - 10).toString());
    text.textContent = value;
    
    svg.appendChild(line);
    svg.appendChild(text);
    
    return svg;
  }

  /**
   * Create an array preview
   */
  static createArrayPreview(bounds: { x: number; y: number; width: number; height: number }, count: { x: number; y: number }): HTMLElement {
    const preview = document.createElement('div');
    preview.className = 'vibelux-array-preview';
    preview.style.left = bounds.x + 'px';
    preview.style.top = bounds.y + 'px';
    preview.style.width = bounds.width + 'px';
    preview.style.height = bounds.height + 'px';
    
    const countLabel = document.createElement('div');
    countLabel.className = 'vibelux-array-count';
    countLabel.textContent = `${count.x} × ${count.y} = ${count.x * count.y}`;
    preview.appendChild(countLabel);
    
    return preview;
  }

  /**
   * Create a calculation overlay
   */
  static createCalculationOverlay(title: string, calculations: Array<{ label: string; value: string }>): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'vibelux-calc-overlay';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'vibelux-calc-title';
    titleEl.textContent = title;
    overlay.appendChild(titleEl);
    
    calculations.forEach(calc => {
      const row = document.createElement('div');
      row.className = 'vibelux-calc-row';
      row.innerHTML = `
        <span class="vibelux-calc-label">${calc.label}:</span>
        <span class="vibelux-calc-value">${calc.value}</span>
      `;
      overlay.appendChild(row);
    });
    
    return overlay;
  }

  /**
   * Create a properties panel
   */
  static createPropertiesPanel(properties: Array<{ group: string; items: Array<{ label: string; value: string | number; type: string }> }>): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'vibelux-properties';
    
    properties.forEach(group => {
      const groupEl = document.createElement('div');
      groupEl.className = 'vibelux-property-group';
      
      const header = document.createElement('div');
      header.className = 'vibelux-property-header';
      header.textContent = group.group;
      groupEl.appendChild(header);
      
      const body = document.createElement('div');
      body.className = 'vibelux-property-body';
      
      group.items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'vibelux-property-row';
        
        const label = document.createElement('div');
        label.className = 'vibelux-property-label';
        label.textContent = item.label;
        
        const value = document.createElement('div');
        value.className = 'vibelux-property-value';
        
        switch (item.type) {
          case 'text':
            value.innerHTML = `<input type="text" class="vibelux-input" value="${item.value}">`;
            break;
          case 'number':
            value.innerHTML = `<input type="number" class="vibelux-input" value="${item.value}">`;
            break;
          case 'select':
            // Handle select options
            break;
          default:
            value.textContent = item.value.toString();
        }
        
        row.appendChild(label);
        row.appendChild(value);
        body.appendChild(row);
      });
      
      groupEl.appendChild(body);
      panel.appendChild(groupEl);
    });
    
    return panel;
  }

  /**
   * Create a context menu
   */
  static createContextMenu(items: Array<{ label: string; icon?: string; onClick: () => void; separator?: boolean }>): HTMLElement {
    const menu = document.createElement('div');
    menu.className = 'vibelux-context-menu';
    
    items.forEach(item => {
      if (item.separator) {
        const separator = document.createElement('div');
        separator.className = 'vibelux-context-separator';
        menu.appendChild(separator);
      } else {
        const menuItem = document.createElement('div');
        menuItem.className = 'vibelux-context-item';
        menuItem.innerHTML = `
          ${item.icon ? `<span class="vibelux-context-icon">${item.icon}</span>` : ''}
          <span>${item.label}</span>
        `;
        menuItem.onclick = () => {
          item.onClick();
          menu.classList.remove('show');
        };
        menu.appendChild(menuItem);
      }
    });
    
    return menu;
  }

  /**
   * Show a command palette
   */
  static showCommandPalette(commands: Array<{ label: string; shortcut?: string; action: () => void }>): void {
    const existing = document.querySelector('.vibelux-command-palette');
    if (existing) existing.remove();
    
    const palette = document.createElement('div');
    palette.className = 'vibelux-command-palette';
    
    const input = document.createElement('input');
    input.className = 'vibelux-command-input';
    input.placeholder = 'Type a command...';
    
    const results = document.createElement('div');
    results.className = 'vibelux-command-results';
    
    const renderResults = (filter: string = '') => {
      results.innerHTML = '';
      const filtered = commands.filter(cmd => 
        cmd.label.toLowerCase().includes(filter.toLowerCase())
      );
      
      filtered.forEach((cmd, index) => {
        const item = document.createElement('div');
        item.className = 'vibelux-command-item';
        if (index === 0) item.classList.add('selected');
        
        item.innerHTML = `
          <span>${cmd.label}</span>
          ${cmd.shortcut ? `<span class="vibelux-command-shortcut">${cmd.shortcut}</span>` : ''}
        `;
        
        item.onclick = () => {
          cmd.action();
          document.body.removeChild(palette);
        };
        
        results.appendChild(item);
      });
    };
    
    input.oninput = (e) => renderResults((e.target as HTMLInputElement).value);
    
    input.onkeydown = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(palette);
      } else if (e.key === 'Enter') {
        const selected = results.querySelector('.selected');
        if (selected) (selected as HTMLElement).click();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = Array.from(results.querySelectorAll('.vibelux-command-item'));
        const current = results.querySelector('.selected');
        const currentIndex = items.indexOf(current!);
        
        current?.classList.remove('selected');
        
        let newIndex = currentIndex;
        if (e.key === 'ArrowDown') {
          newIndex = (currentIndex + 1) % items.length;
        } else {
          newIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
        }
        
        items[newIndex].classList.add('selected');
      }
    };
    
    palette.appendChild(input);
    palette.appendChild(results);
    document.body.appendChild(palette);
    
    renderResults();
    input.focus();
  }

  /**
   * Create a status bar
   */
  static createStatusBar(): HTMLElement {
    const statusBar = document.createElement('div');
    statusBar.className = 'vibelux-status-bar';
    
    const leftSection = document.createElement('div');
    leftSection.className = 'vibelux-status-section';
    
    const rightSection = document.createElement('div');
    rightSection.className = 'vibelux-status-section';
    
    statusBar.appendChild(leftSection);
    statusBar.appendChild(rightSection);
    
    return statusBar;
  }

  /**
   * Update status bar item
   */
  static updateStatusItem(id: string, label: string, value: string): void {
    let item = document.getElementById(id);
    if (!item) {
      item = document.createElement('div');
      item.id = id;
      item.className = 'vibelux-status-item';
      
      const statusBar = document.querySelector('.vibelux-status-bar .vibelux-status-section');
      if (statusBar) statusBar.appendChild(item);
    }
    
    item.innerHTML = `${label}: <strong>${value}</strong>`;
  }

  /**
   * Show a tooltip
   */
  static showTooltip(element: HTMLElement, text: string, position: 'top' | 'bottom' | 'left' | 'right' = 'top'): void {
    const tooltip = document.createElement('div');
    tooltip.className = 'vibelux-tooltip';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    switch (position) {
      case 'top':
        tooltip.style.left = rect.left + rect.width / 2 - tooltipRect.width / 2 + 'px';
        tooltip.style.top = rect.top - tooltipRect.height - 8 + 'px';
        break;
      case 'bottom':
        tooltip.style.left = rect.left + rect.width / 2 - tooltipRect.width / 2 + 'px';
        tooltip.style.top = rect.bottom + 8 + 'px';
        break;
      case 'left':
        tooltip.style.left = rect.left - tooltipRect.width - 8 + 'px';
        tooltip.style.top = rect.top + rect.height / 2 - tooltipRect.height / 2 + 'px';
        break;
      case 'right':
        tooltip.style.left = rect.right + 8 + 'px';
        tooltip.style.top = rect.top + rect.height / 2 - tooltipRect.height / 2 + 'px';
        break;
    }
    
    setTimeout(() => tooltip.classList.add('show'), 10);
    
    element.addEventListener('mouseleave', () => {
      tooltip.classList.remove('show');
      setTimeout(() => tooltip.remove(), 200);
    }, { once: true });
  }

  /**
   * Show a modal dialog
   */
  static showModal(options: {
    title: string;
    content: string | HTMLElement;
    buttons?: Array<{ label: string; type?: string; onClick: () => void }>;
  }): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'vibelux-modal-backdrop';
    
    const modal = document.createElement('div');
    modal.className = 'vibelux-modal';
    
    const header = document.createElement('div');
    header.className = 'vibelux-modal-header';
    header.innerHTML = `
      <h3 class="vibelux-modal-title">${options.title}</h3>
      <button class="vibelux-modal-close">&times;</button>
    `;
    
    const body = document.createElement('div');
    body.className = 'vibelux-modal-body';
    if (typeof options.content === 'string') {
      body.innerHTML = options.content;
    } else {
      body.appendChild(options.content);
    }
    
    const footer = document.createElement('div');
    footer.className = 'vibelux-modal-footer';
    
    if (options.buttons) {
      options.buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `vibelux-btn ${btn.type ? `vibelux-btn-${btn.type}` : ''}`;
        button.textContent = btn.label;
        button.onclick = () => {
          btn.onClick();
          document.body.removeChild(backdrop);
        };
        footer.appendChild(button);
      });
    }
    
    modal.appendChild(header);
    modal.appendChild(body);
    if (options.buttons) modal.appendChild(footer);
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    header.querySelector('.vibelux-modal-close')!.addEventListener('click', () => {
      document.body.removeChild(backdrop);
    });
    
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        document.body.removeChild(backdrop);
      }
    });
  }

  /**
   * Show a notification
   */
  static showNotification(message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info', duration: number = 3000): void {
    const notification = document.createElement('div');
    notification.className = `vibelux-alert vibelux-alert-${type} vibelux-notification`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  /**
   * Helper: Convert world coordinates to screen
   */
  private static worldToScreen(position: THREE.Vector3): { x: number; y: number } {
    // This would need access to the viewer's camera
    // Simplified version - would be implemented properly in the extension
    return { x: position.x * 100, y: position.y * 100 };
  }

  /**
   * Create grid overlay
   */
  static createGridOverlay(spacing: number = 1, majorEvery: number = 5): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'vibelux-grid-overlay');
    svg.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
    
    // Would calculate based on viewport
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = 50; // pixels per unit
    
    // Minor grid lines
    for (let x = 0; x < width; x += spacing * scale) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'vibelux-grid-line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', '0');
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', height.toString());
      svg.appendChild(line);
    }
    
    for (let y = 0; y < height; y += spacing * scale) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'vibelux-grid-line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', width.toString());
      line.setAttribute('y2', y.toString());
      svg.appendChild(line);
    }
    
    // Major grid lines
    for (let x = 0; x < width; x += spacing * scale * majorEvery) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'vibelux-grid-major');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', '0');
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', height.toString());
      svg.appendChild(line);
    }
    
    for (let y = 0; y < height; y += spacing * scale * majorEvery) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'vibelux-grid-major');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', width.toString());
      line.setAttribute('y2', y.toString());
      svg.appendChild(line);
    }
    
    return svg;
  }

  /**
   * Theme switcher
   */
  static toggleTheme(): void {
    const body = document.body;
    if (body.classList.contains('vibelux-dark-theme')) {
      body.classList.remove('vibelux-dark-theme');
      body.classList.add('vibelux-light-theme');
      localStorage.setItem('vibelux-theme', 'light');
    } else {
      body.classList.remove('vibelux-light-theme');
      body.classList.add('vibelux-dark-theme');
      localStorage.setItem('vibelux-theme', 'dark');
    }
  }

  /**
   * Initialize theme from localStorage
   */
  static initializeTheme(): void {
    const savedTheme = localStorage.getItem('vibelux-theme') || 'dark';
    document.body.classList.add(`vibelux-${savedTheme}-theme`);
  }
}

// Export for use in extensions
export default VibeLuxUI;
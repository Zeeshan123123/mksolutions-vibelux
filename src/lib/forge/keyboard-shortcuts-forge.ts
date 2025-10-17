/**
 * Keyboard Shortcuts Forge Extension
 * Professional CAD keyboard shortcuts integrated with Forge viewer
 */

import { ForgeExtension } from './vibelux-forge-extensions';

interface ShortcutCommand {
  keys: string[];
  description: string;
  category: 'navigation' | 'selection' | 'tools' | 'view' | 'edit' | 'measure' | 'system';
  action: () => void;
  enabled: boolean;
}

interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutCommand[];
  enabled: boolean;
}

/**
 * Keyboard Shortcuts Extension
 * Professional CAD-style keyboard shortcuts for Forge
 */
export class KeyboardShortcutsExtension extends ForgeExtension {
  private shortcutsPanel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private shortcuts: Map<string, ShortcutCommand> = new Map();
  private activeKeys: Set<string> = new Set();
  private isEnabled: boolean = true;
  private customShortcuts: Map<string, ShortcutCommand> = new Map();

  private categories: ShortcutCategory[] = [
    {
      name: 'Navigation',
      enabled: true,
      shortcuts: []
    },
    {
      name: 'Selection',
      enabled: true,
      shortcuts: []
    },
    {
      name: 'View Controls',
      enabled: true,
      shortcuts: []
    },
    {
      name: 'Measurement Tools',
      enabled: true,
      shortcuts: []
    },
    {
      name: 'HVAC Systems',
      enabled: true,
      shortcuts: []
    },
    {
      name: 'Edit Tools',
      enabled: true,
      shortcuts: []
    }
  ];

  getName(): string {
    return 'VibeLux.KeyboardShortcuts';
  }

  load(): boolean {
    this.initializeShortcuts();
    this.setupEventHandlers();
    this.createShortcutsPanel();
    this.setupToolbar();
    console.log('VibeLux Keyboard Shortcuts Extension loaded');
    return true;
  }

  unload(): boolean {
    this.removeEventHandlers();
    if (this.shortcutsPanel) {
      this.shortcutsPanel.uninitialize();
      this.shortcutsPanel = null;
    }
    return true;
  }

  private initializeShortcuts(): void {
    // Navigation shortcuts
    this.addShortcut({
      keys: ['f'],
      description: 'Fit to view',
      category: 'navigation',
      action: () => this.viewer.fitToView(),
      enabled: true
    });

    this.addShortcut({
      keys: ['z', 'e'],
      description: 'Zoom extents',
      category: 'navigation',
      action: () => this.viewer.fitToView(),
      enabled: true
    });

    this.addShortcut({
      keys: ['z', 'w'],
      description: 'Zoom window',
      category: 'navigation',
      action: () => this.activateZoomWindow(),
      enabled: true
    });

    this.addShortcut({
      keys: ['z', 'p'],
      description: 'Zoom previous',
      category: 'navigation',
      action: () => this.viewer.navigation.setRequestTransition(false, this.viewer.navigation.getPosition(), this.viewer.navigation.getTarget(), this.viewer.navigation.getFovMin()),
      enabled: true
    });

    this.addShortcut({
      keys: ['p', 'a'],
      description: 'Pan',
      category: 'navigation',
      action: () => this.viewer.setActiveNavigationTool('pan'),
      enabled: true
    });

    this.addShortcut({
      keys: ['3', 'd', 'o'],
      description: '3D orbit',
      category: 'navigation',
      action: () => this.viewer.setActiveNavigationTool('orbit'),
      enabled: true
    });

    // View shortcuts
    this.addShortcut({
      keys: ['ctrl', 'shift', 'home'],
      description: 'Home view',
      category: 'view',
      action: () => this.viewer.setViewCube('home'),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', '1'],
      description: 'Front view',
      category: 'view',
      action: () => this.viewer.setViewCube('front'),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', '2'],
      description: 'Back view',
      category: 'view',
      action: () => this.viewer.setViewCube('back'),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', '3'],
      description: 'Right view',
      category: 'view',
      action: () => this.viewer.setViewCube('right'),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', '4'],
      description: 'Left view',
      category: 'view',
      action: () => this.viewer.setViewCube('left'),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', '5'],
      description: 'Top view',
      category: 'view',
      action: () => this.viewer.setViewCube('top'),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', '6'],
      description: 'Bottom view',
      category: 'view',
      action: () => this.viewer.setViewCube('bottom'),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', '7'],
      description: 'Isometric view',
      category: 'view',
      action: () => this.setIsometricView(),
      enabled: true
    });

    // Selection shortcuts
    this.addShortcut({
      keys: ['ctrl', 'a'],
      description: 'Select all',
      category: 'selection',
      action: () => this.selectAll(),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', 'd'],
      description: 'Deselect all',
      category: 'selection',
      action: () => this.viewer.clearSelection(),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', 'i'],
      description: 'Invert selection',
      category: 'selection',
      action: () => this.invertSelection(),
      enabled: true
    });

    this.addShortcut({
      keys: ['s', 's'],
      description: 'Single select',
      category: 'selection',
      action: () => this.viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.LEAF_OBJECT),
      enabled: true
    });

    this.addShortcut({
      keys: ['w', 's'],
      description: 'Window select',
      category: 'selection',
      action: () => this.activateWindowSelect(),
      enabled: true
    });

    // Measurement shortcuts
    this.addShortcut({
      keys: ['d', 'i'],
      description: 'Distance measurement',
      category: 'measure',
      action: () => this.activateMeasureTool('distance'),
      enabled: true
    });

    this.addShortcut({
      keys: ['a', 'r'],
      description: 'Area measurement',
      category: 'measure',
      action: () => this.activateMeasureTool('area'),
      enabled: true
    });

    this.addShortcut({
      keys: ['a', 'n'],
      description: 'Angle measurement',
      category: 'measure',
      action: () => this.activateMeasureTool('angle'),
      enabled: true
    });

    this.addShortcut({
      keys: ['l', 'i'],
      description: 'Linear dimension',
      category: 'measure',
      action: () => this.activateLinearDimension(),
      enabled: true
    });

    // HVAC system shortcuts
    this.addShortcut({
      keys: ['h', 'v'],
      description: 'HVAC System Selector',
      category: 'system',
      action: () => this.toggleHVACSelector(),
      enabled: true
    });

    this.addShortcut({
      keys: ['h', 'd'],
      description: 'HVAC Design Panel',
      category: 'system',
      action: () => this.toggleHVACDesign(),
      enabled: true
    });

    this.addShortcut({
      keys: ['c', 'f'],
      description: 'CFD Analysis',
      category: 'system',
      action: () => this.toggleCFDAnalysis(),
      enabled: true
    });

    this.addShortcut({
      keys: ['r', 'p'],
      description: 'Generate Report',
      category: 'system',
      action: () => this.toggleReports(),
      enabled: true
    });

    // Edit shortcuts
    this.addShortcut({
      keys: ['ctrl', 'z'],
      description: 'Undo',
      category: 'edit',
      action: () => this.undo(),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', 'y'],
      description: 'Redo',
      category: 'edit',
      action: () => this.redo(),
      enabled: true
    });

    this.addShortcut({
      keys: ['delete'],
      description: 'Delete selected',
      category: 'edit',
      action: () => this.deleteSelected(),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', 'c'],
      description: 'Copy',
      category: 'edit',
      action: () => this.copy(),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', 'v'],
      description: 'Paste',
      category: 'edit',
      action: () => this.paste(),
      enabled: true
    });

    this.addShortcut({
      keys: ['escape'],
      description: 'Cancel current command',
      category: 'edit',
      action: () => this.cancelCommand(),
      enabled: true
    });

    // View control shortcuts
    this.addShortcut({
      keys: ['ctrl', 'shift', 'h'],
      description: 'Hide selected',
      category: 'view',
      action: () => this.hideSelected(),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', 'shift', 'u'],
      description: 'Unhide all',
      category: 'view',
      action: () => this.unhideAll(),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', 'shift', 'i'],
      description: 'Isolate selected',
      category: 'view',
      action: () => this.isolateSelected(),
      enabled: true
    });

    // Quick access shortcuts
    this.addShortcut({
      keys: ['f1'],
      description: 'Show shortcuts help',
      category: 'system',
      action: () => this.toggleShortcutsPanel(),
      enabled: true
    });

    this.addShortcut({
      keys: ['ctrl', 'shift', 's'],
      description: 'Screenshot',
      category: 'system',
      action: () => this.takeScreenshot(),
      enabled: true
    });

    // Organize shortcuts by category
    this.organizeShortcutsByCategory();
  }

  private addShortcut(shortcut: ShortcutCommand): void {
    const keyString = shortcut.keys.join('+').toLowerCase();
    this.shortcuts.set(keyString, shortcut);
  }

  private organizeShortcutsByCategory(): void {
    this.categories.forEach(category => {
      category.shortcuts = Array.from(this.shortcuts.values())
        .filter(shortcut => shortcut.category === category.name.toLowerCase().replace(' ', ''));
    });
  }

  private setupEventHandlers(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent default browser shortcuts that conflict
    document.addEventListener('keydown', this.preventDefaultShortcuts.bind(this));
  }

  private removeEventHandlers(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('keydown', this.preventDefaultShortcuts.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;
    
    // Skip if typing in input fields
    if (this.isInputActive()) return;

    const key = this.normalizeKey(event);
    this.activeKeys.add(key);

    // Check for matching shortcuts
    const currentKeyString = Array.from(this.activeKeys).sort().join('+');
    const shortcut = this.shortcuts.get(currentKeyString);

    if (shortcut && shortcut.enabled) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        shortcut.action();
        this.logShortcutUsage(shortcut);
      } catch (error) {
        console.error('Error executing shortcut:', error);
      }
      
      // Clear active keys after successful execution
      this.activeKeys.clear();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = this.normalizeKey(event);
    this.activeKeys.delete(key);
  }

  private normalizeKey(event: KeyboardEvent): string {
    let key = event.key.toLowerCase();
    
    // Normalize modifier keys
    if (event.ctrlKey && key !== 'control') key = 'ctrl+' + key;
    if (event.shiftKey && key !== 'shift') key = 'shift+' + key;
    if (event.altKey && key !== 'alt') key = 'alt+' + key;
    if (event.metaKey && key !== 'meta') key = 'meta+' + key;
    
    // Handle special keys
    switch (event.code) {
      case 'Space': return 'space';
      case 'Enter': return 'enter';
      case 'Escape': return 'escape';
      case 'Delete': return 'delete';
      case 'Backspace': return 'backspace';
      case 'Home': return 'home';
      case 'End': return 'end';
      case 'F1': return 'f1';
      case 'F2': return 'f2';
      case 'F3': return 'f3';
      case 'F4': return 'f4';
      case 'F5': return 'f5';
      case 'F6': return 'f6';
      case 'F7': return 'f7';
      case 'F8': return 'f8';
      case 'F9': return 'f9';
      case 'F10': return 'f10';
      case 'F11': return 'f11';
      case 'F12': return 'f12';
    }
    
    return key;
  }

  private isInputActive(): boolean {
    const activeElement = document.activeElement;
    return activeElement instanceof HTMLInputElement ||
           activeElement instanceof HTMLTextAreaElement ||
           activeElement instanceof HTMLSelectElement ||
           (activeElement && activeElement.getAttribute('contenteditable') === 'true');
  }

  private preventDefaultShortcuts(event: KeyboardEvent): void {
    // Prevent browser shortcuts that conflict with CAD shortcuts
    const conflictingShortcuts = [
      'ctrl+1', 'ctrl+2', 'ctrl+3', 'ctrl+4', 'ctrl+5', 'ctrl+6', 'ctrl+7'
    ];
    
    const currentKey = this.normalizeKey(event);
    if (conflictingShortcuts.includes(currentKey)) {
      event.preventDefault();
    }
  }

  private createShortcutsPanel(): void {
    this.shortcutsPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-shortcuts-panel',
      'Keyboard Shortcuts',
      { dockRight: true, shadow: true }
    );

    const panelContent = `
      <div class="shortcuts-panel">
        <div class="shortcuts-header">
          <h3>⌨️ Keyboard Shortcuts</h3>
          <div class="shortcuts-controls">
            <label class="toggle-label">
              <input type="checkbox" id="shortcuts-enabled" ${this.isEnabled ? 'checked' : ''}>
              <span>Enable shortcuts</span>
            </label>
          </div>
        </div>
        
        <div class="shortcuts-search">
          <input type="text" id="shortcuts-search" placeholder="Search shortcuts..." class="search-input">
        </div>
        
        <div class="shortcuts-categories">
          ${this.categories.map(category => `
            <div class="category-section">
              <div class="category-header">
                <h4>${category.name}</h4>
                <label class="category-toggle">
                  <input type="checkbox" ${category.enabled ? 'checked' : ''} 
                         data-category="${category.name.toLowerCase().replace(' ', '')}">
                  <span>Enabled</span>
                </label>
              </div>
              
              <div class="shortcuts-list">
                ${category.shortcuts.map(shortcut => `
                  <div class="shortcut-item ${shortcut.enabled ? '' : 'disabled'}" 
                       data-shortcut="${shortcut.keys.join('+').toLowerCase()}">
                    <div class="shortcut-keys">
                      ${shortcut.keys.map(key => `<kbd class="key">${key.toUpperCase()}</kbd>`).join(' + ')}
                    </div>
                    <div class="shortcut-description">${shortcut.description}</div>
                    <div class="shortcut-actions">
                      <button class="btn btn-small toggle-shortcut" 
                              data-action="toggle" title="Enable/Disable">
                        ${shortcut.enabled ? '🔓' : '🔒'}
                      </button>
                      <button class="btn btn-small edit-shortcut" 
                              data-action="edit" title="Edit shortcut">
                        ✏️
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="shortcuts-footer">
          <div class="custom-shortcuts">
            <h4>Custom Shortcuts</h4>
            <button id="add-custom-shortcut" class="btn btn-primary">
              ➕ Add Custom Shortcut
            </button>
            <div id="custom-shortcuts-list" class="shortcuts-list">
              <!-- Custom shortcuts will be populated here -->
            </div>
          </div>
          
          <div class="shortcuts-export">
            <button id="export-shortcuts" class="btn btn-secondary">
              📤 Export Settings
            </button>
            <button id="import-shortcuts" class="btn btn-secondary">
              📥 Import Settings
            </button>
            <button id="reset-shortcuts" class="btn btn-outline">
              🔄 Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    `;

    this.shortcutsPanel.container.innerHTML = panelContent;
    this.setupShortcutsInterface();
  }

  private setupShortcutsInterface(): void {
    // Enable/disable shortcuts toggle
    const enabledToggle = this.shortcutsPanel?.container.querySelector('#shortcuts-enabled') as HTMLInputElement;
    enabledToggle?.addEventListener('change', (e) => {
      this.isEnabled = (e.target as HTMLInputElement).checked;
    });

    // Search functionality
    const searchInput = this.shortcutsPanel?.container.querySelector('#shortcuts-search') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      this.filterShortcuts((e.target as HTMLInputElement).value);
    });

    // Category toggles
    const categoryToggles = this.shortcutsPanel?.container.querySelectorAll('.category-toggle input');
    categoryToggles?.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const category = (e.target as HTMLInputElement).dataset.category;
        const enabled = (e.target as HTMLInputElement).checked;
        this.toggleCategory(category!, enabled);
      });
    });

    // Individual shortcut toggles
    const shortcutToggles = this.shortcutsPanel?.container.querySelectorAll('.toggle-shortcut');
    shortcutToggles?.forEach(button => {
      button.addEventListener('click', (e) => {
        const shortcutKey = (e.target as HTMLElement).closest('.shortcut-item')?.getAttribute('data-shortcut');
        if (shortcutKey) {
          this.toggleShortcut(shortcutKey);
        }
      });
    });

    // Edit shortcut buttons
    const editButtons = this.shortcutsPanel?.container.querySelectorAll('.edit-shortcut');
    editButtons?.forEach(button => {
      button.addEventListener('click', (e) => {
        const shortcutKey = (e.target as HTMLElement).closest('.shortcut-item')?.getAttribute('data-shortcut');
        if (shortcutKey) {
          this.editShortcut(shortcutKey);
        }
      });
    });

    // Custom shortcuts
    const addCustomBtn = this.shortcutsPanel?.container.querySelector('#add-custom-shortcut');
    addCustomBtn?.addEventListener('click', () => this.showAddCustomShortcutDialog());

    // Export/Import/Reset
    const exportBtn = this.shortcutsPanel?.container.querySelector('#export-shortcuts');
    const importBtn = this.shortcutsPanel?.container.querySelector('#import-shortcuts');
    const resetBtn = this.shortcutsPanel?.container.querySelector('#reset-shortcuts');

    exportBtn?.addEventListener('click', () => this.exportShortcutSettings());
    importBtn?.addEventListener('click', () => this.importShortcutSettings());
    resetBtn?.addEventListener('click', () => this.resetToDefaults());
  }

  private setupToolbar(): void {
    const toolbar = this.viewer.getToolbar(true);
    const shortcutsGroup = toolbar.getControl('shortcuts-controls') || 
      toolbar.addControl('shortcuts-controls', { collapsible: true, index: 5 });

    // Shortcuts panel toggle
    const shortcutsToggle = new Autodesk.Viewing.UI.Button('shortcuts-toggle');
    shortcutsToggle.setToolTip('Keyboard Shortcuts (F1)');
    shortcutsToggle.setIcon('adsk-icon-help');
    shortcutsToggle.onClick = () => this.toggleShortcutsPanel();
    shortcutsGroup.addControl(shortcutsToggle);
  }

  // Shortcut action implementations
  private activateZoomWindow(): void {
    // Implement zoom window functionality
    this.viewer.setActiveNavigationTool('zoom');
    console.log('Zoom window activated');
  }

  private setIsometricView(): void {
    this.viewer.setViewCube('front-top-right');
  }

  private selectAll(): void {
    const model = this.viewer.model;
    if (model) {
      const instanceTree = model.getInstanceTree();
      if (instanceTree) {
        const allDbIds: number[] = [];
        instanceTree.enumNodeChildren(instanceTree.getRootId(), (dbId) => {
          allDbIds.push(dbId);
        }, true);
        this.viewer.select(allDbIds);
      }
    }
  }

  private invertSelection(): void {
    const currentSelection = this.viewer.getSelection();
    const model = this.viewer.model;
    
    if (model) {
      const instanceTree = model.getInstanceTree();
      if (instanceTree) {
        const allDbIds: number[] = [];
        instanceTree.enumNodeChildren(instanceTree.getRootId(), (dbId) => {
          if (!currentSelection.includes(dbId)) {
            allDbIds.push(dbId);
          }
        }, true);
        this.viewer.select(allDbIds);
      }
    }
  }

  private activateWindowSelect(): void {
    // Implement window selection
    console.log('Window select activated');
  }

  private activateMeasureTool(type: 'distance' | 'area' | 'angle'): void {
    const measureExtension = this.viewer.getExtension('Autodesk.Measure');
    if (measureExtension) {
      measureExtension.activate(type);
    }
  }

  private activateLinearDimension(): void {
    // Activate dimension tool if available
    const dimensionExtension = this.viewer.getExtension('VibeLux.Dimensions');
    if (dimensionExtension) {
      dimensionExtension.activateLinearDimension();
    }
  }

  private toggleHVACSelector(): void {
    const hvacExtension = this.viewer.getExtension('VibeLux.HVACSystemSelector');
    if (hvacExtension) {
      hvacExtension.toggleSelectorPanel();
    }
  }

  private toggleHVACDesign(): void {
    const hvacExtension = this.viewer.getExtension('VibeLux.HVACDesign');
    if (hvacExtension) {
      hvacExtension.hvacPanel?.setVisible(!hvacExtension.hvacPanel.isVisible());
    }
  }

  private toggleCFDAnalysis(): void {
    const cfdExtension = this.viewer.getExtension('VibeLux.CFDVisualization');
    if (cfdExtension) {
      cfdExtension.toggleVisualization();
    }
  }

  private toggleReports(): void {
    const reportsExtension = this.viewer.getExtension('VibeLux.ProfessionalReports');
    if (reportsExtension) {
      reportsExtension.toggleReportPanel();
    }
  }

  private undo(): void {
    // Implement undo functionality
    console.log('Undo action');
  }

  private redo(): void {
    // Implement redo functionality
    console.log('Redo action');
  }

  private deleteSelected(): void {
    const selection = this.viewer.getSelection();
    if (selection.length > 0) {
      // Hide selected objects (since we can't actually delete from model)
      this.viewer.hide(selection);
    }
  }

  private copy(): void {
    // Implement copy functionality
    const selection = this.viewer.getSelection();
    if (selection.length > 0) {
      localStorage.setItem('vibelux-copied-selection', JSON.stringify(selection));
      console.log('Copied selection:', selection);
    }
  }

  private paste(): void {
    // Implement paste functionality
    const copiedSelection = localStorage.getItem('vibelux-copied-selection');
    if (copiedSelection) {
      const selection = JSON.parse(copiedSelection);
      console.log('Pasting selection:', selection);
    }
  }

  private cancelCommand(): void {
    // Cancel current tool or command
    this.viewer.setActiveNavigationTool('');
    this.viewer.clearSelection();
    console.log('Command cancelled');
  }

  private hideSelected(): void {
    const selection = this.viewer.getSelection();
    if (selection.length > 0) {
      this.viewer.hide(selection);
    }
  }

  private unhideAll(): void {
    this.viewer.showAll();
  }

  private isolateSelected(): void {
    const selection = this.viewer.getSelection();
    if (selection.length > 0) {
      this.viewer.isolate(selection);
    }
  }

  private takeScreenshot(): void {
    this.viewer.getScreenShot(1920, 1080, (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibelux-screenshot-${new Date().getTime()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Panel management methods
  private toggleShortcutsPanel(): void {
    if (this.shortcutsPanel) {
      this.shortcutsPanel.setVisible(!this.shortcutsPanel.isVisible());
    }
  }

  private filterShortcuts(searchTerm: string): void {
    const shortcutItems = this.shortcutsPanel?.container.querySelectorAll('.shortcut-item');
    const lowerSearchTerm = searchTerm.toLowerCase();

    shortcutItems?.forEach(item => {
      const description = item.querySelector('.shortcut-description')?.textContent?.toLowerCase() || '';
      const keys = item.querySelector('.shortcut-keys')?.textContent?.toLowerCase() || '';
      
      if (description.includes(lowerSearchTerm) || keys.includes(lowerSearchTerm)) {
        (item as HTMLElement).style.display = 'flex';
      } else {
        (item as HTMLElement).style.display = 'none';
      }
    });
  }

  private toggleCategory(categoryName: string, enabled: boolean): void {
    const category = this.categories.find(cat => cat.name.toLowerCase().replace(' ', '') === categoryName);
    if (category) {
      category.enabled = enabled;
      category.shortcuts.forEach(shortcut => {
        shortcut.enabled = enabled;
      });
      this.updateShortcutsDisplay();
    }
  }

  private toggleShortcut(shortcutKey: string): void {
    const shortcut = this.shortcuts.get(shortcutKey);
    if (shortcut) {
      shortcut.enabled = !shortcut.enabled;
      this.updateShortcutsDisplay();
    }
  }

  private editShortcut(shortcutKey: string): void {
    const shortcut = this.shortcuts.get(shortcutKey);
    if (shortcut) {
      this.showEditShortcutDialog(shortcut);
    }
  }

  private showAddCustomShortcutDialog(): void {
    // Implement custom shortcut dialog
    console.log('Show add custom shortcut dialog');
  }

  private showEditShortcutDialog(shortcut: ShortcutCommand): void {
    // Implement edit shortcut dialog
    console.log('Show edit shortcut dialog for:', shortcut);
  }

  private updateShortcutsDisplay(): void {
    // Update the visual display of shortcuts
    const shortcutItems = this.shortcutsPanel?.container.querySelectorAll('.shortcut-item');
    
    shortcutItems?.forEach(item => {
      const shortcutKey = item.getAttribute('data-shortcut');
      const shortcut = this.shortcuts.get(shortcutKey || '');
      
      if (shortcut) {
        const toggleBtn = item.querySelector('.toggle-shortcut');
        if (toggleBtn) {
          toggleBtn.textContent = shortcut.enabled ? '🔓' : '🔒';
        }
        
        if (shortcut.enabled) {
          item.classList.remove('disabled');
        } else {
          item.classList.add('disabled');
        }
      }
    });
  }

  private exportShortcutSettings(): void {
    const settings = {
      shortcuts: Object.fromEntries(this.shortcuts),
      customShortcuts: Object.fromEntries(this.customShortcuts),
      categories: this.categories,
      isEnabled: this.isEnabled
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibelux-shortcuts-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private importShortcutSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            this.applyImportedSettings(settings);
          } catch (error) {
            console.error('Error importing shortcuts:', error);
            alert('Error importing shortcuts file');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }

  private applyImportedSettings(settings: any): void {
    if (settings.shortcuts) {
      this.shortcuts = new Map(Object.entries(settings.shortcuts));
    }
    if (settings.customShortcuts) {
      this.customShortcuts = new Map(Object.entries(settings.customShortcuts));
    }
    if (settings.categories) {
      this.categories = settings.categories;
    }
    if (typeof settings.isEnabled === 'boolean') {
      this.isEnabled = settings.isEnabled;
    }
    
    this.updateShortcutsDisplay();
  }

  private resetToDefaults(): void {
    if (confirm('Reset all shortcuts to default settings? This cannot be undone.')) {
      this.shortcuts.clear();
      this.customShortcuts.clear();
      this.initializeShortcuts();
      this.updateShortcutsDisplay();
    }
  }

  private logShortcutUsage(shortcut: ShortcutCommand): void {
    console.log(`Shortcut used: ${shortcut.keys.join('+')} - ${shortcut.description}`);
  }

  // Public API methods
  public isShortcutsEnabled(): boolean {
    return this.isEnabled;
  }

  public setShortcutsEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const toggle = this.shortcutsPanel?.container.querySelector('#shortcuts-enabled') as HTMLInputElement;
    if (toggle) {
      toggle.checked = enabled;
    }
  }

  public addCustomShortcut(shortcut: ShortcutCommand): void {
    const keyString = shortcut.keys.join('+').toLowerCase();
    this.customShortcuts.set(keyString, shortcut);
    this.shortcuts.set(keyString, shortcut);
  }

  public removeCustomShortcut(keys: string[]): void {
    const keyString = keys.join('+').toLowerCase();
    this.customShortcuts.delete(keyString);
    this.shortcuts.delete(keyString);
  }

  public getActiveShortcuts(): ShortcutCommand[] {
    return Array.from(this.shortcuts.values()).filter(s => s.enabled);
  }
}

export default KeyboardShortcutsExtension;
/**
 * Professional CAD Keyboard Shortcuts
 * Implements industry-standard AutoCAD-style shortcuts
 */

export interface KeyboardShortcut {
  key: string;
  command: string;
  description: string;
  category: 'drawing' | 'modify' | 'view' | 'annotation' | 'tools' | 'selection';
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback?: () => void;
}

export interface CommandAlias {
  alias: string;
  command: string;
  description: string;
}

export class CADKeyboardShortcuts {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private aliases: Map<string, CommandAlias> = new Map();
  private listeners: Map<string, Set<() => void>> = new Map();

  // Standard CAD shortcuts
  static readonly STANDARD_SHORTCUTS: KeyboardShortcut[] = [
    // Drawing commands
    { key: 'L', command: 'LINE', description: 'Draw Line', category: 'drawing' },
    { key: 'C', command: 'CIRCLE', description: 'Draw Circle', category: 'drawing' },
    { key: 'A', command: 'ARC', description: 'Draw Arc', category: 'drawing' },
    { key: 'REC', command: 'RECTANGLE', description: 'Draw Rectangle', category: 'drawing' },
    { key: 'PL', command: 'POLYLINE', description: 'Draw Polyline', category: 'drawing' },
    { key: 'SPL', command: 'SPLINE', description: 'Draw Spline', category: 'drawing' },
    { key: 'EL', command: 'ELLIPSE', description: 'Draw Ellipse', category: 'drawing' },
    { key: 'PO', command: 'POINT', description: 'Draw Point', category: 'drawing' },
    
    // Modify commands
    { key: 'M', command: 'MOVE', description: 'Move Objects', category: 'modify' },
    { key: 'CO', command: 'COPY', description: 'Copy Objects', category: 'modify' },
    { key: 'RO', command: 'ROTATE', description: 'Rotate Objects', category: 'modify' },
    { key: 'SC', command: 'SCALE', description: 'Scale Objects', category: 'modify' },
    { key: 'MI', command: 'MIRROR', description: 'Mirror Objects', category: 'modify' },
    { key: 'O', command: 'OFFSET', description: 'Offset Objects', category: 'modify' },
    { key: 'TR', command: 'TRIM', description: 'Trim Objects', category: 'modify' },
    { key: 'EX', command: 'EXTEND', description: 'Extend Objects', category: 'modify' },
    { key: 'F', command: 'FILLET', description: 'Fillet Corners', category: 'modify' },
    { key: 'CHA', command: 'CHAMFER', description: 'Chamfer Corners', category: 'modify' },
    { key: 'BR', command: 'BREAK', description: 'Break Objects', category: 'modify' },
    { key: 'J', command: 'JOIN', description: 'Join Objects', category: 'modify' },
    { key: 'S', command: 'STRETCH', description: 'Stretch Objects', category: 'modify' },
    { key: 'AR', command: 'ARRAY', description: 'Array Objects', category: 'modify' },
    
    // Annotation commands
    { key: 'D', command: 'DIMENSION', description: 'Quick Dimension', category: 'annotation' },
    { key: 'DLI', command: 'DIMLINEAR', description: 'Linear Dimension', category: 'annotation' },
    { key: 'DAL', command: 'DIMALIGNED', description: 'Aligned Dimension', category: 'annotation' },
    { key: 'DAN', command: 'DIMANGULAR', description: 'Angular Dimension', category: 'annotation' },
    { key: 'DRA', command: 'DIMRADIUS', description: 'Radius Dimension', category: 'annotation' },
    { key: 'DDI', command: 'DIMDIAMETER', description: 'Diameter Dimension', category: 'annotation' },
    { key: 'T', command: 'TEXT', description: 'Single Line Text', category: 'annotation' },
    { key: 'MT', command: 'MTEXT', description: 'Multiline Text', category: 'annotation' },
    { key: 'LE', command: 'LEADER', description: 'Leader Line', category: 'annotation' },
    
    // View commands
    { key: 'Z', command: 'ZOOM', description: 'Zoom', category: 'view' },
    { key: 'P', command: 'PAN', description: 'Pan View', category: 'view' },
    { key: 'RE', command: 'REGEN', description: 'Regenerate Display', category: 'view' },
    { key: 'REA', command: 'REGENALL', description: 'Regenerate All', category: 'view' },
    
    // Selection commands
    { key: 'CTRL+A', command: 'SELECTALL', description: 'Select All', category: 'selection', ctrl: true },
    { key: 'ESC', command: 'CANCEL', description: 'Cancel Command', category: 'selection' },
    { key: 'DELETE', command: 'ERASE', description: 'Delete Selected', category: 'selection' },
    
    // Tools
    { key: 'DI', command: 'DISTANCE', description: 'Measure Distance', category: 'tools' },
    { key: 'AA', command: 'AREA', description: 'Measure Area', category: 'tools' },
    { key: 'ID', command: 'IDENTIFY', description: 'Identify Point', category: 'tools' },
    { key: 'LI', command: 'LIST', description: 'List Properties', category: 'tools' },
    
    // Function keys
    { key: 'F1', command: 'HELP', description: 'Help', category: 'tools' },
    { key: 'F2', command: 'TEXTSCREEN', description: 'Text Window', category: 'tools' },
    { key: 'F3', command: 'OSNAP', description: 'Toggle Object Snap', category: 'tools' },
    { key: 'F7', command: 'GRID', description: 'Toggle Grid', category: 'tools' },
    { key: 'F8', command: 'ORTHO', description: 'Toggle Ortho Mode', category: 'tools' },
    { key: 'F9', command: 'SNAP', description: 'Toggle Snap', category: 'tools' },
    { key: 'F10', command: 'POLAR', description: 'Toggle Polar Tracking', category: 'tools' },
    { key: 'F11', command: 'OTRACK', description: 'Toggle Object Tracking', category: 'tools' },
    
    // Quick access
    { key: 'CTRL+S', command: 'SAVE', description: 'Save', category: 'tools', ctrl: true },
    { key: 'CTRL+O', command: 'OPEN', description: 'Open', category: 'tools', ctrl: true },
    { key: 'CTRL+N', command: 'NEW', description: 'New', category: 'tools', ctrl: true },
    { key: 'CTRL+P', command: 'PLOT', description: 'Print/Plot', category: 'tools', ctrl: true },
    { key: 'CTRL+Z', command: 'UNDO', description: 'Undo', category: 'tools', ctrl: true },
    { key: 'CTRL+Y', command: 'REDO', description: 'Redo', category: 'tools', ctrl: true },
    { key: 'CTRL+C', command: 'COPYCLIP', description: 'Copy to Clipboard', category: 'tools', ctrl: true },
    { key: 'CTRL+V', command: 'PASTECLIP', description: 'Paste from Clipboard', category: 'tools', ctrl: true },
    { key: 'CTRL+X', command: 'CUTCLIP', description: 'Cut to Clipboard', category: 'tools', ctrl: true },
  ];

  // Command aliases for command line
  static readonly COMMAND_ALIASES: CommandAlias[] = [
    // Common aliases
    { alias: 'E', command: 'ERASE', description: 'Delete objects' },
    { alias: 'CP', command: 'COPY', description: 'Copy objects' },
    { alias: 'MO', command: 'PROPERTIES', description: 'Modify properties' },
    { alias: 'CH', command: 'PROPERTIES', description: 'Change properties' },
    { alias: 'LA', command: 'LAYER', description: 'Layer properties' },
    { alias: 'LT', command: 'LINETYPE', description: 'Linetype manager' },
    { alias: 'COL', command: 'COLOR', description: 'Color settings' },
    { alias: 'UN', command: 'UNITS', description: 'Drawing units' },
    { alias: 'LIM', command: 'LIMITS', description: 'Drawing limits' },
    { alias: 'ST', command: 'STYLE', description: 'Text style' },
    { alias: 'DD', command: 'DIMSTYLE', description: 'Dimension style' },
    { alias: 'B', command: 'BLOCK', description: 'Create block' },
    { alias: 'I', command: 'INSERT', description: 'Insert block' },
    { alias: 'W', command: 'WBLOCK', description: 'Write block' },
    { alias: 'X', command: 'EXPLODE', description: 'Explode objects' },
    { alias: 'H', command: 'HATCH', description: 'Hatch pattern' },
    { alias: 'PU', command: 'PURGE', description: 'Purge unused' },
    { alias: 'MA', command: 'MATCHPROP', description: 'Match properties' },
    { alias: 'LEN', command: 'LENGTHEN', description: 'Lengthen objects' },
  ];

  constructor() {
    this.initializeShortcuts();
    this.initializeAliases();
  }

  private initializeShortcuts(): void {
    CADKeyboardShortcuts.STANDARD_SHORTCUTS.forEach(shortcut => {
      const key = this.generateKey(shortcut);
      this.shortcuts.set(key, shortcut);
    });
  }

  private initializeAliases(): void {
    CADKeyboardShortcuts.COMMAND_ALIASES.forEach(alias => {
      this.aliases.set(alias.alias.toUpperCase(), alias);
    });
  }

  /**
   * Generate unique key for shortcut
   */
  private generateKey(shortcut: KeyboardShortcut): string {
    let key = '';
    if (shortcut.ctrl) key += 'CTRL+';
    if (shortcut.shift) key += 'SHIFT+';
    if (shortcut.alt) key += 'ALT+';
    key += shortcut.key.toUpperCase();
    return key;
  }

  /**
   * Register keyboard event handler
   */
  registerHandler(element: HTMLElement): void {
    element.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Handle keyboard event
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Build key string
    let key = '';
    if (e.ctrlKey || e.metaKey) key += 'CTRL+';
    if (e.shiftKey) key += 'SHIFT+';
    if (e.altKey) key += 'ALT+';
    
    // Special key handling
    const specialKeys: { [key: string]: string } = {
      'Escape': 'ESC',
      'Delete': 'DELETE',
      ' ': 'SPACE',
      'Enter': 'ENTER',
      'ArrowUp': 'UP',
      'ArrowDown': 'DOWN',
      'ArrowLeft': 'LEFT',
      'ArrowRight': 'RIGHT',
    };
    
    const keyName = specialKeys[e.key] || e.key.toUpperCase();
    key += keyName;

    // Check for shortcut
    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      e.preventDefault();
      this.executeCommand(shortcut.command);
      
      // Call custom callback if provided
      if (shortcut.callback) {
        shortcut.callback();
      }
    }
  }

  /**
   * Execute command
   */
  executeCommand(command: string): void {
    const listeners = this.listeners.get(command);
    if (listeners) {
      listeners.forEach(callback => callback());
    }
  }

  /**
   * Register command listener
   */
  onCommand(command: string, callback: () => void): () => void {
    if (!this.listeners.has(command)) {
      this.listeners.set(command, new Set());
    }
    
    this.listeners.get(command)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(command)?.delete(callback);
    };
  }

  /**
   * Get shortcut for command
   */
  getShortcutForCommand(command: string): KeyboardShortcut | undefined {
    for (const [key, shortcut] of this.shortcuts) {
      if (shortcut.command === command) {
        return shortcut;
      }
    }
    return undefined;
  }

  /**
   * Get all shortcuts by category
   */
  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }

  /**
   * Add custom shortcut
   */
  addShortcut(shortcut: KeyboardShortcut): void {
    const key = this.generateKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Remove shortcut
   */
  removeShortcut(key: string): void {
    this.shortcuts.delete(key.toUpperCase());
  }

  /**
   * Parse command from text (for command line)
   */
  parseCommand(text: string): { command: string; args: string[] } | null {
    const parts = text.trim().toUpperCase().split(/\s+/);
    if (parts.length === 0) return null;
    
    const [cmd, ...args] = parts;
    
    // Check if it's an alias
    const alias = this.aliases.get(cmd);
    const command = alias ? alias.command : cmd;
    
    return { command, args };
  }

  /**
   * Get command suggestions for autocomplete
   */
  getCommandSuggestions(partial: string): string[] {
    const upperPartial = partial.toUpperCase();
    const suggestions: string[] = [];
    
    // Add matching commands
    this.shortcuts.forEach(shortcut => {
      if (shortcut.command.startsWith(upperPartial)) {
        suggestions.push(shortcut.command);
      }
    });
    
    // Add matching aliases
    this.aliases.forEach((alias, key) => {
      if (key.startsWith(upperPartial)) {
        suggestions.push(key);
      }
    });
    
    return [...new Set(suggestions)].sort();
  }
}

export default CADKeyboardShortcuts;
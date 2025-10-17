import React from 'react';
import { Command } from 'lucide-react';

const shortcuts = [
  { keys: ['Ctrl', 'Z'], mac: ['⌘', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], mac: ['⌘', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Ctrl', 'S'], mac: ['⌘', 'S'], action: 'Save project' },
  { keys: ['Ctrl', 'O'], mac: ['⌘', 'O'], action: 'Open project' },
  { keys: ['Delete'], mac: ['Delete'], action: 'Delete selected fixture' },
  { keys: ['Ctrl', 'D'], mac: ['⌘', 'D'], action: 'Duplicate fixture' },
  { keys: ['Ctrl', 'A'], mac: ['⌘', 'A'], action: 'Select all fixtures' },
  { keys: ['G'], mac: ['G'], action: 'Toggle grid' },
  { keys: ['M'], mac: ['M'], action: 'Toggle metrics' },
  { keys: ['?'], mac: ['?'], action: 'Show shortcuts' },
  { keys: ['Escape'], mac: ['Escape'], action: 'Deselect / Close modal' },
  { keys: ['Arrow Keys'], mac: ['Arrow Keys'], action: 'Move selected fixture' },
  { keys: ['Shift', 'Arrow Keys'], mac: ['Shift', 'Arrow Keys'], action: 'Move fixture faster' },
];

export default function KeyboardShortcuts() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Use these keyboard shortcuts to work faster in the designer.
      </p>
      
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-sm">{shortcut.action}</span>
            <div className="flex items-center gap-1">
              {(isMac ? shortcut.mac : shortcut.keys).map((key, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-gray-500">+</span>}
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">
                    {key}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4">
        <p className="text-sm">
          <strong>Tip:</strong> Hold Shift while dragging to constrain movement to straight lines.
        </p>
      </div>
    </div>
  );
}
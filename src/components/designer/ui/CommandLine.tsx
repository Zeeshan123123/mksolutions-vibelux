'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, ChevronUp, ChevronDown } from 'lucide-react';
import { CADKeyboardShortcuts } from '@/lib/cad/keyboard-shortcuts';
import { cn } from '@/lib/utils';

interface CommandLineProps {
  onCommand: (command: string, args: string[]) => void;
  shortcuts: CADKeyboardShortcuts;
  position?: 'top' | 'bottom';
  className?: string;
}

interface CommandHistory {
  command: string;
  timestamp: Date;
  success: boolean;
}

export function CommandLine({ 
  onCommand, 
  shortcuts,
  position = 'bottom',
  className 
}: CommandLineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [output, setOutput] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update suggestions as user types
  useEffect(() => {
    if (input.trim()) {
      const newSuggestions = shortcuts.getCommandSuggestions(input);
      setSuggestions(newSuggestions.slice(0, 5)); // Limit to 5 suggestions
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
    }
  }, [input, shortcuts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = shortcuts.parseCommand(input);
    if (parsed) {
      // Add to history
      const historyEntry: CommandHistory = {
        command: input,
        timestamp: new Date(),
        success: true
      };
      setHistory([...history, historyEntry]);
      
      // Execute command
      onCommand(parsed.command, parsed.args);
      
      // Add to output
      setOutput([...output, `Command: ${parsed.command} ${parsed.args.join(' ')}`]);
      
      // Clear input
      setInput('');
      setHistoryIndex(-1);
    } else {
      setOutput([...output, `Unknown command: ${input}`]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion(Math.max(0, selectedSuggestion - 1));
        } else if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setInput(history[history.length - 1 - newIndex].command);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion(Math.min(suggestions.length - 1, selectedSuggestion + 1));
        } else if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(history[history.length - 1 - newIndex].command);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInput('');
        }
        break;
        
      case 'Tab':
        e.preventDefault();
        if (suggestions.length > 0) {
          setInput(suggestions[selectedSuggestion]);
          setSuggestions([]);
        }
        break;
        
      case 'Escape':
        if (suggestions.length > 0) {
          setSuggestions([]);
        } else {
          setIsOpen(false);
        }
        break;
        
      case 'Enter':
        if (suggestions.length > 0 && e.shiftKey) {
          e.preventDefault();
          setInput(suggestions[selectedSuggestion]);
          setSuggestions([]);
        }
        break;
    }
  };

  const positionClasses = {
    top: 'top-0',
    bottom: 'bottom-0'
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors",
          position === 'bottom' ? 'bottom-4 right-4' : 'top-20 right-4'
        )}
        title="Toggle Command Line"
      >
        <Terminal className="w-5 h-5 text-gray-300" />
      </button>

      {/* Command Line Interface */}
      {isOpen && (
        <div className={cn(
          "fixed left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 shadow-2xl",
          positionClasses[position],
          className
        )}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Terminal className="w-4 h-4" />
                Command Line
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Output Area */}
            {output.length > 0 && (
              <div className="px-4 py-2 max-h-32 overflow-y-auto text-xs font-mono text-gray-400 bg-gray-950">
                {output.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="relative">
              <form onSubmit={handleSubmit} className="flex items-center">
                <span className="px-4 text-gray-500 font-mono">Command:</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-2 py-3 bg-transparent text-white font-mono focus:outline-none"
                  placeholder="Type command or press Tab for suggestions..."
                  autoComplete="off"
                  spellCheck={false}
                />
              </form>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-t-lg shadow-lg">
                  {suggestions.map((suggestion, i) => (
                    <div
                      key={suggestion}
                      className={cn(
                        "px-4 py-2 text-sm font-mono cursor-pointer transition-colors",
                        i === selectedSuggestion 
                          ? "bg-purple-600 text-white" 
                          : "text-gray-300 hover:bg-gray-700"
                      )}
                      onClick={() => {
                        setInput(suggestion);
                        setSuggestions([]);
                        inputRef.current?.focus();
                      }}
                    >
                      {suggestion}
                      {/* Show shortcut if available */}
                      {(() => {
                        const shortcut = shortcuts.getShortcutForCommand(suggestion);
                        return shortcut ? (
                          <span className="ml-2 text-xs opacity-60">
                            ({shortcut.key})
                          </span>
                        ) : null;
                      })()}
                    </div>
                  ))}
                  <div className="px-4 py-1 text-xs text-gray-500 border-t border-gray-700">
                    Press Tab to autocomplete, Shift+Enter to select
                  </div>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="px-4 py-1 text-xs text-gray-500 border-t border-gray-700 flex items-center justify-between">
              <div>
                Press ESC to close • ↑/↓ for history • Tab for autocomplete
              </div>
              <div className="flex items-center gap-4">
                <span>Common: L (Line), C (Circle), M (Move), D (Dimension)</span>
                <button
                  onClick={() => {
                    setOutput([
                      ...output,
                      "Available commands:",
                      ...Array.from(new Set(
                        CADKeyboardShortcuts.STANDARD_SHORTCUTS.map(s => s.command)
                      )).sort().join(', ')
                    ]);
                  }}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Show all commands
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
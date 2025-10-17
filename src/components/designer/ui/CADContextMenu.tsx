'use client';

import React, { useEffect, useState } from 'react';
import { useCADStore } from '@/stores/cad-store';
import { CADEntity } from '@/types/cad';
import { KeyboardShortcuts } from '@/lib/cad/keyboard-shortcuts';
import { AIA_LAYER_GROUPS } from '@/lib/cad/aia-layer-standards';

interface ContextMenuProps {
  x: number;
  y: number;
  entity?: CADEntity | null;
  onClose: () => void;
}

export function CADContextMenu({ x, y, entity, onClose }: ContextMenuProps) {
  const [subMenu, setSubMenu] = useState<string | null>(null);
  const cadStore = useCADStore();
  const [layerGroups] = useState(AIA_LAYER_GROUPS);

  useEffect(() => {
    const handleClick = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCommand = (command: string, params?: any) => {
    KeyboardShortcuts.executeCommand(command, params);
    onClose();
  };

  const menuItems = [
    {
      label: 'Repeat Last Command',
      shortcut: 'Enter',
      action: () => handleCommand('REPEAT')
    },
    { divider: true },
    {
      label: 'Cut',
      shortcut: 'Ctrl+X',
      action: () => handleCommand('CUT'),
      disabled: !entity
    },
    {
      label: 'Copy',
      shortcut: 'Ctrl+C',
      action: () => handleCommand('COPY'),
      disabled: !entity
    },
    {
      label: 'Copy with Base Point',
      shortcut: 'Ctrl+Shift+C',
      action: () => handleCommand('COPYBASE'),
      disabled: !entity
    },
    {
      label: 'Paste',
      shortcut: 'Ctrl+V',
      action: () => handleCommand('PASTE')
    },
    {
      label: 'Paste to Original Coordinates',
      action: () => handleCommand('PASTEORIG')
    },
    { divider: true },
    {
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      action: () => handleCommand('UNDO')
    },
    {
      label: 'Redo',
      shortcut: 'Ctrl+Y',
      action: () => handleCommand('REDO')
    },
    { divider: true },
    {
      label: 'Object Snap Overrides',
      hasSubmenu: true,
      submenu: 'osnap'
    },
    {
      label: 'Quick Properties',
      shortcut: 'Ctrl+Shift+P',
      action: () => handleCommand('PROPERTIES'),
      disabled: !entity
    },
    { divider: true }
  ];

  if (entity) {
    menuItems.push(
      {
        label: 'Modify',
        hasSubmenu: true,
        submenu: 'modify'
      },
      {
        label: 'Change Layer',
        hasSubmenu: true,
        submenu: 'layer'
      },
      {
        label: 'Entity Data',
        hasSubmenu: true,
        submenu: 'data'
      },
      { divider: true },
      {
        label: 'Delete',
        shortcut: 'Del',
        action: () => handleCommand('DELETE'),
        className: 'text-red-600 hover:bg-red-50'
      }
    );
  }

  const osnapSubmenu = [
    { label: 'Endpoint', shortcut: 'END', action: () => handleCommand('OSNAP', 'endpoint') },
    { label: 'Midpoint', shortcut: 'MID', action: () => handleCommand('OSNAP', 'midpoint') },
    { label: 'Center', shortcut: 'CEN', action: () => handleCommand('OSNAP', 'center') },
    { label: 'Node', shortcut: 'NOD', action: () => handleCommand('OSNAP', 'node') },
    { label: 'Quadrant', shortcut: 'QUA', action: () => handleCommand('OSNAP', 'quadrant') },
    { label: 'Intersection', shortcut: 'INT', action: () => handleCommand('OSNAP', 'intersection') },
    { label: 'Extension', shortcut: 'EXT', action: () => handleCommand('OSNAP', 'extension') },
    { label: 'Perpendicular', shortcut: 'PER', action: () => handleCommand('OSNAP', 'perpendicular') },
    { label: 'Tangent', shortcut: 'TAN', action: () => handleCommand('OSNAP', 'tangent') },
    { label: 'Nearest', shortcut: 'NEA', action: () => handleCommand('OSNAP', 'nearest') },
    { label: 'Apparent Intersection', shortcut: 'APP', action: () => handleCommand('OSNAP', 'apparent') },
    { label: 'Parallel', shortcut: 'PAR', action: () => handleCommand('OSNAP', 'parallel') },
    { divider: true },
    { label: 'None', action: () => handleCommand('OSNAP', 'none') },
    { label: 'Settings...', action: () => handleCommand('OSNAP', 'settings') }
  ];

  const modifySubmenu = entity ? [
    { label: 'Move', shortcut: 'M', action: () => handleCommand('MOVE') },
    { label: 'Copy', shortcut: 'CO', action: () => handleCommand('COPY') },
    { label: 'Rotate', shortcut: 'RO', action: () => handleCommand('ROTATE') },
    { label: 'Scale', shortcut: 'SC', action: () => handleCommand('SCALE') },
    { label: 'Mirror', shortcut: 'MI', action: () => handleCommand('MIRROR') },
    { label: 'Array', shortcut: 'AR', action: () => handleCommand('ARRAY') },
    { label: 'Stretch', shortcut: 'S', action: () => handleCommand('STRETCH') },
    { label: 'Trim', shortcut: 'TR', action: () => handleCommand('TRIM') },
    { label: 'Extend', shortcut: 'EX', action: () => handleCommand('EXTEND') },
    { label: 'Offset', shortcut: 'O', action: () => handleCommand('OFFSET') },
    { label: 'Fillet', shortcut: 'F', action: () => handleCommand('FILLET') },
    { label: 'Chamfer', shortcut: 'CHA', action: () => handleCommand('CHAMFER') },
    { divider: true },
    { label: 'Explode', shortcut: 'X', action: () => handleCommand('EXPLODE') },
    { label: 'Join', shortcut: 'J', action: () => handleCommand('JOIN') },
    { label: 'Break', shortcut: 'BR', action: () => handleCommand('BREAK') }
  ] : [];

  const layerSubmenu = entity ? layerGroups.flatMap(group => [
    { label: group.name, header: true },
    ...group.layers.map(layer => ({
      label: layer.name,
      action: () => handleCommand('LAYER', { entity, layer: layer.name }),
      className: 'pl-6',
      style: { borderLeft: `3px solid ${layer.color}` }
    })),
    { divider: true }
  ]).slice(0, -1) : [];

  const dataSubmenu = entity ? [
    { label: `Type: ${entity.type}`, disabled: true },
    { label: `Layer: ${entity.layer || 'Default'}`, disabled: true },
    { divider: true },
    { label: 'Properties...', action: () => handleCommand('PROPERTIES') },
    { label: 'Match Properties', action: () => handleCommand('MATCHPROP') },
    { label: 'Add to Block', action: () => handleCommand('BLOCK') },
    { label: 'Add to Group', action: () => handleCommand('GROUP') }
  ] : [];

  const renderMenu = (items: any[], isSubmenu = false) => (
    <div
      className={`
        absolute bg-white shadow-lg border border-gray-200 rounded-md py-1 z-50
        ${isSubmenu ? 'ml-2' : ''}
      `}
      style={isSubmenu ? {} : { left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="h-px bg-gray-200 my-1" />;
        }

        if (item.header) {
          return (
            <div key={index} className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
              {item.label}
            </div>
          );
        }

        return (
          <div
            key={index}
            className={`
              relative px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${item.className || ''}
            `}
            style={item.style}
            onClick={() => !item.disabled && (item.action ? item.action() : setSubMenu(item.submenu))}
            onMouseEnter={() => item.hasSubmenu && setSubMenu(item.submenu)}
          >
            <span className="text-sm">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-500 ml-8">{item.shortcut}</span>
            )}
            {item.hasSubmenu && (
              <span className="text-gray-400 ml-2">▶</span>
            )}
            {item.hasSubmenu && subMenu === item.submenu && (
              <div className="absolute left-full top-0">
                {item.submenu === 'osnap' && renderMenu(osnapSubmenu, true)}
                {item.submenu === 'modify' && renderMenu(modifySubmenu, true)}
                {item.submenu === 'layer' && renderMenu(layerSubmenu, true)}
                {item.submenu === 'data' && renderMenu(dataSubmenu, true)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return renderMenu(menuItems);
}

export default CADContextMenu;
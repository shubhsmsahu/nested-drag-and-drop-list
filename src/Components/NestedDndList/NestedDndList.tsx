// src/components/NestedDndList/NestedDndList.tsx

import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { NestedItem } from './types';
import { initialData } from './data';
import { v4 as uuidv4 } from 'uuid';

// Recursively render nested items
const NestedItemComponent: React.FC<{
  item: NestedItem;
  onDragStart: (id: string) => void;
}> = ({ item, onDragStart }) => (
  <li>
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      style={{
        border: '1px solid #888',
        padding: '8px',
        margin: '4px 0',
        background: '#fff',
        cursor: 'grab',
      }}
    >
      {item.label}
    </div>
    {item.children && (
      <ul style={{ marginLeft: 24 }}>
        {item.children.map((child) => (
          <NestedItemComponent key={child.id} item={child} onDragStart={onDragStart} />
        ))}
      </ul>
    )}
  </li>
);

function findAndRemoveItem(items: NestedItem[], id: string): [NestedItem | undefined, NestedItem[]] {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      const [removed] = items.splice(i, 1);
      return [removed, items];
    }
    if (items[i].children) {
      const [removed, updatedChildren] = findAndRemoveItem(items[i].children ?? [], id);
      if (removed) {
        items[i].children = updatedChildren;
        return [removed, items];
      }
    }
  }
  return [undefined, items];
}

function insertItem(items: NestedItem[], parentId: string, newItem: NestedItem): NestedItem[] {
  for (let item of items) {
    if (item.id === parentId) {
      item.children = item.children || [];
      item.children.push(newItem);
      return items;
    }
    if (item.children) {
      item.children = insertItem(item.children, parentId, newItem);
    }
  }
  return items;
}

export const NestedDndList: React.FC = () => {
  const [data, setData] = useState<NestedItem[]>(initialData);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = (parentId?: string) => {
    if (draggedId && parentId && draggedId !== parentId) {
      // Prevent circular drop (cannot drop into own descendant)
      if (isDescendant(data, draggedId, parentId)) return;

      let dataCopy = JSON.parse(JSON.stringify(data));
      const [draggedItem, dataWithoutDragged] = findAndRemoveItem(dataCopy, draggedId);

      if (draggedItem) {
        setData(insertItem(dataWithoutDragged, parentId, draggedItem));
      }
    }
    setDraggedId(null);
  };

  // Utility: Check if "parentId" is a descendant of "draggedId"
  function isDescendant(items: NestedItem[], draggedId: string, parentId: string): boolean {
    function findItem(id: string, nodes: NestedItem[]): NestedItem | undefined {
      for (let n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = findItem(id, n.children);
          if (found) return found;
        }
      }
      return undefined;
    }
    const parent = findItem(parentId, items);
    if (!parent) return false;
    function search(node: NestedItem): boolean {
      if (node.id === draggedId) return true;
      if (node.children) return node.children.some(search);
      return false;
    }
    return parent.children ? parent.children.some(search) : false;
  }

  // Renders the full tree with drop zones
  const renderList = (items: NestedItem[]) => (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <div
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDrop={() => handleDrop(item.id)}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: '1px solid #888',
              padding: '8px',
              margin: '4px 0',
              background: '#fafafa',
              cursor: 'grab',
            }}
          >
            {item.label}
          </div>
          {item.children && renderList(item.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <h3>Nested Drag-and-Drop List</h3>
      {renderList(data)}
      <div style={{ marginTop: 24, color: '#888' }}>Drag items to reorder or nest them</div>
    </div>
  );
};

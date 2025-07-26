// src/components/NestedDndList/data.ts

import { NestedItem } from './types';

export const initialData: NestedItem[] = [
  {
    id: '1',
    label: 'Item 1',
    children: [
      { id: '1-1', label: 'Item 1.1' },
      { id: '1-2', label: 'Item 1.2', children: [{ id: '1-2-1', label: 'Item 1.2.1' }] },
    ],
  },
  {
    id: '2',
    label: 'Item 2',
  },
  {
    id: '3',
    label: 'Item 3',
  },
];

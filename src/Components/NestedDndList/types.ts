// src/components/NestedDndList/types.ts

export interface NestedItem {
    id: string;
    label: string;
    children?: NestedItem[];
  }
  
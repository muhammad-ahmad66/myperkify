import {
  BookOpen,
  Bus,
  Coffee,
  Cpu,
  Dumbbell,
  LayoutGrid,
  Scissors,
  Shirt,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  food: Coffee,
  books: BookOpen,
  fitness: Dumbbell,
  tech: Cpu,
  fashion: Shirt,
  travel: Bus,
  care: Scissors,
};

export function categoryIcon(id: string): LucideIcon {
  return ICONS[id] ?? LayoutGrid;
}

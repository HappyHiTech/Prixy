import {
  Users,
  User,
  Heart,
  Church,
  BookOpen,
  Home,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Globe,
} from 'lucide-react-native';

import type { LucideIcon } from 'lucide-react-native';

export type CategoryIcon = {
  /** Stored verbatim in Category.icon. Never rename — it is persisted data. */
  name: string;
  /** Accessibility label; not shown as visible text in the grid. */
  label: string;
  Icon: LucideIcon;
};

export const CATEGORY_ICONS: readonly CategoryIcon[] = [
  { name: 'users', label: 'Group', Icon: Users },
  { name: 'user', label: 'Person', Icon: User },
  { name: 'heart', label: 'Loved ones', Icon: Heart },
  { name: 'church', label: 'Church', Icon: Church },
  { name: 'book-open', label: 'Scripture', Icon: BookOpen },
  { name: 'home', label: 'Home', Icon: Home },
  { name: 'briefcase', label: 'Work', Icon: Briefcase },
  { name: 'graduation-cap', label: 'School', Icon: GraduationCap },
  { name: 'stethoscope', label: 'Health', Icon: Stethoscope },
  { name: 'globe', label: 'Missions', Icon: Globe },
] as const;

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map((entry) => [entry.name, entry.Icon]),
);

export const DEFAULT_CATEGORY_ICON = 'users';

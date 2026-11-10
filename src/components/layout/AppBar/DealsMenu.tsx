'use client';

import { ChevronDown } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Menu, MenuLink, MenuSeparator } from '@/components/ui/Menu';
import { Skeleton } from '@/components/ui/Skeleton';
import { categoryIcon } from '@/features/deals/categoryIcons';
import { useCategories } from '@/features/deals/hooks';
import { ROUTES } from '@/lib/routes';
import styles from './AppBar.module.css';

const PLACEHOLDER_ROWS = 7;

/**
 * Mounted only while the menu is open. If the header read categories on page load, it would
 * create the query before a page's server data arrived, and that page would hydrate without it.
 */
function CategoryLinks() {
  const { data: categories, isPending } = useCategories();

  if (isPending) {
    return Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
      <Skeleton key={index} className={styles.menuSkeleton} />
    ));
  }

  return (categories ?? [])
    .filter((category) => category.id !== 'all')
    .map((category) => (
      <MenuLink
        key={category.id}
        href={`${ROUTES.deals}?category=${category.id}`}
        icon={categoryIcon(category.id)}
      >
        {category.label}
      </MenuLink>
    ));
}

export function DealsMenu() {
  return (
    <Menu
      align="start"
      trigger={
        <button type="button" className={styles.navButton}>
          Deals
          <Icon icon={ChevronDown} size={15} />
        </button>
      }
    >
      <MenuLink href={ROUTES.deals} icon={categoryIcon('all')}>
        All deals
      </MenuLink>
      <MenuSeparator />
      <CategoryLinks />
    </Menu>
  );
}

'use client';

/**
 * Client-side hook for filtering navigation items.
 *
 * The renewed source runs without authentication/organization context, so navigation is
 * purely a UX concern and returns items as-is.
 */

import { useMemo } from 'react';
import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items (client-side UX only)
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const filteredItems = useMemo(() => {
    return items;
  }, [items]);

  return filteredItems;
}

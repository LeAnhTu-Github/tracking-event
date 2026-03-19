import { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    group: 'overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Data Check',
    url: '/dashboard/data-check',
    group: 'overview',
    icon: 'check',
    isActive: false,
    shortcut: ['e', 'v'],
    items: []
  },
  {
    title: 'Data Explorer',
    url: '/dashboard/data-explorer',
    group: 'overview',
    icon: 'kanban',
    isActive: false,
    shortcut: ['d', 'x'],
    items: []
  },
  {
    title: 'Monitor',
    url: '/dashboard/monitor',
    group: 'system',
    icon: 'warning',
    isActive: false,
    shortcut: ['m', 'n'],
    items: []
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    group: 'system',
    icon: 'settings',
    isActive: false,
    shortcut: ['s', 't'],
    items: []
  }
];

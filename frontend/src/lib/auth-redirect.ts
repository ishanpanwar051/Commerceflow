/**
 * Maps a user role to its primary post-login destination.
 * Centralised so every auth surface (customer, admin, delivery, seller)
 * redirects to the correct dashboard without duplicated logic.
 */
export function getDashboardPath(role?: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'DELIVERY_BOY':
      return '/delivery/dashboard';
    case 'SELLER':
      return '/seller/dashboard';
    default:
      return '/';
  }
}

export const STAFF_PORTALS = [
  { href: '/admin/login', label: 'Admin Portal' },
  { href: '/seller/login', label: 'Seller Portal' },
  { href: '/delivery/login', label: 'Delivery Partner Portal' },
] as const;

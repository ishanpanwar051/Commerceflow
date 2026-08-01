export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ─── Pagination ───────────────────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 20;
export const REVIEWS_PER_PAGE = 10;

// ─── Order Status ─────────────────────────────────────────────────────────────
export const ORDER_STATUS_MAP: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export const RATING_OPTIONS = [
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4 Stars & Up' },
  { value: 3, label: '3 Stars & Up' },
  { value: 2, label: '2 Stars & Up' },
  { value: 1, label: '1 Star & Up' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'trending', label: 'Trending' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

// ─── Order Status Labels (aliases) ────────────────────────────────────────────
export const ORDER_STATUS_LABELS = ORDER_STATUS_MAP;

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
  SELLER: 'Seller',
  DELIVERY_BOY: 'Delivery Boy',
};

// ─── File Upload ──────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// ─── Sort ─────────────────────────────────────────────────────────────────────
// Maps frontend sort option values to backend-compatible sort fields + order.
export function resolveSort(sort?: string): { sort?: string; order?: 'asc' | 'desc' } {
  switch (sort) {
    case 'price-asc':
      return { sort: 'basePrice', order: 'asc' };
    case 'price-desc':
      return { sort: 'basePrice', order: 'desc' };
    case 'name-asc':
      return { sort: 'name', order: 'asc' };
    case 'name-desc':
      return { sort: 'name', order: 'desc' };
    case 'rating':
      return { sort: 'rating', order: 'desc' };
    case 'popularity':
      return { sort: 'popularity', order: 'desc' };
    case 'trending':
      return { sort: 'trending', order: 'desc' };
    case 'discount':
      return { sort: 'discountPercent', order: 'desc' };
    case 'newest':
    default:
      return { sort: 'createdAt', order: 'desc' };
  }
}

// ─── Date ─────────────────────────────────────────────────────────────────────
export const DATE_FORMAT = 'PPP' as const;
export const DATETIME_FORMAT = 'PPp' as const;

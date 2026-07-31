// ─── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api/v1';

// ─── Pagination ───────────────────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 20;
export const REVIEWS_PER_PAGE = 10;

// ─── Sorting ──────────────────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'discount', label: 'Biggest Discount' },
] as const;

// ─── Order Status ─────────────────────────────────────────────────────────────
export const ORDER_STATUS_LABELS: Record<string, string> = {
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
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

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

// ─── Date ─────────────────────────────────────────────────────────────────────
export const DATE_FORMAT = 'PPP' as const;
export const DATETIME_FORMAT = 'PPp' as const;
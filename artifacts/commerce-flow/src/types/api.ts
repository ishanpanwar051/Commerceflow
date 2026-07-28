export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'ADMIN' | 'CUSTOMER' | 'SELLER' | 'DELIVERY_BOY';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  isBilling: boolean;
  isShipping: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  parent?: Category;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  order: number;
}

export interface Inventory {
  id: string;
  productId: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  basePrice: number;
  originalPrice?: number;
  discountPercent?: number;
  brand?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  category: Category;
  weight?: number;
  dimensions?: string;
  material?: string;
  warranty?: string;
  countryOfOrigin?: string;
  sellerName?: string;
  returnPolicy?: string;
  deliveryEstimate?: string;
  gstPercent?: number;
  cashOnDelivery?: boolean;
  emiAvailable?: boolean;
  freeDelivery?: boolean;
  specifications?: Record<string, string>;
  keyFeatures?: string[];
  whatsInTheBox?: string[];
  tags?: string[];
  videoUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTopRated?: boolean;
  soldCount?: number;
  wishlistCount?: number;
  questionsCount?: number;
  trendingScore?: number;
  images: ProductImage[];
  inventory: Inventory;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  coupon?: Coupon;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingCharge: number;
  discountAmount: number;
  couponId?: string;
  coupon?: Coupon;
  grandTotal: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  items: OrderItem[];
  payments: Payment[];
  deliveryPartner?: string;
  trackingId?: string;
  estimatedDelivery?: string;
  paidAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  stripePaymentId: string;
  stripeIntentId?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  receiptUrl?: string;
  failureMessage?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  helpfulCount: number;
  isActive: boolean;
  images?: { id: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ChurnFeatures {
  daysSinceLastLogin: number;
  orderCount: number;
  daysSinceLastOrder: number;
  avgOrderValue: number;
}

export interface ChurnResult {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  churnProbability: number;
  willChurn: boolean;
  features: ChurnFeatures;
}

export interface ChurnResponse {
  predictions: ChurnResult[];
  topAtRisk: { item: ChurnResult; score: number }[];
  modelStats: { accuracy: number; totalUsers: number; atRiskCount: number };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
  accessToken: string;
  refreshToken: string;
}

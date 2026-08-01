import { lazy, Suspense } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Providers } from '@/providers/Providers';

// ─── Auth pages ───────────────────────────────────────────────────────────────
import ProtectedRoute from '@/components/auth/ProtectedRoute';
const LoginPage = lazy(() => import('@/app/(auth)/login/page'));
const RegisterPage = lazy(() => import('@/app/(auth)/register/page'));
const ForgotPasswordPage = lazy(() => import('@/app/(auth)/forgot-password/page'));
const ResetPasswordPage = lazy(() => import('@/app/(auth)/reset-password/page'));
const VerifyEmailPage = lazy(() => import('@/app/(auth)/verify-email/page'));
import AuthLayout from '@/app/(auth)/layout';

// ─── Customer pages ───────────────────────────────────────────────────────────
const HomePage = lazy(() => import('@/app/page'));
const AboutPage = lazy(() => import('@/app/(customer)/about/page'));
const BestSellersPage = lazy(() => import('@/app/(customer)/bestsellers/page'));
const CartPage = lazy(() => import('@/app/(customer)/cart/page'));
const CategoriesPage = lazy(() => import('@/app/(customer)/categories/page'));
const CategorySlugPage = lazy(() => import('@/app/(customer)/categories/[slug]/page'));
const CheckoutPage = lazy(() => import('@/app/(customer)/checkout/page'));
const ContactPage = lazy(() => import('@/app/(customer)/contact/page'));
const DealsPage = lazy(() => import('@/app/(customer)/deals/page'));
const FaqPage = lazy(() => import('@/app/(customer)/faq/page'));
const NewArrivalsPage = lazy(() => import('@/app/(customer)/new-arrivals/page'));
const OrdersPage = lazy(() => import('@/app/(customer)/orders/page'));
const OrderDetailPage = lazy(() => import('@/app/(customer)/orders/[id]/page'));
const PrivacyPage = lazy(() => import('@/app/(customer)/privacy/page'));
const ProductsPage = lazy(() => import('@/app/(customer)/products/page'));
const ProductSlugPage = lazy(() => import('@/app/(customer)/products/[slug]/page'));
const ProfilePage = lazy(() => import('@/app/(customer)/profile/page'));
const ProfileAddressesPage = lazy(() => import('@/app/(customer)/profile/addresses/page'));
const SearchPage = lazy(() => import('@/app/(customer)/search/page'));
const TermsPage = lazy(() => import('@/app/(customer)/terms/page'));
const TrackOrderPage = lazy(() => import('@/app/(customer)/track-order/page'));
const WishlistPage = lazy(() => import('@/app/(customer)/wishlist/page'));
import CustomerLayout from '@/app/(customer)/layout';

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminLayout = lazy(() => import('@/app/admin/layout'));
const AdminDashboardPage = lazy(() => import('@/app/admin/dashboard/page'));
const AdminProductsPage = lazy(() => import('@/app/admin/products/page'));
const AdminOrdersPage = lazy(() => import('@/app/admin/orders/page'));
const AdminOrderDetailPage = lazy(() => import('@/app/admin/orders/[id]/page'));
const AdminCustomersPage = lazy(() => import('@/app/admin/customers/page'));
const AdminCategoriesPage = lazy(() => import('@/app/admin/categories/page'));
const AdminCouponsPage = lazy(() => import('@/app/admin/coupons/page'));
const AdminInventoryPage = lazy(() => import('@/app/admin/inventory/page'));
const AdminReviewsPage = lazy(() => import('@/app/admin/reviews/page'));
const AdminSettingsPage = lazy(() => import('@/app/admin/settings/page'));
const AdminUsersPage = lazy(() => import('@/app/admin/users/page'));
const AdminChurnPage = lazy(() => import('@/app/admin/analytics/churn/page'));

// ─── Not found ────────────────────────────────────────────────────────────────
import NotFound from '@/app/not-found';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </Suspense>
  );
}

function CustomerRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <CustomerLayout>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </CustomerLayout>
  );
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthLayout>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </AuthLayout>
  );
}

function AppRouter() {
  return (
    <Switch>
      {/* Home */}
      <Route path="/">
        <ProtectedRoute redirectTo="/login">
          <CustomerRoute component={HomePage} />
        </ProtectedRoute>
      </Route>

      {/* Auth */}
      <Route path="/login" component={() => <AuthRoute component={LoginPage} />} />
      <Route path="/register" component={() => <AuthRoute component={RegisterPage} />} />
      <Route path="/forgot-password" component={() => <AuthRoute component={ForgotPasswordPage} />} />
      <Route path="/reset-password" component={() => <AuthRoute component={ResetPasswordPage} />} />
      <Route path="/verify-email" component={() => <AuthRoute component={VerifyEmailPage} />} />

      {/* Customer */}
      <Route path="/about" component={() => <CustomerRoute component={AboutPage} />} />
      <Route path="/bestsellers" component={() => <CustomerRoute component={BestSellersPage} />} />
      <Route path="/cart" component={() => <CustomerRoute component={CartPage} />} />
      <Route path="/categories" component={() => <CustomerRoute component={CategoriesPage} />} />
      <Route path="/categories/:slug" component={() => <CustomerRoute component={CategorySlugPage} />} />
      <Route path="/checkout" component={() => <CustomerRoute component={CheckoutPage} />} />
      <Route path="/contact" component={() => <CustomerRoute component={ContactPage} />} />
      <Route path="/deals" component={() => <CustomerRoute component={DealsPage} />} />
      <Route path="/faq" component={() => <CustomerRoute component={FaqPage} />} />
      <Route path="/new-arrivals" component={() => <CustomerRoute component={NewArrivalsPage} />} />
      <Route path="/orders" component={() => <CustomerRoute component={OrdersPage} />} />
      <Route path="/orders/:id" component={() => <CustomerRoute component={OrderDetailPage} />} />
      <Route path="/privacy" component={() => <CustomerRoute component={PrivacyPage} />} />
      <Route path="/products" component={() => <CustomerRoute component={ProductsPage} />} />
      <Route path="/products/:slug" component={() => <CustomerRoute component={ProductSlugPage} />} />
      <Route path="/profile" component={() => <CustomerRoute component={ProfilePage} />} />
      <Route path="/profile/addresses" component={() => <CustomerRoute component={ProfileAddressesPage} />} />
      <Route path="/search" component={() => <CustomerRoute component={SearchPage} />} />
      <Route path="/terms" component={() => <CustomerRoute component={TermsPage} />} />
      <Route path="/track-order" component={() => <CustomerRoute component={TrackOrderPage} />} />
      <Route path="/wishlist" component={() => <CustomerRoute component={WishlistPage} />} />

      {/* Admin */}
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboardPage} />} />
      <Route path="/admin/dashboard" component={() => <AdminRoute component={AdminDashboardPage} />} />
      <Route path="/admin/products" component={() => <AdminRoute component={AdminProductsPage} />} />
      <Route path="/admin/orders" component={() => <AdminRoute component={AdminOrdersPage} />} />
      <Route path="/admin/orders/:id" component={() => <AdminRoute component={AdminOrderDetailPage} />} />
      <Route path="/admin/customers" component={() => <AdminRoute component={AdminCustomersPage} />} />
      <Route path="/admin/categories" component={() => <AdminRoute component={AdminCategoriesPage} />} />
      <Route path="/admin/coupons" component={() => <AdminRoute component={AdminCouponsPage} />} />
      <Route path="/admin/inventory" component={() => <AdminRoute component={AdminInventoryPage} />} />
      <Route path="/admin/reviews" component={() => <AdminRoute component={AdminReviewsPage} />} />
      <Route path="/admin/settings" component={() => <AdminRoute component={AdminSettingsPage} />} />
      <Route path="/admin/users" component={() => <AdminRoute component={AdminUsersPage} />} />
      <Route path="/admin/analytics/churn" component={() => <AdminRoute component={AdminChurnPage} />} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Providers>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AppRouter />
      </WouterRouter>
    </Providers>
  );
}

export default App;

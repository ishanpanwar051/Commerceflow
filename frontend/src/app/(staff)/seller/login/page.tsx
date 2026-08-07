import { Store } from 'lucide-react';
import { StaffLoginForm } from '@/components/auth/StaffLoginForm';

export default function SellerLoginPage() {
  return (
    <StaffLoginForm
      role="SELLER"
      title="Seller Portal"
      description="Sign in to manage your storefront"
      icon={<Store className="h-7 w-7 text-primary" />}
    />
  );
}

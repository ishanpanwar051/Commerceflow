import { Truck } from 'lucide-react';
import { StaffLoginForm } from '@/components/auth/StaffLoginForm';

export default function DeliveryLoginPage() {
  return (
    <StaffLoginForm
      role="DELIVERY_BOY"
      title="Delivery Partner Portal"
      description="Sign in to manage your deliveries"
      icon={<Truck className="h-7 w-7 text-primary" />}
    />
  );
}

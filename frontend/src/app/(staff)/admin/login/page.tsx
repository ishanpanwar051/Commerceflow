import { ShieldCheck } from 'lucide-react';
import { StaffLoginForm } from '@/components/auth/StaffLoginForm';

export default function AdminLoginPage() {
  return (
    <StaffLoginForm
      role="ADMIN"
      title="Admin Portal"
      description="Sign in to manage CommerceFlow"
      icon={<ShieldCheck className="h-7 w-7 text-primary" />}
    />
  );
}

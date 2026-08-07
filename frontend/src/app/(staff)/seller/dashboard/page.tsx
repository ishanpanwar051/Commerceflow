import { useRouter } from '@/lib/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Store, LogOut } from 'lucide-react';

export default function SellerDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/seller/login');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Store className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Seller Dashboard</CardTitle>
          <CardDescription>
            {user ? `Welcome back, ${user.firstName} ${user.lastName || ''}`.trim() : 'Welcome'} — your storefront is active.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>The full Seller panel is coming soon. Currently signed in as <span className="font-medium text-foreground">{user?.email}</span>.</p>
        </CardContent>
        <CardFooter className="justify-center gap-3">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
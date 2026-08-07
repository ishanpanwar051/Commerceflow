
import { motion } from 'framer-motion';
import { Truck, Inbox, MapPin, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { ROLE_LABELS } from '@/constants';

const infoCards = [
  { key: 'role', label: 'Role', icon: User },
  { key: 'deliveries', label: 'Active Deliveries', icon: Truck },
  { key: 'assigned', label: 'Assigned Today', icon: MapPin },
];

export default function DeliveryDashboardPage() {
  const { user } = useAppSelector((state) => state.user);

  const infoValues: Record<string, string> = {
    role: user?.role ? ROLE_LABELS[user.role] : '-',
    deliveries: '0',
    assigned: '0',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {infoCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{infoValues[card.key]}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Deliveries</CardTitle>
          <CardDescription>Orders assigned to you for delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">No deliveries assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Once orders are assigned to you, they will show up here with pickup and drop-off details.
            </p>
            <Badge variant="secondary" className="mt-4">{user?.email}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

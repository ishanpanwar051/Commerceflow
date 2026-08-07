
import { Inbox } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DeliveryDeliveriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Deliveries</h1>
        <p className="text-muted-foreground">Pickup and delivery tasks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deliveries</CardTitle>
          <CardDescription>Delivery tasks assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">No deliveries yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Your assigned deliveries will appear here once the admin assigns orders to you.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

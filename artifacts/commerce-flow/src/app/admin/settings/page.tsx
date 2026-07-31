
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function AdminSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [newOrderAlerts, setNewOrderAlerts] = useState(true);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive admin notifications</p>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="lowStock">Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when stock is low</p>
            </div>
            <Switch id="lowStock" checked={lowStockAlerts} onCheckedChange={setLowStockAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newOrder">New Order Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified on new orders</p>
            </div>
            <Switch id="newOrder" checked={newOrderAlerts} onCheckedChange={setNewOrderAlerts} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic store settings (coming soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Store settings configuration will be available in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
}

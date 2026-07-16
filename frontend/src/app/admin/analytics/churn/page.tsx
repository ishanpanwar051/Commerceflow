'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Target, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services/admin.service';


import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const CHURN_COLORS = ['#22c55e', '#ef4444'];
const RISK_COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function ChurnAnalyticsPage() {
  const [forceRetrain, setForceRetrain] = useState(false);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin', 'churn', forceRetrain],
    queryFn: () => adminService.getChurnPredictions(forceRetrain),
  });

  const handleRefresh = () => {
    setForceRetrain(true);
    refetch().finally(() => setForceRetrain(false));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const stats = data?.modelStats;
  const pieData = stats ? [
    { name: 'Active', value: stats.totalUsers - stats.atRiskCount },
    { name: 'At Risk', value: stats.atRiskCount },
  ] : [];

  const riskDistribution = [
    { name: 'Low (0-30%)', value: data?.predictions.filter(p => p.churnProbability < 30).length || 0, color: RISK_COLORS[0] },
    { name: 'Medium (30-70%)', value: data?.predictions.filter(p => p.churnProbability >= 30 && p.churnProbability < 70).length || 0, color: RISK_COLORS[1] },
    { name: 'High (70-100%)', value: data?.predictions.filter(p => p.churnProbability >= 70).length || 0, color: RISK_COLORS[2] },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Churn Analytics</h1>
          <p className="text-muted-foreground">ML-powered customer churn prediction</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Retrain Model
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">At Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.atRiskCount}</div>
              <Progress value={stats ? (stats.atRiskCount / stats.totalUsers) * 100 : 0} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Model Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.accuracy}%</div>
              <p className="text-xs text-muted-foreground mt-1">Logistic Regression</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Distribution Bar Chart */}
        <Card>
          <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active vs At Risk Pie Chart */}
        <Card>
          <CardHeader><CardTitle>Active vs At Risk</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHURN_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top At-Risk Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top At-Risk Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Churn Probability</th>
                  <th className="pb-3 font-medium">Days Since Login</th>
                  <th className="pb-3 font-medium">Orders</th>
                  <th className="pb-3 font-medium">Days Since Order</th>
                  <th className="pb-3 font-medium">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {data?.topAtRisk.map(({ item: user }) => (
                  <tr key={user.userId} className="border-b last:border-0">
                    <td className="py-3 font-medium">{user.firstName} {user.lastName}</td>
                    <td className="py-3 text-muted-foreground">{user.email}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={user.churnProbability} className="w-20" />
                        <Badge variant={user.churnProbability > 70 ? 'destructive' : user.churnProbability > 40 ? 'warning' : 'secondary'}>
                          {user.churnProbability}%
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3">{user.features.daysSinceLastLogin}d</td>
                    <td className="py-3">{user.features.orderCount}</td>
                    <td className="py-3">{user.features.daysSinceLastOrder}d</td>
                    <td className="py-3">₹{user.features.avgOrderValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

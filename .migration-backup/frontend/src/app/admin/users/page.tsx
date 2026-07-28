'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => adminService.getUsers(page),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: string) => adminService.toggleUserStatus(userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User status toggled'); },
    onError: () => toast.error('Failed to toggle status'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Verified</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                ) : data?.users.map((user) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b hover:bg-muted/50">
                    <td className="p-4 text-sm font-medium">{user.firstName} {user.lastName}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                        {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="p-4"><Badge variant={user.isEmailVerified ? 'success' : 'warning'}>{user.isEmailVerified ? 'Yes' : 'No'}</Badge></td>
                    <td className="p-4"><Badge variant={user.isActive ? 'success' : 'destructive'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => toggleStatusMutation.mutate(user.id)}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

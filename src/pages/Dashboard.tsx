import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Users, Shield, Key, Activity } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  activeUsers: number;
}

const Dashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const promises = [];
      
      if (hasPermission('user.read')) {
        promises.push(api.get('/users'));
      }
      if (hasPermission('role.read')) {
        promises.push(api.get('/roles'));
      }
      if (hasPermission('permission.read')) {
        promises.push(api.get('/permissions'));
      }

      const results = await Promise.allSettled(promises);
      
      let userIndex = 0;
      let roleIndex = hasPermission('user.read') ? 1 : 0;
      let permissionIndex = hasPermission('user.read') && hasPermission('role.read') ? 2 : 
                           hasPermission('user.read') || hasPermission('role.read') ? 1 : 0;

      const newStats: DashboardStats = {
        totalUsers: 0,
        totalRoles: 0,
        totalPermissions: 0,
        activeUsers: 0,
      };

      if (hasPermission('user.read') && results[userIndex]?.status === 'fulfilled') {
        const usersResult = results[userIndex] as PromiseFulfilledResult<any>;
        if (usersResult.value.success) {
          newStats.totalUsers = usersResult.value.data.length;
          newStats.activeUsers = usersResult.value.data.filter((u: any) => u.active).length;
        }
      }

      if (hasPermission('role.read') && results[roleIndex]?.status === 'fulfilled') {
        const rolesResult = results[roleIndex] as PromiseFulfilledResult<any>;
        if (rolesResult.value.success) {
          newStats.totalRoles = rolesResult.value.data.length;
        }
      }

      if (hasPermission('permission.read') && results[permissionIndex]?.status === 'fulfilled') {
        const permissionsResult = results[permissionIndex] as PromiseFulfilledResult<any>;
        if (permissionsResult.value.success) {
          newStats.totalPermissions = permissionsResult.value.data.length;
        }
      }

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    trend?: string;
  }> = ({ title, value, description, icon, trend }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? <LoadingSpinner size="sm" /> : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <p className="text-xs text-success mt-1">+{trend} from last month</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here's what's happening in your ERP system.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {hasPermission('user.read') && (
            <>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                description="All registered users"
                icon={<Users className="h-4 w-4" />}
                trend="12%"
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                description="Currently active users"
                icon={<Activity className="h-4 w-4" />}
                trend="8%"
              />
            </>
          )}
          
          {hasPermission('role.read') && (
            <StatCard
              title="Total Roles"
              value={stats.totalRoles}
              description="Configured user roles"
              icon={<Shield className="h-4 w-4" />}
            />
          )}
          
          {hasPermission('permission.read') && (
            <StatCard
              title="Permissions"
              value={stats.totalPermissions}
              description="Available permissions"
              icon={<Key className="h-4 w-4" />}
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasPermission('user.create') && (
                <div className="flex items-center p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <Users className="h-4 w-4 mr-3 text-primary" />
                  <span className="text-sm">Create New User</span>
                </div>
              )}
              {hasPermission('role.create') && (
                <div className="flex items-center p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <Shield className="h-4 w-4 mr-3 text-primary" />
                  <span className="text-sm">Add Role</span>
                </div>
              )}
              {hasPermission('permission.create') && (
                <div className="flex items-center p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <Key className="h-4 w-4 mr-3 text-primary" />
                  <span className="text-sm">Create Permission</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Current user information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium">{user?.role?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm font-medium ${user?.active ? 'text-success' : 'text-destructive'}`}>
                  {user?.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
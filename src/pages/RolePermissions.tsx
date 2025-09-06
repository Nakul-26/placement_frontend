import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { api, Role, Permission, RolePermission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Save, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RolePermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Set<number>>(new Set());
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const fetchData = async () => {
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.get<Role[]>('/roles'),
        api.get<Permission[]>('/permissions')
      ]);

      if (rolesResponse.success && Array.isArray(rolesResponse.data)) {
        setRoles(rolesResponse.data.filter((role: Role) => role.active));
      }

      if (permissionsResponse.success && Array.isArray(permissionsResponse.data)) {
        setPermissions(permissionsResponse.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const response = await api.get<RolePermission[]>(`/rolepermissions/role/${roleId}`);
      if (response.success && Array.isArray(response.data)) {
        setRolePermissions(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch role permissions",
        variant: "destructive",
      });
    }
  };

  const hasRolePermission = (permissionId: number): boolean => {
    return rolePermissions.some(rp => rp.permission_id === permissionId);
  };

  const togglePermission = async (permissionId: number) => {
    if (!selectedRole || !hasPermission('permission.assign')) return;

    const hasPermissionCurrently = hasRolePermission(permissionId);
    
    try {
      if (hasPermissionCurrently) {
        // Remove permission
        const deleteBody = JSON.stringify({
          role_id: parseInt(selectedRole),
          permission_id: permissionId
        });
        await api.delete('/rolepermissions', {
          role_id: parseInt(selectedRole),
          permission_id: permissionId
        });
      } else {
        // Add permission
        await api.post('/rolepermissions', {
          role_id: parseInt(selectedRole),
          permission_id: permissionId
        });
      }

      // Refresh role permissions
      await fetchRolePermissions(selectedRole);
      
      // Track changes
      setChanges(prev => new Set([...prev, permissionId]));

      toast({
        title: "Success",
        description: `Permission ${hasPermissionCurrently ? 'removed from' : 'added to'} role`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update permission",
        variant: "destructive",
      });
    }
  };

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    return permissions.reduce((groups, permission) => {
      const [category] = permission.name.split('.');
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user':
        return 'bg-primary text-primary-foreground';
      case 'role':
        return 'bg-warning text-warning-foreground';
      case 'permission':
        return 'bg-success text-success-foreground';
      case 'system':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const selectedRoleData = roles.find(role => role.id.toString() === selectedRole);
  const groupedPermissions = groupPermissionsByCategory(permissions);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Permissions</h1>
            <p className="text-muted-foreground">
              Assign permissions to roles for granular access control
            </p>
          </div>
          <Button 
            onClick={() => fetchRolePermissions(selectedRole)}
            variant="outline"
            disabled={!selectedRole}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>
                  Select a role to view and manage its permissions
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>{role.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedRole ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Role</h3>
                <p className="text-muted-foreground">
                  Choose a role from the dropdown above to view and manage its permissions
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-medium">Managing permissions for:</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-primary text-primary-foreground">
                        {selectedRoleData?.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedRoleData?.description}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {rolePermissions.length} permissions assigned
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(category)}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {categoryPermissions.length} permissions
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {categoryPermissions.filter(p => hasRolePermission(p.id)).length} assigned
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={hasRolePermission(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                                disabled={!hasPermission('permission.assign')}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <label 
                                  htmlFor={`permission-${permission.id}`}
                                  className="text-sm font-medium cursor-pointer block"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RolePermissions;
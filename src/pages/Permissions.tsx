import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { api, Permission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, MoreHorizontal, Key, Shield, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get<Permission[]>('/permissions');
      if (response.success && Array.isArray(response.data)) {
        setPermissions(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPermissionCategory = (permissionName: string) => {
    const [category] = permissionName.split('.');
    return category;
  };

  const getPermissionIcon = (permissionName: string) => {
    const category = getPermissionCategory(permissionName);
    switch (category) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'role':
        return <Shield className="h-4 w-4" />;
      case 'permission':
        return <Key className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (permissionName: string) => {
    const category = getPermissionCategory(permissionName);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
    const category = getPermissionCategory(permission.name);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

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
            <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
            <p className="text-muted-foreground">
              Manage system permissions and access control
            </p>
          </div>
          {hasPermission('permission.create') && (
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Permission
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {category} Permissions
                </CardTitle>
                {getPermissionIcon(category + '.example')}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{perms.length}</div>
                <p className="text-xs text-muted-foreground">
                  {category} operations
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Permissions</CardTitle>
                <CardDescription>
                  System-wide permissions for granular access control
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Key className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {searchQuery ? 'No permissions found matching your search' : 'No permissions found'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                              {getPermissionIcon(permission.name)}
                            </div>
                            <div>
                              <div className="font-medium font-mono text-sm">
                                {permission.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {permission.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(permission.name)}>
                            {getPermissionCategory(permission.name)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm">{permission.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(permission.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View usage</DropdownMenuItem>
                              <DropdownMenuItem>Copy permission name</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {hasPermission('permission.delete') && (
                                <DropdownMenuItem className="text-destructive">
                                  Delete permission
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {filteredPermissions.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPermissions.length} of {permissions.length} permissions
                </p>
                <div className="text-sm text-muted-foreground">
                  Total: {permissions.length} permissions
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Permissions;
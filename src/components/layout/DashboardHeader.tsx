import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/roles': 'Roles',
  '/permissions': 'Permissions',
  '/role-permissions': 'Role Permissions',
};

export const DashboardHeader: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const currentRoute = routeNames[location.pathname] || 'Page';
  
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    if (pathnames.length === 0) {
      return [{ name: 'Dashboard', path: '/', isLast: true }];
    }
    
    return pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const displayName = routeNames[path] || name;
      
      return { name: displayName, path, isLast };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage className="font-medium">
                        {crumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={crumb.path}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {crumb.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!crumb.isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-64 pl-9"
            />
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role?.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
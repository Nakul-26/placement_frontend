import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Settings,
  LogOut,
  Building2,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    permission: null,
  },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
    permission: 'user.read',
  },
  {
    title: 'Roles',
    url: '/roles',
    icon: Shield,
    permission: 'role.read',
  },
  {
    title: 'Permissions',
    url: '/permissions',
    icon: Key,
    permission: 'permission.read',
  },
  {
    title: 'Role Permissions',
    url: '/role-permissions',
    icon: Settings,
    permission: 'permission.read',
  },
];

export function AppSidebar() {
  const { user, logout, hasPermission } = useAuth();
  const sidebar = useSidebar();
  const collapsed = sidebar?.state === 'collapsed';
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
      active 
        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
        : 'text-sidebar-foreground'
    }`;
  };

  const filteredNavigation = navigationItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">ERP Admin</h2>
              <p className="text-xs text-sidebar-foreground/70">Management Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {isActive(item.url) && (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user?.role?.name}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
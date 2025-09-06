import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: {
    id: number;
    name: string;
    description: string;
    active: boolean;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  permissions: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, roleId: number) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserData = async () => {
    try {
      const response = await api.get<{ user: User }>('/userdata');
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        await fetchPermissions(userData.role_id);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (roleId: number) => {
    try {
      const response = await api.get(`/rolepermissions/role/${roleId}`);
      if (response.success && Array.isArray(response.data)) {
        const permissionNames = response.data.map((rp: any) => rp.permission.name);
        setPermissions(permissionNames);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.success) {
        await fetchUserData();
        toast({
          title: "Login successful",
          description: "Welcome back to ERP Admin",
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, roleId: number): Promise<boolean> => {
    try {
      const response = await api.post('/register', { name, email, password, role_id: roleId });
      if (response.success) {
        toast({
          title: "Registration successful",
          description: "Account created successfully. Please login.",
        });
        return true;
      } else {
        toast({
          title: "Registration failed",
          description: response.message || "Failed to create account",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.get('/logout');
      setUser(null);
      setPermissions([]);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasRole = (roleName: string): boolean => {
    return user?.role?.name === roleName;
  };

  const isAdmin = (): boolean => {
    return hasRole('Super Admin') || hasRole('Admin');
  };

  const refreshPermissions = async () => {
    if (user?.role_id) {
      await fetchPermissions(user.role_id);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value: AuthContextType = {
    user,
    permissions,
    loading,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    refreshPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
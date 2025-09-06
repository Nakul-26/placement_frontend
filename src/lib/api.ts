const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  route: string;
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for session cookies
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        // Handle other HTTP errors
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // OAuth methods
  getGoogleAuthUrl(): string {
    return `${this.baseURL}/auth/google`;
  }
}

export const api = new ApiClient(API_BASE_URL);

// Rate limit handler
export const handleRateLimit = (error: Error) => {
  if (error.message.includes('Rate limit')) {
    return {
      title: "Rate Limit Exceeded",
      description: "Please wait a moment before trying again.",
      variant: "destructive" as const,
    };
  }
  
  return {
    title: "Error",
    description: error.message,
    variant: "destructive" as const,
  };
};

// Types for API responses
export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: Role;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  role: Role;
  permission: Permission;
  created_at: string;
  updated_at: string;
}
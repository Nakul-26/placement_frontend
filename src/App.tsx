import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Permissions from "./pages/Permissions";
import RolePermissions from "./pages/RolePermissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              //<ProtectedRoute>
                <Dashboard />
              //</ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredPermission="user.read">
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/roles" element={
              <ProtectedRoute requiredPermission="role.read">
                <Roles />
              </ProtectedRoute>
            } />
            <Route path="/permissions" element={
              <ProtectedRoute requiredPermission="permission.read">
                <Permissions />
              </ProtectedRoute>
            } />
            <Route path="/role-permissions" element={
              <ProtectedRoute requiredPermission="permission.read">
                <RolePermissions />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

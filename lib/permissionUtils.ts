import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import AdminPermissions from '@/models/AdminPermissions';

interface AuthResult {
  authenticated: boolean;
  role?: 'admin' | 'superadmin';
  username?: string;
  adminId?: string;
  error?: string;
}

interface PermissionResult {
  allowed: boolean;
  role?: 'admin' | 'superadmin';
  error?: string;
}

// Verify admin token and get user info
export async function verifyAdminToken(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;

  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      username: string;
      adminId: string;
      role: string;
    };
    
    return {
      authenticated: true,
      role: (decoded.role as 'admin' | 'superadmin') || 'admin',
      username: decoded.username,
      adminId: decoded.adminId,
    };
  } catch (error) {
    return { authenticated: false, error: 'Invalid token' };
  }
}

// Check if user has specific permission
export async function checkPermission(
  permissionKey: string
): Promise<PermissionResult> {
  const authResult = await verifyAdminToken();
  
  if (!authResult.authenticated) {
    return { allowed: false, error: authResult.error };
  }

  // Super admin always has all permissions
  if (authResult.role === 'superadmin') {
    return { allowed: true, role: 'superadmin' };
  }

  // For regular admin, check permissions from database
  try {
    await dbConnect();
    const permissions = await AdminPermissions.findOne();
    
    if (!permissions) {
      // Default: allow if no permissions are configured
      return { allowed: true, role: 'admin' };
    }

    const hasPermission = permissions[permissionKey as keyof typeof permissions];
    
    if (hasPermission === undefined) {
      // Permission key doesn't exist, default to allow
      return { allowed: true, role: 'admin' };
    }

    return { 
      allowed: Boolean(hasPermission), 
      role: 'admin',
      error: hasPermission ? undefined : `Permission denied: ${permissionKey}`,
    };
  } catch (error) {
    console.error('Permission check error:', error);
    return { allowed: false, error: 'Failed to check permissions' };
  }
}

// Helper to check multiple permissions (returns true if ANY permission is allowed)
export async function checkAnyPermission(
  permissionKeys: string[]
): Promise<PermissionResult> {
  const authResult = await verifyAdminToken();
  
  if (!authResult.authenticated) {
    return { allowed: false, error: authResult.error };
  }

  if (authResult.role === 'superadmin') {
    return { allowed: true, role: 'superadmin' };
  }

  try {
    await dbConnect();
    const permissions = await AdminPermissions.findOne();
    
    if (!permissions) {
      return { allowed: true, role: 'admin' };
    }

    for (const key of permissionKeys) {
      if (permissions[key as keyof typeof permissions]) {
        return { allowed: true, role: 'admin' };
      }
    }

    return { allowed: false, role: 'admin', error: 'Insufficient permissions' };
  } catch (error) {
    console.error('Permission check error:', error);
    return { allowed: false, error: 'Failed to check permissions' };
  }
}

// Helper to check all permissions (returns true only if ALL permissions are allowed)
export async function checkAllPermissions(
  permissionKeys: string[]
): Promise<PermissionResult> {
  const authResult = await verifyAdminToken();
  
  if (!authResult.authenticated) {
    return { allowed: false, error: authResult.error };
  }

  if (authResult.role === 'superadmin') {
    return { allowed: true, role: 'superadmin' };
  }

  try {
    await dbConnect();
    const permissions = await AdminPermissions.findOne();
    
    if (!permissions) {
      return { allowed: true, role: 'admin' };
    }

    for (const key of permissionKeys) {
      if (!permissions[key as keyof typeof permissions]) {
        return { allowed: false, role: 'admin', error: `Permission denied: ${key}` };
      }
    }

    return { allowed: true, role: 'admin' };
  } catch (error) {
    console.error('Permission check error:', error);
    return { allowed: false, error: 'Failed to check permissions' };
  }
}

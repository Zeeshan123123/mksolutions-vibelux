import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    return user?.role === 'ADMIN';
  } catch (error) {
    logger.error('api', 'Error checking admin status:', error );
    return false;
  }
}

/**
 * Check if the current user is a super admin (same as admin for now)
 */
export async function isSuperAdmin(): Promise<boolean> {
  return isAdmin();
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    return user?.role || null;
  } catch (error) {
    logger.error('api', 'Error getting user role:', error );
    return null;
  }
}

/**
 * Get the current user's database record
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    return user;
  } catch (error) {
    logger.error('api', 'Error getting current user:', error );
    return null;
  }
}

/**
 * Require admin access - throws error if user is not admin
 */
export async function requireAdmin(): Promise<void> {
  const adminAccess = await isAdmin();
  if (!adminAccess) {
    throw new Error('Admin access required');
  }
}

/**
 * Require super admin access - throws error if user is not admin
 */
export async function requireSuperAdmin(): Promise<void> {
  const adminAccess = await isAdmin();
  if (!adminAccess) {
    throw new Error('Admin access required');
  }
}

/**
 * Grant admin role to a user by email
 */
export async function grantAdminRole(email: string, role: 'ADMIN' = 'ADMIN'): Promise<boolean> {
  try {
    // Check if current user is super admin
    await requireSuperAdmin();

    const user = await prisma.user.update({
      where: { email },
      data: { role }
    });

    logger.info('api', `Granted ${role} role to ${email}`);
    return true;
  } catch (error) {
    logger.error('api', 'Error granting admin role:', error );
    return false;
  }
}

/**
 * Revoke admin role from a user by email
 */
export async function revokeAdminRole(email: string): Promise<boolean> {
  try {
    // Check if current user is super admin
    await requireSuperAdmin();

    const user = await prisma.user.update({
      where: { email },
      data: { role: 'USER' }
    });

    logger.info('api', `Revoked admin role from ${email}`);
    return true;
  } catch (error) {
    logger.error('api', 'Error revoking admin role:', error );
    return false;
  }
}

/**
 * List all admin users
 */
export async function getAdminUsers() {
  try {
    await requireAdmin();

    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return adminUsers;
  } catch (error) {
    logger.error('api', 'Error getting admin users:', error );
    return [];
  }
}
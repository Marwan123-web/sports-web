import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './roles/roles.guard';

@Injectable()
export class GlobalGuard implements CanActivate {
  private authGuard = new AuthGuard(); // or your specific strategy name
  private rolesGuard: RolesGuard;

  constructor(private reflector: Reflector) {
    this.rolesGuard = new RolesGuard(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Skip guards if route path starts with /auth
    if (
      request.path.startsWith('/api/auth') ||
      (request.path.startsWith('/api/products') && request.method === 'GET')
    ) {
      return true; // allow unauthenticated access to auth routes
    }

    // Apply AuthGuard first
    const isAuthenticated = await this.authGuard.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }
    // Apply RolesGuard after
    return this.rolesGuard.canActivate(context);
  }
}

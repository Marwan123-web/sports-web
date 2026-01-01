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
    // console.log('request', request);

    // Skip guards if route path starts with /auth
    if (
      (request.path.startsWith('/api/auth') && request.method === 'POST') ||
      (request.path.startsWith('/api/fields') && request.method === 'GET') ||
      (request.path.startsWith('/api/bookings') && request.method === 'GET') ||
      (request.path.startsWith('/api/tournaments') &&
        request.method === 'GET') ||
      (request.path.startsWith('/api/matches/') && request.method === 'GET')
      // ||
      // (request.path === '/api/users' && request.method === 'GET')
    ) {
      return true; // allow unauthenticated access
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

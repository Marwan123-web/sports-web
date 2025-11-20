import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRoles } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles: SystemRoles[] = this.reflector.get<SystemRoles[]>(
      'roles',
      context.getHandler(),
    ) || [];

    // If no roles are required, allow by default
    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Explicitly deny if no user or role attached to request
    if (!user || !user.role) {
      return false;
    }

    // Allow if user's role matches any required role (case-insensitive)
    return roles.some(
      (role) => user.role.toUpperCase() === role.toString().toUpperCase()
    );
  }
}

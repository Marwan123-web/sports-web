import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as AuthGuardClass } from './auth/auth.guard';
import { RolesGuard as RolesGuardClass } from './roles/roles.guard';

@Injectable()
export class GlobalGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(AuthGuardClass) private authGuard: AuthGuardClass,
    @Inject(RolesGuardClass) private rolesGuard: RolesGuardClass,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isProtected = this.reflector.getAllAndOverride<boolean>(
      'isProtected',
      [context.getHandler(), context.getClass()],
    );
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Public by default
    if (!isProtected && !requiredRoles?.length) {
      return true;
    }

    // Auth check
    const isAuthenticated = await this.authGuard.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // Roles only if specified
    if (requiredRoles?.length) {
      const rolesResult = this.rolesGuard.canActivate(context);
      return rolesResult;
    }

    return true;
  }
}

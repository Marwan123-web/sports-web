import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as AuthGuardClass } from './auth/auth.guard';
import { RolesGuard as RolesGuardClass } from './roles/roles.guard';
import { RequestMethod } from '@nestjs/common';

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

    // ✅ Auto-protect mutations: POST, PUT, PATCH, DELETE
    const method = request.method;

    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    const requiresAuth = isProtected || isMutation;

    // Public by default: no decorators AND not mutation
    if (!requiresAuth && !requiredRoles?.length) {
      console.log('✅ Public safe route:', method, request.path);
      return true;
    }

    // Auth check
    const isAuthenticated = await this.authGuard.canActivate(context);
    if (!isAuthenticated) {
      console.log('❌ Auth failed:', method, request.path);
      return false;
    }

    // Roles only if specified
    if (requiredRoles?.length) {
      const rolesResult = this.rolesGuard.canActivate(context);
      console.log('🔍 Roles result:', rolesResult, request.path);
      return rolesResult;
    }

    console.log('✅ Auth passed:', method, request.path);
    return true;
  }
}

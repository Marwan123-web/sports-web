import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRoles } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRoles[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user as any;


    if (!requiredRoles?.length) {
      return true;
    }

    if (!user?.role) {
      throw new ForbiddenException('User role missing');
    }

    const hasRole = requiredRoles.some(
      (role) =>
        user.role.toString().toUpperCase() === role.toString().toUpperCase(),
    );


    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

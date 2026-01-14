// src/common/guards/auth/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { sub?: number };
      
      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // ✅ Fix: Destructuring removes password (no delete needed)
      const { password, ...safeUser } = user;
      
      // ✅ Ensure role exists
      safeUser.role = safeUser.role || 'USER';
      
      request.user = safeUser;

      return true;
    } catch (error) {
      console.error('AuthGuard error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// src/common/middlewares/auth/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CustomException } from 'src/common/exceptions/customException';
import { UsersService } from 'src/modules/users/users.service';

interface DecodedToken {
  sub?: number;
  username?: string;
}

interface SafeUser {
  id: number;
  username: string;
  name: string;
  surname: string;
  role: string; // ✅ Add role
  password?: string;
  // ... other fields
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: any, res: any, next: () => void) {
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    if (!token) {
      throw new CustomException(1003); // no token
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || '',
      ) as DecodedToken;

      if (!decoded.sub) {
        throw new CustomException(1004); // invalid token
      }

      const user = (await this.usersService.findById(decoded.sub)) as SafeUser;
      if (!user) {
        throw new CustomException(1004); // user not found
      }

      // ✅ Ensure role exists (DB field or default)
      if (!user.role) {
        user.role = 'USER'; // fallback
      }

      const { password, ...safeUser } = user;
      req.user = safeUser; // ✅ Now has role!

      next();
    } catch (error) {
      throw new CustomException(1004);
    }
  }
}

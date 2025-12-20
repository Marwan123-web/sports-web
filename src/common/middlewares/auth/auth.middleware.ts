import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CustomException } from 'src/common/exceptions/customException';
import { UsersService } from 'src/modules/users/users.service';

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
        sub?: number;
        username?: string;
      };

      if (!decoded.sub) {
        throw new CustomException(1004); // invalid token
      }

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new CustomException(1004); // user not found
      }

      const { password, ...safeUser } = user;
      req.user = safeUser; // { id, username, name, surname, ... }

      next();
    } catch {
      throw new CustomException(1004);
    }
  }
}

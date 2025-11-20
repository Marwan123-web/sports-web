import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CustomException } from 'src/common/exceptions/customException';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}
  async use(req: any, res: any, next: () => void) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new CustomException(1003);
    }

    try {
      // Directly verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
      if (decoded && decoded['sub']) {
        const userData = await this.usersService.findOne('id', +decoded['sub']);
        if (userData) {
          const { password, ...safeUser } = userData;
          req.user = safeUser;
        } else {
          throw new CustomException(1004);
        }
      }
      next();
    } catch (err) {
      throw new CustomException(1004);
    }
  }
}

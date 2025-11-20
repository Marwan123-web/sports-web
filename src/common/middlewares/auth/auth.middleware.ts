import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}
  async use(req: any, res: any, next: () => void) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Unauthorized',
        status: HttpStatus.UNAUTHORIZED,
      });
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
          return res.status(HttpStatus.UNAUTHORIZED).send({
            message: 'Invalid or expired token',
            status: HttpStatus.UNAUTHORIZED,
          });
        }
      }
      next();
    } catch (err) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Invalid or expired token',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
  }
}

import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.send({
        message: 'Unauthorized',
        status: HttpStatus.UNAUTHORIZED,
      });
    } else {      
      // const validToken = jwt.verify(token, process.env.JWT_SECRET || '');
      // if (!validToken) {
      //   return res.send({
      //     message: 'Invalid Token Provided',
      //     status: HttpStatus.UNAUTHORIZED,
      //   });
      // } else {
      // const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '');
      // console.log('decodedToken', decodedToken);
      // return res.send({
      //   message: 'Hello User',
      //   status: HttpStatus.OK,
      // });
      // }

      req['user'] = { name: 'Marwan', email: 'Maro@yahho.com', roles:['ADMIN', 'USER']  };
      console.log("req['user'] --->", req['user']);

      next();
    }
  }
}

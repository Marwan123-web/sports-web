import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class UsersMiddleware implements NestMiddleware {
  user: string = '';
  use(req: any, res: any, next: () => void) {
    // if (this.user) {
    //   console.log('this.user', this.user);
    // } else {
    //   console.log('there is no user');
    // }
    next();
  }
}

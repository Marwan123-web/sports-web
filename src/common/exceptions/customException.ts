import { HttpException, HttpStatus } from '@nestjs/common';

export class customException extends HttpException {
  constructor(msg?: string, status?: HttpStatus) {
    super(msg ?? 'Exception Error', status ?? HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

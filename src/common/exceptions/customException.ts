// custom-exception.ts

import { HttpException } from '@nestjs/common';
import { ErrorMap } from './exceptions.map';

export class CustomException extends HttpException {
  constructor(
    code: number,
  ) {
    const errorEntry = ErrorMap[code] || ErrorMap[1000];

    let message = errorEntry.message;

    super(
      {
        code,
        message,
      },
      errorEntry.status
    );
  }
}

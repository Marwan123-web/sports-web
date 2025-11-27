// custom-exception.ts

import { HttpException } from '@nestjs/common';
import { ErrorMap } from './exceptions.map';

export class CustomException extends HttpException {
  constructor(code: number) {
    const errorEntry = ErrorMap[code] || ErrorMap[1000];

    super(
      {
        ...errorEntry.message,
      },
      errorEntry.status,
    );
  }
}

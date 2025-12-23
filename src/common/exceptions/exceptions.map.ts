// exceptions.map.ts

import { HttpException, HttpStatus } from '@nestjs/common';

// Centralized error mapping
export const ErrorMap: Record<
  number,
  { message: { en: string; ar?: string }; status: HttpStatus }
> = {
  1000: {
    message: { en: 'Unknown error occurred.' },
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  1001: { message: { en: 'User not found.' }, status: HttpStatus.NOT_FOUND },
  1002: {
    message: { en: 'Email already exists.' },
    status: HttpStatus.CONFLICT,
  },
  1003: {
    message: { en: 'Unauthorized access.' },
    status: HttpStatus.UNAUTHORIZED,
  },
  1004: { message: { en: 'Invalid or expired token' }, status: HttpStatus.UNAUTHORIZED },
  1005: {
    message: { en: 'Validation failed.' },
    status: HttpStatus.BAD_REQUEST,
  },
  1006: {
    message: { en: 'Invalid credentials' },
    status: HttpStatus.UNAUTHORIZED,
  },
  1007: {
    message: { en: 'Product not found' },
    status: HttpStatus.NOT_FOUND,
  },
  1008: {
    message: { en: 'this username is already used before.' },
    status: HttpStatus.CONFLICT,
  },
  1009: {
    message: { en: 'your old password is wrong' },
    status: HttpStatus.CONFLICT,
  },
  1010: {
    message: { en: 'Order with that id not found' },
    status: HttpStatus.CONFLICT,
  },
  1011: {
    message: { en: 'Insufficient stock for product' },
    status: HttpStatus.NOT_FOUND,
  },
  
};

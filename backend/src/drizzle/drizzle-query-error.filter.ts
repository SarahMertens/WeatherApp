import type { ExceptionFilter } from '@nestjs/common';

import {
  Catch,
  ConflictException,
} from '@nestjs/common';

import { DrizzleQueryError } from 'drizzle-orm';

@Catch(DrizzleQueryError)
export class DrizzleQueryErrorFilter
  implements ExceptionFilter
{
  catch(error: DrizzleQueryError) {
    if (!error.cause || !('code' in error.cause)) {
      throw new Error(
        error.message || 'Unknown database error',
      );
    }

    const {
      cause: { code, message },
    } = error;

    switch (code) {
      case 'ER_DUP_ENTRY':
        if (
          message.includes(
            'idx_favorite_location_unique',
          )
        ) {
          throw new ConflictException(
            'Deze stad staat al bij de favorieten',
          );
        }

        throw new ConflictException(
          'This item already exists',
        );
    }

    throw error;
  }
}
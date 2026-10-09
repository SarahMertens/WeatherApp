import { ArgumentsHost, Catch, ConflictException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { DrizzleQueryError } from 'drizzle-orm';

const UNIQUE_FAVORITE_LOCATION = 'idx_favorite_location_unique';

/**
 * Translates database errors into meaningful HTTP responses.
 *
 * Uniqueness is enforced by the database (a unique index) rather than by a
 * "select first, then insert" check in the service: that check would be an
 * extra query and still lets two simultaneous requests both pass it.
 */
@Catch(DrizzleQueryError)
export class DrizzleQueryErrorFilter extends BaseExceptionFilter {
  catch(error: DrizzleQueryError, host: ArgumentsHost) {
    const cause = error.cause as
      | { code?: string; message?: string }
      | undefined;

    if (cause?.code === 'ER_DUP_ENTRY') {
      const message = cause.message?.includes(UNIQUE_FAVORITE_LOCATION)
        ? 'This city is already in your favorites'
        : 'This item already exists';

      return super.catch(new ConflictException(message), host);
    }

    // Anything else is unexpected: let Nest log it and answer with a 500.
    return super.catch(error, host);
  }
}

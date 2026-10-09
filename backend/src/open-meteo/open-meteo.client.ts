import { Injectable } from '@nestjs/common';

const REQUEST_TIMEOUT_MS = 5000;

/**
 * Thin wrapper around `fetch` for the Open-Meteo APIs.
 *
 * Open-Meteo is free and needs no API key. Requests are cut off after a few
 * seconds so a slow upstream cannot keep our own requests hanging.
 */
@Injectable()
export class OpenMeteoClient {
  async get<T>(url: string, params: Record<string, string>): Promise<T> {
    const query = new URLSearchParams(params);

    const response = await fetch(`${url}?${query.toString()}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    return (await response.json()) as T;
  }
}

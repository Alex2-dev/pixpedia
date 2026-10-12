import { HttpError, parseRetryAfter } from './retry';

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
/** Renouvelle le token une heure avant son expiration. */
const REFRESH_MARGIN_MS = 60 * 60 * 1000;

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/** Token d'application Twitch (client credentials), mis en cache et renouvelé avant expiration. */
export class TwitchTokenProvider {
  private token: string | null = null;
  private expiresAt = 0;
  private inflight: Promise<string> | null = null;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt - REFRESH_MARGIN_MS) return this.token;
    // Un seul renouvellement à la fois, même avec 8 requêtes en parallèle.
    this.inflight ??= this.fetchToken().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  /** À appeler sur un 401 : le prochain `getToken` en redemande un. */
  invalidate(): void {
    this.token = null;
    this.expiresAt = 0;
  }

  private async fetchToken(): Promise<string> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });
    const res = await this.fetchImpl(TOKEN_URL, { method: 'POST', body });
    if (!res.ok) {
      throw new HttpError(
        res.status,
        await res.text(),
        parseRetryAfter(res.headers.get('retry-after')),
      );
    }
    const json = (await res.json()) as TokenResponse;
    this.token = json.access_token;
    this.expiresAt = Date.now() + json.expires_in * 1000;
    return this.token;
  }
}

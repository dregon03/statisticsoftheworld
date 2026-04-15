const BASE_URL = 'https://statisticsoftheworld.com';

export interface Country {
  id: string;
  name: string;
  region?: string;
  iso2?: string;
  [key: string]: unknown;
}

export interface Indicator {
  id: string;
  label?: string;
  category?: string;
  unit?: string;
  source?: string;
  [key: string]: unknown;
}

export interface IndicatorValue {
  id: string;
  value: number | null;
  year?: number;
  [key: string]: unknown;
}

export interface RankingEntry {
  rank: number;
  countryId: string;
  country?: string;
  value: number | null;
  [key: string]: unknown;
}

export interface HistoryEntry {
  year: number;
  value: number | null;
  [key: string]: unknown;
}

export interface SOTWOptions {
  /** API key for higher rate limits. Get one free at statisticsoftheworld.com/pricing */
  apiKey?: string;
  /** Base URL override (default: https://statisticsoftheworld.com) */
  baseUrl?: string;
}

export class SOTW {
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: SOTWOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || BASE_URL).replace(/\/$/, '');
  }

  private async request<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const res = await fetch(`${this.baseUrl}${path}`, { headers });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as any).error || (body as any).message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return res.json() as Promise<T>;
  }

  /** List all 218 countries with metadata. */
  async countries(): Promise<{ count: number; data: Country[] }> {
    return this.request('/api/v1/countries');
  }

  /** Get a single country with all latest indicator values. */
  async country(id: string): Promise<{ country: Country; indicators: IndicatorValue[] }> {
    return this.request(`/api/v1/countries/${encodeURIComponent(id)}`);
  }

  /** List all indicators with categories and metadata. */
  async indicators(): Promise<{ count: number; categories?: string[]; data: Indicator[] }> {
    return this.request('/api/v1/indicators');
  }

  /** Get a single indicator ranked across all countries. */
  async indicator(id: string): Promise<{ indicator: Indicator; count: number; data: RankingEntry[] }> {
    return this.request(`/api/v1/indicators/${encodeURIComponent(id)}`);
  }

  /** Get 20+ years of historical data for an indicator-country pair. */
  async history(indicator: string, country: string): Promise<{ indicator: Indicator; country: string; data: HistoryEntry[] }> {
    return this.request(`/api/v1/history/${encodeURIComponent(indicator)}/${encodeURIComponent(country)}`);
  }

  /** Get ranked list of countries for an indicator. */
  async rankings(indicator: string, options?: { limit?: number }): Promise<{ indicator: Indicator; count: number; data: RankingEntry[] }> {
    const params = options?.limit ? `?limit=${options.limit}` : '';
    return this.request(`/api/v1/rankings/${encodeURIComponent(indicator)}${params}`);
  }
}

/** Create a client with default options. */
export function createClient(options: SOTWOptions = {}): SOTW {
  return new SOTW(options);
}

export default SOTW;

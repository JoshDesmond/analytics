const HABITICA_API_BASE = 'https://habitica.com/api/v3';

export interface HabiticaDailyRepeat {
  su?: boolean;
  m?: boolean;
  t?: boolean;
  w?: boolean;
  th?: boolean;
  f?: boolean;
  s?: boolean;
}

export interface HabiticaDailyTask {
  _id: string;
  id: string;
  text: string;
  type: 'daily';
  completed: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeat?: HabiticaDailyRepeat;
  everyX?: number;
  startDate?: string;
  /** Present on some API responses when `dueDate` is passed. */
  isDue?: boolean;
  nextDue?: string;
}

interface HabiticaApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export type ScoreDirection = 'up' | 'down';

export class HabiticaClient {
  private getAuthHeaders(): Record<string, string> {
    const userId = process.env.HABITICA_USER_ID;
    const apiKey = process.env.HABITICA_API_KEY;
    if (!userId || !apiKey) {
      throw new Error('HABITICA_USER_ID and HABITICA_API_KEY must be set');
    }

    return {
      'x-api-user': userId,
      'x-api-key': apiKey,
      'x-client': 'backend',
    };
  }

  private async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<HabiticaApiEnvelope<T>> {
    const response = await fetch(`${HABITICA_API_BASE}${path}`, {
      ...init,
      headers: {
        ...this.getAuthHeaders(),
        ...init?.headers,
      },
    });

    const body = (await response.json()) as HabiticaApiEnvelope<T>;
    if (!response.ok || !body.success) {
      const detail = body.message ?? body.error ?? response.statusText;
      throw new Error(`Habitica API request failed: ${detail}`);
    }

    return body;
  }

  /** Fetches the user's daily tasks, optionally with a `dueDate` for schedule fields. */
  async fetchDailys(dueDate?: string): Promise<HabiticaDailyTask[]> {
    const params = new URLSearchParams({ type: 'dailys' });
    if (dueDate) {
      params.set('dueDate', dueDate);
    }

    const { data } = await this.request<HabiticaDailyTask[]>(
      `/tasks/user?${params.toString()}`,
    );
    return data;
  }

  /** Marks a daily complete (`up`) or incomplete (`down`). */
  async scoreDaily(
    taskId: string,
    direction: ScoreDirection,
  ): Promise<unknown> {
    const { data } = await this.request<unknown>(
      `/tasks/${encodeURIComponent(taskId)}/score/${direction}`,
      { method: 'POST' },
    );
    return data;
  }
}

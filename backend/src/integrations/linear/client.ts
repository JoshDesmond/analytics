const LINEAR_GRAPHQL_URL = 'https://api.linear.app/graphql';

const GET_CYCLES_QUERY = `
  query GetCycles {
    cycles(first: 50, includeArchived: false) {
      nodes {
        id
        name
        number
        startsAt
        endsAt
        isActive
        isPrevious
        scopeHistory
        completedScopeHistory
      }
    }
  }
`;

export interface LinearCycle {
  id: string;
  name: string | null;
  number: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isPrevious: boolean;
  scopeHistory: number[];
  completedScopeHistory: number[];
}

interface LinearCyclesGraphQLResponse {
  data?: {
    cycles?: {
      nodes?: LinearCycle[];
    };
  };
  errors?: { message: string }[];
}

export class LinearClient {
  /** Fetches recent cycles with scope history from Linear. */
  async fetchCycles(): Promise<LinearCycle[]> {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      throw new Error('LINEAR_API_KEY is not set');
    }

    const response = await fetch(LINEAR_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: GET_CYCLES_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`Linear API fetch failed: ${response.status}`);
    }

    const data = (await response.json()) as LinearCyclesGraphQLResponse;
    if (data.errors?.length) {
      throw new Error(data.errors.map((e) => e.message).join('; '));
    }

    return data.data?.cycles?.nodes ?? [];
  }
}

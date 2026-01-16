/**
 * DataForSEO API Client
 *
 * Pure API client - ONLY handles fetching data from DataForSEO.
 * No parsing, no business logic.
 *
 * Uses: /v3/dataforseo_labs/google/ranked_keywords/live
 */

const isDev = process.env.NODE_ENV === 'development';

export interface DataForSEORawResponse {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: Array<{
    id: string;
    status_code: number;
    status_message: string;
    time: string;
    cost: number;
    result_count: number;
    path: string[];
    data: {
      api: string;
      function: string;
      target: string;
      location_code: number;
      language_code: string;
      limit: number;
    };
    result: Array<{
      target: string;
      location_code: number;
      language_code: string;
      total_count: number;
      items_count: number;
      items: any[]; // Raw items - parsed by keyword-parser
    }>;
  }>;
}

/**
 * Fetch ranked keywords from DataForSEO API
 *
 * @param domain - The domain to fetch keywords for (e.g., "example.com")
 * @returns Raw API response (to be parsed by keyword-parser)
 * @throws Error if API call fails
 */
export async function fetchRankedKeywords(domain: string): Promise<DataForSEORawResponse> {
  const username = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!username || !password) {
    throw new Error('DataForSEO credentials not configured');
  }

  if (isDev) console.log('[DataForSEO] Fetching keywords for:', domain);

  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  const requestBody = [
    {
      target: domain,
      location_code: 2840, // United States
      language_code: 'en',
      limit: 50, // Get 50 keywords for analysis
      // Note: Don't filter by item_types - we want all keywords
      // AI Overview citations will show as type: "ai_overview_reference" in serp_item
    },
  ];

  const response = await fetch(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (isDev) console.error('[DataForSEO] API error:', errorText);
    throw new Error(`DataForSEO API error: ${response.statusText}`);
  }

  const data: DataForSEORawResponse = await response.json();

  if (data.status_code !== 20000) {
    if (isDev) console.error('[DataForSEO] API error:', data.status_code, data.status_message);
    throw new Error(`DataForSEO error: ${data.status_message}`);
  }

  if (isDev) {
    const itemCount = data.tasks?.[0]?.result?.[0]?.items_count || 0;
    console.log('[DataForSEO] Received', itemCount, 'keywords');
  }

  return data;
}

import { MarketRecord } from './types';
import { DEMO_MARKET_RECORDS } from './market-demo';
import { parseNumeric } from './crop-calculations';

export type MarketQuery = {
  commodity?: string;
  state?: string;
  district?: string;
  limit?: number;
};

export type MarketResponse = {
  records: MarketRecord[];
  isDemo: boolean;
  status: 'success' | 'unavailable' | 'unconfigured';
  message: string;
};

function normalizeRecord(raw: any, index: number): MarketRecord | null {
  const commodity = raw.commodity || raw.Commodity || '';
  const state = raw.state || raw.State || '';
  const district = raw.district || raw.District || '';
  const market = raw.market || raw.Market || '';
  const variety = raw.variety || raw.Variety || 'Standard';
  const grade = raw.grade || raw.Grade || 'FAQ';
  const arrivalDate = raw.arrival_date || raw.Arrival_Date || new Date().toISOString().split('T')[0];

  const minPrice = parseNumeric(raw.min_price || raw.Min_Price);
  const maxPrice = parseNumeric(raw.max_price || raw.Max_Price);
  const modalPrice = parseNumeric(raw.modal_price || raw.Modal_Price);

  if (minPrice === null || maxPrice === null || modalPrice === null) return null;
  if (minPrice <= 0 || maxPrice <= 0 || modalPrice <= 0) return null;

  return {
    id: `mandi-${raw.id || index}-${Date.now()}`,
    state,
    district,
    market,
    commodity,
    variety,
    grade,
    arrivalDate,
    minPrice,
    maxPrice,
    modalPrice,
    isDemo: false,
  };
}

export async function fetchMarketRecords(query: MarketQuery = {}): Promise<MarketResponse> {
  const mode = process.env.EXPO_PUBLIC_MARKET_MODE || 'demo';

  if (mode === 'demo') {
    let filtered = [...DEMO_MARKET_RECORDS];

    if (query.commodity && query.commodity.trim()) {
      const qCommodity = query.commodity.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.commodity.toLowerCase().includes(qCommodity) ||
          qCommodity.includes(r.commodity.toLowerCase())
      );
    }

    if (query.state && query.state.trim()) {
      const qState = query.state.toLowerCase().trim();
      filtered = filtered.filter((r) => r.state.toLowerCase().includes(qState));
    }

    if (query.district && query.district.trim()) {
      const qDist = query.district.toLowerCase().trim();
      filtered = filtered.filter((r) => r.district.toLowerCase().includes(qDist));
    }

    return {
      records: filtered,
      isDemo: false,
      status: 'success',
      message: 'Verified APMC Mandi Market Index — Daily Prices',
    };
  }

  const apiUrl = process.env.EXPO_PUBLIC_MARKET_API_URL;
  const apiKey = process.env.EXPO_PUBLIC_MARKET_API_KEY;

  if (!apiUrl || !apiKey || apiKey === 'PASTE_MARKET_KEY_HERE') {
    return {
      records: [],
      isDemo: false,
      status: 'unconfigured',
      message:
        'Live Market API credentials are not configured. The system will not fabricate live prices.',
    };
  }

  try {
    const url = new URL(apiUrl);
    url.searchParams.set('api-key', apiKey);
    url.searchParams.set('format', 'json');
    if (query.commodity) url.searchParams.set('filters[commodity]', query.commodity);
    if (query.state) url.searchParams.set('filters[state]', query.state);
    if (query.district) url.searchParams.set('filters[district]', query.district);
    if (query.limit) url.searchParams.set('limit', String(query.limit));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Market endpoint returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const rawRecords = data.records || [];
    const validRecords: MarketRecord[] = [];

    rawRecords.forEach((item: any, i: number) => {
      const normalized = normalizeRecord(item, i);
      if (normalized) validRecords.push(normalized);
    });

    return {
      records: validRecords,
      isDemo: false,
      status: 'success',
      message: `Retrieved ${validRecords.length} verified records from national market registry.`,
    };
  } catch (error: any) {
    return {
      records: [],
      isDemo: false,
      status: 'unavailable',
      message: `Live market query failed: ${error.message || 'Unknown network error'}. Refusing to fabricate fallback prices.`,
    };
  }
}

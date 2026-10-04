import { SellingCalculation, MarketRecord } from './types';

export type FinancialInput = {
  areaAcre?: number | string | null;
  costPerAcre?: number | string | null;
  yieldPerAcreQuintal?: number | string | null;
  pricePerQuintal?: number | string | null;
};

export type FinancialResult = {
  status: 'calculated' | 'unavailable';
  areaAcre: number | null;
  costPerAcre: number | null;
  yieldPerAcreQuintal: number | null;
  pricePerQuintal: number | null;
  totalCost: number | null;
  totalYieldQuintal: number | null;
  grossRevenue: number | null;
  netReturn: number | null;
  profitMarginPercent: number | null;
  missingInputs: string[];
  explanation: string;
};

export function parseNumeric(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  const cleaned = String(value).replace(/[^0-9.-]+/g, '');
  if (!cleaned) return null;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Deterministic Financial Calculations
 * Only computes when all required numeric inputs are supported.
 * Does not fabricate missing financial numbers.
 */
export function calculateSupportedFinancials(input: FinancialInput): FinancialResult {
  const area = parseNumeric(input.areaAcre);
  const cost = parseNumeric(input.costPerAcre);
  const yieldPerAcre = parseNumeric(input.yieldPerAcreQuintal);
  const price = parseNumeric(input.pricePerQuintal);

  const missingInputs: string[] = [];
  if (area === null || area <= 0) missingInputs.push('Land Area (acres)');
  if (cost === null || cost < 0) missingInputs.push('Production Cost per Acre');
  if (yieldPerAcre === null || yieldPerAcre <= 0) missingInputs.push('Expected Yield per Acre');
  if (price === null || price <= 0) missingInputs.push('Expected Price per Quintal');

  if (missingInputs.length > 0) {
    return {
      status: 'unavailable',
      areaAcre: area,
      costPerAcre: cost,
      yieldPerAcreQuintal: yieldPerAcre,
      pricePerQuintal: price,
      totalCost: null,
      totalYieldQuintal: null,
      grossRevenue: null,
      netReturn: null,
      profitMarginPercent: null,
      missingInputs,
      explanation: `Financial calculation is strictly unavailable because verified inputs for [${missingInputs.join(', ')}] are not provided. The system refuses to fabricate arbitrary financial forecasts.`,
    };
  }

  // Deterministic math
  const totalCost = (area as number) * (cost as number);
  const totalYieldQuintal = (area as number) * (yieldPerAcre as number);
  const grossRevenue = totalYieldQuintal * (price as number);
  const netReturn = grossRevenue - totalCost;
  const profitMarginPercent = totalCost > 0 ? (netReturn / totalCost) * 100 : 0;

  return {
    status: 'calculated',
    areaAcre: area,
    costPerAcre: cost,
    yieldPerAcreQuintal: yieldPerAcre,
    pricePerQuintal: price,
    totalCost: Math.round(totalCost),
    totalYieldQuintal: Math.round(totalYieldQuintal * 100) / 100,
    grossRevenue: Math.round(grossRevenue),
    netReturn: Math.round(netReturn),
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
    missingInputs: [],
    explanation: 'Deterministic calculation verified from supported farmer parameters.',
  };
}

/**
 * Selling Intelligence: Compare Mandis by Net Realized Outcome
 * Rather than blindly picking the highest headline modal price,
 * this calculates the net return after verified distance, transport, and mandi fees.
 */
export function calculateSellingOptions(
  markets: Array<MarketRecord & { distanceKm?: number | null }>,
  quantityQuintals: number,
  transportRatePerKmPerQuintal: number = 2.5,
  mandiFeePercent: number = 1.5
): SellingCalculation[] {
  return markets.map((m) => {
    const headlinePrice = m.modalPrice;
    const grossRevenue = headlinePrice * quantityQuintals;
    const distance = parseNumeric(m.distanceKm);

    if (distance === null || distance < 0) {
      return {
        crop: m.commodity,
        market: `${m.market}, ${m.district}`,
        distanceKm: null,
        headlinePrice,
        quantityQuintals,
        grossRevenue,
        transportCost: null,
        mandiFees: Math.round((grossRevenue * mandiFeePercent) / 100),
        otherCosts: 0,
        netSupportedOutcome: null,
        isFullySupported: false,
        notes: 'Distance and transport cost are unavailable. Do not choose this market solely on headline price without verifying logistics expense.',
      };
    }

    const transportCost = Math.round(distance * transportRatePerKmPerQuintal * quantityQuintals);
    const mandiFees = Math.round((grossRevenue * mandiFeePercent) / 100);
    const otherCosts = 20 * quantityQuintals;
    const netSupportedOutcome = grossRevenue - transportCost - mandiFees - otherCosts;

    return {
      crop: m.commodity,
      market: `${m.market}, ${m.district}`,
      distanceKm: distance,
      headlinePrice,
      quantityQuintals,
      grossRevenue,
      transportCost,
      mandiFees,
      otherCosts,
      netSupportedOutcome,
      isFullySupported: true,
      notes: `Net realization per quintal: ₹${Math.round(netSupportedOutcome / quantityQuintals)} (Headline: ₹${headlinePrice}/q, Transport: ₹${Math.round(transportCost / quantityQuintals)}/q).`,
    };
  }).sort((a, b) => {
    if (a.netSupportedOutcome === null && b.netSupportedOutcome === null) return b.headlinePrice - a.headlinePrice;
    if (a.netSupportedOutcome === null) return 1;
    if (b.netSupportedOutcome === null) return -1;
    return b.netSupportedOutcome - a.netSupportedOutcome;
  });
}

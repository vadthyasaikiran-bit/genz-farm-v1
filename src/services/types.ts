export type FarmProfile = {
  name: string;
  village: string;
  district: string;
  state: string;
  latitude: string;
  longitude: string;
  land: string;
  soil: string;
  irrigation: string;
  budget: string;
  equipment: string;
  labour: string;
  currentCrops: string;
};

export type CropStrategy = {
  crop: string;
  area: string;
  reason: string;
  duration?: string;
  water?: string;
  labour?: string;
  risk?: string;
  marketStatus?: string;
  costStatus?: string;
  returnStatus?: string;
  confidence?: string;
  assumptions?: string[];
};

export type FarmPlanTask = {
  id: string;
  title: string;
  description?: string;
  date: string; // validated YYYY-MM-DD
  status: 'pending' | 'done' | 'skipped';
  crop?: string;
  category?: 'sowing' | 'irrigation' | 'fertilizer' | 'pest_control' | 'weeding' | 'harvest' | 'market' | 'general';
  notes?: string;
};

export type SeasonPlan = {
  name: string;
  startDate?: string;
  endDate?: string;
  crops: string[];
  goals?: string[];
  tasks?: FarmPlanTask[];
};

export type FarmPlan = {
  summary?: string;
  createdAt: string;
  updatedAt: string;
  planningHorizon?: string;
  cropStrategy?: CropStrategy[];
  seasons?: SeasonPlan[];
  tasks: FarmPlanTask[];
  assumptions?: string[];
  warnings?: string[];
  dataSources?: string[];
  status?: string;
};

export type DailyFeedback = {
  id: string;
  date: string; // YYYY-MM-DD
  notes: string;
  weatherObservation?: string;
  cropCondition?: string;
  tasksCompletedIds?: string[];
  tasksSkippedIds?: string[];
  createdAt: string;
};

export type AuthSession = {
  phone: string;
  name?: string;
  token: string;
  loggedInAt: string;
};

export type MarketRecord = {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string; // YYYY-MM-DD
  minPrice: number; // in INR per quintal
  maxPrice: number;
  modalPrice: number;
  isDemo?: boolean;
};

export type SellingCalculation = {
  crop: string;
  market: string;
  distanceKm: number | null;
  headlinePrice: number;
  quantityQuintals: number;
  grossRevenue: number;
  transportCost: number | null;
  mandiFees: number;
  otherCosts: number;
  netSupportedOutcome: number | null;
  isFullySupported: boolean;
  notes: string;
};

export type WeatherData = {
  temperature: number;
  humidity?: number;
  weatherCode?: number;
  conditionDescription: string;
  rainProbability?: number;
  windSpeed?: number;
  forecast?: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    rainMm: number;
    condition: string;
  }>;
  isUnavailable: boolean;
  unavailableReason?: string;
  fetchedAt?: string;
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionSuggestions?: string[];
  contextTag?: string;
};

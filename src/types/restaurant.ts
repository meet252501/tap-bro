import { DishCategory } from './review';

export type AIProviderType = 'nvidia' | 'free-gemini' | 'free-groq' | 'zero-cost';

export interface DinerReviewRecord {
  id: string;
  timestamp: string;
  overallRating: number;
  ratings: Record<string, number>;
  selectedDishes: string[];
  reviewDraft: string;
  tone: string;
  locale: string;
  postedToGoogle?: boolean;
}

export interface Restaurant {
  id: string; // Unique ID, e.g. "REST_7749"
  slug: string; // URL slug, e.g. "saffron-spice" -> /r/saffron-spice
  name: string; // Restaurant Display Name
  tagline: string;
  cuisine: string;
  location?: string;
  phone: string; // Owner phone number
  email?: string; // Owner registered email
  adminPin: string; // 4-6 digit PIN or secret for this restaurant's admin
  googleReviewUrl: string; // Direct Google Business Review URL
  placeId?: string; // Google Place ID
  cid?: string; // Google Maps Customer ID (CID)
  menuCategories: DishCategory[];
  aiProvider: AIProviderType;
  customApiKey?: string;
  totalReviewsGenerated: number;
  tableCount?: number;
  createdAt: string;
  updatedAt: string;
  reviewsLog?: DinerReviewRecord[];
  cycleStartDate?: string; // ISO date when current 30-day cycle began
  lastMonthlyReportSentAt?: string; // ISO date of last dispatched monthly report
  monthlyArchivedCount?: number; // Total reviews recorded in past archived months
}

export interface BusinessInvite {
  id: string;
  email: string;
  tempPass: string; // e.g. "TAP-8942"
  status: 'pending' | 'completed' | 'expired';
  notes?: string;
  restaurantId?: string;
  restaurantSlug?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AdminAuthSession {
  restaurantId: string;
  slug: string;
  phone: string;
  email?: string;
  name: string;
}

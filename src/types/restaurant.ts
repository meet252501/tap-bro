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
  menuCategories: DishCategory[];
  aiProvider: AIProviderType;
  customApiKey?: string;
  totalReviewsGenerated: number;
  tableCount?: number;
  createdAt: string;
  updatedAt: string;
  reviewsLog?: DinerReviewRecord[];
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

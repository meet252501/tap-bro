export interface ExperienceRatings {
  food?: number; // 1-5
  service?: number; // 1-5
  ambiance?: number; // 1-5
  overall?: number; // 1-5
}

export type ReviewLanguage = 'en' | 'hinglish';

export type ReviewTone = 'flavorful' | 'concise' | 'hospitality' | 'constructive';

export type GenderGrammar = 'neutral' | 'masculine' | 'feminine';

export interface ReviewDraftRequest {
  locale: ReviewLanguage;
  tone: ReviewTone;
  genderGrammar?: GenderGrammar;
  ratings: ExperienceRatings;
  selectedDishes: string[];
  customerNotes?: string;
  restaurantName?: string;
}

export interface ReviewDraftResponse {
  draft: string;
  locale: ReviewLanguage;
  source: 'ai' | 'fallback';
}

export interface DishCategory {
  name: string;
  icon: string;
  items: string[];
}

export interface RestaurantConfig {
  name: string;
  tagline: string;
  cuisine: string;
  location: string;
  googleReviewUrl: string;
  menuCategories: DishCategory[];
}

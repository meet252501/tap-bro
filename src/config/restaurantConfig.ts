import { RestaurantConfig } from '@/types/review';

export const DEFAULT_RESTAURANT_CONFIG: RestaurantConfig = {
  name: 'Saffron & Spice Bistro',
  tagline: 'Artisanal Indian Cuisine & Heritage Chaat House',
  cuisine: 'North Indian & Chaat Bistro',
  location: 'Civil Lines, Varanasi / Central Avenue',
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
  menuCategories: [
    {
      name: 'Signature Chaat & Starters',
      icon: '🍲',
      items: [
        'Banarasi Tamatar Chaat',
        'Crispy Palak Patta Chaat',
        'Stuffed Dahi Puri / Golgappe',
        'Aloo Tikki with Chutney',
        'Dahi Bhalla Papdi',
        'Paneer Tikka Angara',
      ],
    },
    {
      name: 'Royal Mains & Curries',
      icon: '🍛',
      items: [
        'Dal Makhani (Slow Cooked)',
        'Paneer Butter Masala',
        'Smoked Veg Dum Biryani',
        'Kadhai Paneer',
        'Amritsari Chole',
        'Malai Kofta',
      ],
    },
    {
      name: 'Tandoori Breads & Rice',
      icon: '🫓',
      items: [
        'Garlic Butter Naan',
        'Laccha Paratha',
        'Tandoori Butter Roti',
        'Jeera Rice',
      ],
    },
    {
      name: 'Desserts & Refreshers',
      icon: '🍧',
      items: [
        'Hot Gulab Jamun with Rabri',
        'Royal Kesar Kulfi',
        'Thandai Delight',
        'Mango Lassi',
        'Kulhad Masala Chai',
      ],
    },
  ],
};

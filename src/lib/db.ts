import fs from 'fs';
import path from 'path';
import { Restaurant, BusinessInvite } from '@/types/restaurant';

export function getDataFilePath(filename: string): string {
  const standardPath = path.join(process.cwd(), 'data', filename);
  // In serverless environments like Vercel / AWS Lambda, use /tmp which is writable
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpPath = path.join('/tmp', 'tapbro-data', filename);
    if (!fs.existsSync(tmpPath)) {
      try {
        fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
        if (fs.existsSync(standardPath)) {
          fs.copyFileSync(standardPath, tmpPath);
        }
      } catch {}
    }
    return tmpPath;
  }
  return standardPath;
}

const DATA_FILE = getDataFilePath('restaurants.json');
const INVITES_FILE = getDataFilePath('invites.json');
const CONFIG_FILE = getDataFilePath('superadmin-config.json');

export interface SuperAdminConfig {
  superAdminEmail: string;
  superAdminPassword: string;
  emailProvider?: 'resend' | 'brevo' | 'sendgrid' | 'smtp';
  resendApiKey?: string;
  resendFrom?: string;
  brevoApiKey?: string;
  brevoFromEmail?: string;
  brevoFromName?: string;
  sendgridApiKey?: string;
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure?: boolean;
  };
  updatedAt?: string;
}

export function getSuperAdminConfig(): SuperAdminConfig {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (data && data.superAdminPassword) {
        return data;
      }
    } catch (e) {
      // fallback
    }
  }

  const fallback: SuperAdminConfig = {
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'princesharma9955a@gmail.com',
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'prince@777',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || 'princesharma9955a@gmail.com',
      pass: process.env.SMTP_PASS || 'prince@777',
      from: process.env.SMTP_FROM || 'Tap-Bro Team <princesharma9955a@gmail.com>',
      secure: false,
    },
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
  } catch {}

  return fallback;
}

export function saveSuperAdminConfig(cfg: SuperAdminConfig): boolean {
  try {
    fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save super admin config:', err);
    return false;
  }
}

export function updateSuperAdminPassword(newPassword: string): boolean {
  const cfg = getSuperAdminConfig();
  cfg.superAdminPassword = newPassword.trim();
  cfg.updatedAt = new Date().toISOString();
  return saveSuperAdminConfig(cfg);
}

export function updateSuperAdminEmailConfig(data: Partial<SuperAdminConfig>): boolean {
  const cfg = getSuperAdminConfig();
  if (data.emailProvider) cfg.emailProvider = data.emailProvider;
  if (data.resendApiKey !== undefined) cfg.resendApiKey = data.resendApiKey.trim();
  if (data.resendFrom !== undefined) cfg.resendFrom = data.resendFrom.trim();
  if (data.brevoApiKey !== undefined) cfg.brevoApiKey = data.brevoApiKey.trim();
  if (data.brevoFromEmail !== undefined) cfg.brevoFromEmail = data.brevoFromEmail.trim();
  if (data.brevoFromName !== undefined) cfg.brevoFromName = data.brevoFromName.trim();
  if (data.sendgridApiKey !== undefined) cfg.sendgridApiKey = data.sendgridApiKey.trim();
  if (data.smtp) {
    cfg.smtp = {
      host: data.smtp.host?.trim() || 'smtp.gmail.com',
      port: Number(data.smtp.port) || 587,
      user: data.smtp.user?.trim() || cfg.superAdminEmail,
      pass: data.smtp.pass?.trim() || '',
      from: data.smtp.from?.trim() || `Tap-Bro Team <${cfg.superAdminEmail}>`,
      secure: data.smtp.secure || Number(data.smtp.port) === 465,
    };
  }
  cfg.updatedAt = new Date().toISOString();
  return saveSuperAdminConfig(cfg);
}

export function updateSuperAdminSMTP(smtpData: {
  host: string;
  port: number;
  user: string;
  pass: string;
  from?: string;
  secure?: boolean;
}): boolean {
  const cfg = getSuperAdminConfig();
  cfg.smtp = {
    host: smtpData.host.trim(),
    port: Number(smtpData.port) || 587,
    user: smtpData.user.trim(),
    pass: smtpData.pass.trim(),
    from: smtpData.from?.trim() || `Tap-Bro Team <${smtpData.user.trim()}>`,
    secure: smtpData.secure || Number(smtpData.port) === 465,
  };
  cfg.updatedAt = new Date().toISOString();
  return saveSuperAdminConfig(cfg);
}

const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'REST_SAFFRON_01',
    slug: 'saffron-spice',
    name: 'Saffron & Spice Bistro',
    tagline: 'Artisanal Indian Cuisine & Heritage Chaat House',
    cuisine: 'North Indian & Chaat Bistro',
    location: 'Civil Lines, Central Varanasi',
    phone: '9876543210',
    email: 'contact@saffronspice.com',
    adminPin: '1234',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    aiProvider: 'nvidia',
    totalReviewsGenerated: 42,
    tableCount: 15,
    createdAt: '2026-11-18T10:00:00.000Z',
    updatedAt: '2026-11-18T10:00:00.000Z',
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
  },
  {
    id: 'REST_ROYAL_02',
    slug: 'royal-chaat',
    name: 'Royal Banarasi Chaat & Sweets',
    tagline: 'Authentic Kashi Delicacies & Pure Ghee Mithai',
    cuisine: 'Street Food, Chaat & Mithai',
    location: 'Godowlia Chowk, Varanasi',
    phone: '9876500000',
    email: 'royalchaat@gmail.com',
    adminPin: '5678',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    aiProvider: 'nvidia',
    totalReviewsGenerated: 19,
    tableCount: 10,
    createdAt: '2026-11-18T10:00:00.000Z',
    updatedAt: '2026-11-18T10:00:00.000Z',
    menuCategories: [
      {
        name: 'Famous Chaat',
        icon: '🥘',
        items: ['Special Tamatar Chaat', 'Palak Chaat', 'Golgappa Pani Puri', 'Matar Tikki'],
      },
      {
        name: 'Heritage Sweets',
        icon: '🍯',
        items: ['Malaiyo (Winter Special)', 'Kheer Mohan', 'Gulab Jamun', 'Rasmalai'],
      },
      {
        name: 'Beverages',
        icon: '☕',
        items: ['Masala Kulhad Chai', 'Kesar Thandai', 'Sweet Lassi'],
      },
    ],
  },
];

function ensureFile(): void {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function ensureInvitesFile(): void {
  if (!fs.existsSync(INVITES_FILE)) {
    fs.mkdirSync(path.dirname(INVITES_FILE), { recursive: true });
    fs.writeFileSync(INVITES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllRestaurants(): Restaurant[] {
  ensureFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) as Restaurant[];
  } catch (err) {
    console.error('Error reading restaurants file:', err);
    return INITIAL_RESTAURANTS;
  }
}

export function getRestaurantBySlug(slug: string): Restaurant | null {
  const list = getAllRestaurants();
  const found = list.find((r) => r.slug.toLowerCase() === slug.toLowerCase());
  if (found) return found;
  if (slug.toLowerCase() === 'saffron-spice' && INITIAL_RESTAURANTS.length > 0) {
    return INITIAL_RESTAURANTS[0];
  }
  return null;
}

export function getRestaurantById(id: string): Restaurant | null {
  const list = getAllRestaurants();
  return list.find((r) => r.id === id) || null;
}

export function authenticateAdmin(phoneOrEmail: string, pinOrId: string): Restaurant | null {
  const cleanInput = phoneOrEmail.trim().toLowerCase();
  const cleanPhone = phoneOrEmail.replace(/\D/g, '');
  const list = getAllRestaurants();

  return (
    list.find((r) => {
      const matchPhone = cleanPhone && r.phone.replace(/\D/g, '') === cleanPhone;
      const matchEmail = r.email && r.email.toLowerCase() === cleanInput;
      const matchPin = r.adminPin === pinOrId.trim() || r.id === pinOrId.trim();
      return (matchPhone || matchEmail) && matchPin;
    }) || null
  );
}

export function authenticateSuperAdmin(email: string, pinOrPass: string): boolean {
  const cfg = getSuperAdminConfig();
  const superAdminEmail = (cfg.superAdminEmail || process.env.SUPER_ADMIN_EMAIL || 'princesharma9955a@gmail.com').toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  const inputPass = pinOrPass.trim();

  const currentPass = cfg.superAdminPassword?.trim() || 'prince@777';
  const envPass = process.env.SUPER_ADMIN_PASSWORD?.trim() || 'prince@777';

  // Support current active password, hard-saved 'prince@777', and legacy pins for fallback
  const validPins = [currentPass, envPass, 'prince@777', '9955', 'admin123', 'tapbro2026', 'prince9955'];

  return cleanEmail === superAdminEmail && validPins.includes(inputPass);
}

export function saveRestaurant(updated: Restaurant): boolean {
  ensureFile();
  const list = getAllRestaurants();
  const index = list.findIndex((r) => r.id === updated.id);

  if (index >= 0) {
    list[index] = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
  } else {
    list.push({
      ...updated,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving restaurant:', err);
    return false;
  }
}

export function deleteRestaurant(id: string): boolean {
  ensureFile();
  const list = getAllRestaurants();
  const filtered = list.filter((r) => r.id !== id && r.slug !== id);
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export function createRestaurant(data: {
  name: string;
  phone: string;
  adminPin: string;
  email?: string;
  cuisine?: string;
  tagline?: string;
  location?: string;
  tableCount?: number;
  googleReviewUrl?: string;
  customDishes?: string[];
}): Restaurant {
  const cleanName = data.name.trim();
  const baseSlug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let slug = baseSlug || 'restaurant';
  let counter = 1;
  while (getRestaurantBySlug(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const id = `REST_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const cleanCustomDishes = Array.isArray(data.customDishes)
    ? data.customDishes
        .filter((d): d is string => typeof d === 'string')
        .map((d) => d.trim())
        .filter((d) => d.length > 0)
    : [];

  const defaultMenuCategories = [
    {
      name: 'Starters & Chaat',
      icon: '🍲',
      items: ['Crispy Veg Spring Roll', 'Paneer Tikka', 'Crispy Corn Chaat'],
    },
    {
      name: 'Main Courses',
      icon: '🍛',
      items: ['Dal Makhani', 'Paneer Butter Masala', 'Butter Garlic Naan'],
    },
    {
      name: 'Desserts & Beverages',
      icon: '🍧',
      items: ['Hot Gulab Jamun', 'Masala Kulhad Chai', 'Fresh Mango Lassi'],
    },
  ];

  const menuCategories = cleanCustomDishes.length > 0
    ? [
        {
          name: 'House Specialties',
          icon: '⭐',
          items: cleanCustomDishes,
        },
        ...defaultMenuCategories.slice(0, 2),
      ]
    : defaultMenuCategories;

  const newRest: Restaurant = {
    id,
    slug,
    name: cleanName,
    tagline: data.tagline?.trim() || 'Delicious Dining & Hospitality',
    cuisine: data.cuisine?.trim() || 'Multi-Cuisine Restaurant',
    location: data.location?.trim() || '',
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    adminPin: data.adminPin.trim() || '1234',
    googleReviewUrl:
      data.googleReviewUrl?.trim() ||
      'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    aiProvider: 'nvidia',
    totalReviewsGenerated: 0,
    tableCount: data.tableCount || 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    menuCategories,
  };

  saveRestaurant(newRest);
  return newRest;
}

export function incrementReviewCount(slug: string): void {
  const rest = getRestaurantBySlug(slug);
  if (rest) {
    rest.totalReviewsGenerated = (rest.totalReviewsGenerated || 0) + 1;
    saveRestaurant(rest);
  }
}

// ----------------- INVITE MANAGEMENT (Super Admin) -----------------

export function getAllInvites(): BusinessInvite[] {
  ensureInvitesFile();
  try {
    return JSON.parse(fs.readFileSync(INVITES_FILE, 'utf-8')) as BusinessInvite[];
  } catch {
    return [];
  }
}

export function createBusinessInvite(email: string, notes?: string): BusinessInvite {
  ensureInvitesFile();
  const list = getAllInvites();
  const cleanEmail = email.trim().toLowerCase();

  // Invalidate/remove any previous pending invites for this email to avoid conflicting codes
  const filteredList = list.filter(
    (inv) => !(inv.email.toLowerCase() === cleanEmail && inv.status === 'pending')
  );

  // Generate a friendly 4-digit temporary password, e.g. "TAP-7492"
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const tempPass = `TAP-${randNum}`;

  const invite: BusinessInvite = {
    id: `INV_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    email: cleanEmail,
    tempPass,
    status: 'pending',
    notes: notes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  filteredList.unshift(invite);
  fs.writeFileSync(INVITES_FILE, JSON.stringify(filteredList, null, 2), 'utf-8');
  return invite;
}

export function getInviteByEmailAndTempPass(email: string, tempPass: string): BusinessInvite | null {
  const list = getAllInvites();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = tempPass.trim().toUpperCase();

  return (
    list.find(
      (inv) =>
        inv.email.toLowerCase() === cleanEmail &&
        inv.tempPass.toUpperCase() === cleanPass &&
        inv.status === 'pending'
    ) || null
  );
}

export function markInviteCompleted(inviteId: string, restaurantId: string, restaurantSlug: string) {
  ensureInvitesFile();
  const list = getAllInvites();
  const index = list.findIndex((i) => i.id === inviteId);

  if (index >= 0) {
    list[index].status = 'completed';
    list[index].restaurantId = restaurantId;
    list[index].restaurantSlug = restaurantSlug;
    list[index].completedAt = new Date().toISOString();
    fs.writeFileSync(INVITES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  }
}

export function deleteInvite(inviteId: string): boolean {
  ensureInvitesFile();
  const list = getAllInvites();
  const filtered = list.filter((i) => i.id !== inviteId);
  try {
    fs.writeFileSync(INVITES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

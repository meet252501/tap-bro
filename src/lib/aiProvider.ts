import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ReviewDraftRequest,
  ReviewDraftResponse,
  MultiReviewDrafts,
  MultiToneDrafts,
  ReviewTone,
} from '@/types/review';
import { AIProviderType } from '@/types/restaurant';

/**
 * High-variety Zero-Cost Linguistic Engine.
 * Supports all 4 tones: flavorful, concise, hospitality, constructive across English & Hinglish.
 * 100% free, unlimited, no token fees, instant latency (<1ms).
 */
export function generateZeroCostReview(req: ReviewDraftRequest): string {
  const { locale, tone, ratings, selectedDishes, customerNotes, restaurantName = 'The Restaurant' } = req;
  const isHinglish = locale === 'hinglish';

  const food = ratings.food ?? 0;
  const service = ratings.service ?? 0;
  const ambiance = ratings.ambiance ?? 0;
  const overall = ratings.overall ?? (Math.round((food + service + ambiance) / 3) || 4);

  const dishes = selectedDishes.length > 0 ? selectedDishes.join(', ') : '';
  const notes = customerNotes ? customerNotes.trim() : '';

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  if (isHinglish) {
    if (overall >= 4) {
      if (tone === 'concise') {
        const shortDishes = dishes ? ` ${dishes} bohot badhiya tha.` : '';
        return `${restaurantName} me visit karke bohot maza aaya.${shortDishes} Fast service and top quality. Highly recommended!`;
      }

      if (tone === 'hospitality') {
        const staffPraise = service >= 4
          ? 'Staff ka behavior bohot warm aur polite tha, unhone har cheez ka dhyan rakha.'
          : 'Staff attentive tha aur unki hospitality bohot pasand aayi.';
        const shortDishes = dishes ? ` Khane me ${dishes} bhi lajawab tha.` : '';
        return `${restaurantName} ki hospitality sach me dil jeetne wali hai. ${staffPraise}${shortDishes} Family ke sath dining ke liye perfect spot hai.`;
      }

      if (tone === 'constructive') {
        const foodPart = dishes ? `${dishes} ka taste bohot achha tha.` : 'Food quality overall kaafi achhi thi.';
        const notePart = service > 0 && service <= 3
          ? 'Bas peak hours me service thodi si fast ho sakti hai.'
          : 'Thoda seating management aur behtar ho jaye toh 10/10 experience banega.';
        return `${restaurantName} ka experience pleasant raha. ${foodPart} ${notePart} Definite recommendation for food lovers!`;
      }

      // Default: 'flavorful'
      const openings = [
        `${restaurantName} me khana khane ka experience sach me shandar raha.`,
        `Aaj ${restaurantName} me visit kiya aur bohot accha laga.`,
        `${restaurantName} ka dining experience bohot memorable raha.`,
      ];
      const foodPraise = dishes
        ? [
            `Humne ${dishes} order kiya tha aur taste ekdum lajawab tha.`,
            `${dishes} ka flavor aur freshness bohot pasand aayi.`,
            `Khane me ${dishes} try kiya, har bite me authentic swad tha.`,
          ]
        : [`Yahan ka khana bohot tasty aur fresh serve kiya gaya.`];

      const servicePraise =
        service >= 4
          ? [
              `Staff ka behavior polite tha aur service bhi time par mili.`,
              `Hospitality aur service bohot warm aur attentive thi.`,
            ]
          : service > 0 && service <= 2
          ? [`Khana achha tha par service thodi slow lagi, jisme improvement ho sakti hai.`]
          : [];

      const closures = [
        `Overall family aur friends ke sath aane ke liye best jagah hai.`,
        `Shandar experience, we will definitely recommend it!`,
      ];

      return [
        pick(openings),
        pick(foodPraise),
        servicePraise.length > 0 ? pick(servicePraise) : '',
        notes ? `${notes}.` : '',
        pick(closures),
      ]
        .filter(Boolean)
        .join(' ');
    } else if (overall <= 2) {
      if (tone === 'concise') {
        const dishesPart = dishes ? ` ${dishes} was disappointing.` : '';
        return `Visited ${restaurantName} but service and food didn't meet expectations.${dishesPart} Management needs to review quality.`;
      }
      return [
        `${restaurantName} me visit karke hamari expectation meet nahi hui.`,
        dishes ? `Humne ${dishes} try kiya par taste theek nahi tha.` : '',
        service > 0 && service <= 2 ? `Service kaafi slow aur unorganized thi.` : '',
        notes ? `${notes}.` : '',
        `Umeed hai management quality aur service par dhyan dekar improvement karega.`,
      ]
        .filter(Boolean)
        .join(' ');
    } else {
      return [
        `${restaurantName} me hamara visit average raha.`,
        dishes ? `${dishes} ka taste theek-thaak tha.` : '',
        service >= 4
          ? `Staff cooperative tha.`
          : service > 0 && service <= 2
          ? `Service me thoda time laga.`
          : '',
        notes ? `${notes}.` : '',
        `Kuch cheezein achhi thi par consistency me thoda improvement expected hai.`,
      ]
        .filter(Boolean)
        .join(' ');
    }
  }

  // English generator
  if (overall >= 4) {
    if (tone === 'concise') {
      const dishesPart = dishes ? ` The ${dishes} was super fresh and tasty.` : '';
      return `Great experience at ${restaurantName}!${dishesPart} Attentive staff and nice ambiance. Definitely coming back!`;
    }

    if (tone === 'hospitality') {
      const dishesPart = dishes ? ` Paired with the delicious ${dishes}, our visit was truly memorable.` : '';
      return `Outstanding hospitality at ${restaurantName}! From the moment we walked in, the staff made us feel warmly welcomed and looked after every detail.${dishesPart} Exemplary customer service!`;
    }

    if (tone === 'constructive') {
      const dishesPart = dishes ? `The food, especially the ${dishes}, was thoroughly enjoyable.` : 'The culinary spread was delightful.';
      const constructivePart = service > 0 && service <= 3
        ? 'Service was polite though a little slow during peak rush.'
        : 'A bit of fine-tuning on order pacing would make it a flawless 5-star experience.';
      return `Had a pleasant visit to ${restaurantName}. ${dishesPart} ${constructivePart} Still well worth a visit and recommended!`;
    }

    // Default: 'flavorful'
    const openings = [
      `Had a wonderful dining experience at ${restaurantName}.`,
      `Really enjoyed our recent visit to ${restaurantName}.`,
      `Had a great meal with family at ${restaurantName}.`,
    ];

    const foodPraise = dishes
      ? [
          `We ordered the ${dishes}, and the taste and presentation were exceptional.`,
          `The ${dishes} stood out with great authenticity and rich flavors.`,
          `Tried the ${dishes}; everything tasted fresh and well-seasoned.`,
        ]
      : [`The food was prepared fresh and tasted delicious.`];

    const serviceFeedback =
      service >= 4
        ? [
            `The staff was warm, attentive, and made us feel welcome.`,
            `Prompt service and courteous hospitality throughout our visit.`,
          ]
        : service > 0 && service <= 2
        ? [`The food was enjoyable, though the service was noticeably slow.`]
        : [];

    const closures = [
      `Overall a pleasant dining experience and well worth recommending!`,
      `Looking forward to visiting again.`,
    ];

    return [
      pick(openings),
      pick(foodPraise),
      serviceFeedback.length > 0 ? pick(serviceFeedback) : '',
      notes ? `${notes}.` : '',
      pick(closures),
    ]
      .filter(Boolean)
      .join(' ');
  } else if (overall <= 2) {
    return [
      `Visited ${restaurantName}, but unfortunately the experience fell below expectations.`,
      dishes ? `We tried the ${dishes}, but the flavor and preparation were lacking.` : '',
      service > 0 && service <= 2 ? `The service was delayed and uncoordinated.` : '',
      notes ? `${notes}.` : '',
      `Sharing this feedback constructively so management can make necessary improvements.`,
    ]
      .filter(Boolean)
      .join(' ');
  } else {
    return [
      `An average dining visit to ${restaurantName}.`,
      dishes ? `We ordered the ${dishes}; the taste was decent but not particularly memorable.` : '',
      service >= 4 ? `The staff was polite and responsive.` : '',
      notes ? `${notes}.` : '',
      `An okay meal overall with scope for improvement in taste consistency.`,
    ]
      .filter(Boolean)
      .join(' ');
  }
}

/**
 * Generate a complete multi-tone, multi-language bundle zero-cost in <1ms.
 */
export function generateZeroCostReviewBundle(req: ReviewDraftRequest): MultiReviewDrafts {
  const tones: ReviewTone[] = ['flavorful', 'concise', 'hospitality', 'constructive'];

  const en: Record<string, string> = {};
  const hinglish: Record<string, string> = {};

  for (const t of tones) {
    en[t] = generateZeroCostReview({ ...req, locale: 'en', tone: t });
    hinglish[t] = generateZeroCostReview({ ...req, locale: 'hinglish', tone: t });
  }

  return {
    en: en as unknown as MultiToneDrafts,
    hinglish: hinglish as unknown as MultiToneDrafts,
  };
}

/**
 * Single-call batch generation with NVIDIA NIM.
 * Asks the AI for both English & Hinglish across all 4 tones in one structured JSON payload.
 */
async function callNvidiaAIBundle(req: ReviewDraftRequest, apiKey: string): Promise<MultiReviewDrafts | null> {
  const modelName = process.env.NVIDIA_MODEL || 'minimaxai/minimax-m3.1-flash';

  const dishes = req.selectedDishes.length > 0 ? req.selectedDishes.join(', ') : 'None specified';
  const notes = req.customerNotes ? req.customerNotes.trim() : 'None';
  const ratingsSummary = [
    req.ratings.food ? `Food: ${req.ratings.food}/5` : null,
    req.ratings.service ? `Service: ${req.ratings.service}/5` : null,
    req.ratings.ambiance ? `Ambiance: ${req.ratings.ambiance}/5` : null,
    req.ratings.overall ? `Overall: ${req.ratings.overall}/5` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const systemInstruction = `You are Tap-Bro's polite AI review assistant for restaurant diners.
Generate realistic, first-person Google Review drafts (2-3 sentences each) based on the diner's actual meal.

RESTAURANT NAME: ${req.restaurantName || 'The Restaurant'}
RATINGS: ${ratingsSummary}
DISHES ORDERED & TRIED: ${dishes}
DINER NOTES: ${notes}

Generate a strictly valid JSON object containing 8 review variations:
- "en": English reviews across 4 tones ("flavorful", "concise", "hospitality", "constructive")
- "hinglish": Conversational Romanized Hindi/Hinglish reviews across the same 4 tones

TONE DEFINITIONS:
- flavorful: Highlights mouth-watering taste, culinary flavors, and textures of the dishes.
- concise: Punchy, short 2 sentences, quick read.
- hospitality: Highlights the warm welcome, polite staff, and hospitable service.
- constructive: Balanced and honest; points out positives while kindly noting areas for improvement if ratings were low.

RULES:
1. ONLY mention the dishes listed above. DO NOT invent unlisted items.
2. Return ONLY raw JSON in the exact schema below. No markdown fences, no commentary.

SCHEMA:
{
  "en": {
    "flavorful": "...",
    "concise": "...",
    "hospitality": "...",
    "constructive": "..."
  },
  "hinglish": {
    "flavorful": "...",
    "concise": "...",
    "hospitality": "...",
    "constructive": "..."
  }
}`;

  const payload = {
    model: modelName,
    messages: [
      { role: 'user', content: systemInstruction },
    ],
    max_tokens: 1200,
    temperature: 0.4,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout to keep diner UI ultra snappy

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`NVIDIA NIM API responded with ${response.status}:`, errText);
      return null;
    }

    const json = await response.json();
    let text = json.choices?.[0]?.message?.content?.trim();
    if (!text) return null;

    // Remove markdown code blocks if AI wrapped them
    if (text.includes('```json')) {
      text = text.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
    } else if (text.includes('```')) {
      text = text.replace(/```\s*/g, '').trim();
    }

    const parsed = JSON.parse(text);
    if (parsed.en?.flavorful && parsed.hinglish?.flavorful) {
      return parsed as MultiReviewDrafts;
    }
    return null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('NVIDIA NIM single-call batch error or timeout:', err.message);
    return null;
  }
}

/**
 * Universal AI Caller supporting Single-Call All Tones & Languages.
 * Always returns the active draft AND the full pre-generated bundle!
 */
export async function generateUniversalReview(
  req: ReviewDraftRequest,
  provider: AIProviderType = 'nvidia',
  customKey?: string
): Promise<ReviewDraftResponse> {
  const fallbackBundle = generateZeroCostReviewBundle(req);
  const activeLocale = req.locale === 'hinglish' ? 'hinglish' : 'en';
  const activeTone = req.tone || 'flavorful';

  // 1. Check NVIDIA NIM
  const nvidiaKey =
    customKey?.startsWith('nvapi-')
      ? customKey
      : process.env.NVIDIA_API_KEY || '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';

  if ((provider === 'nvidia' || !provider) && nvidiaKey) {
    try {
      const aiBundle = await callNvidiaAIBundle(req, nvidiaKey);
      if (aiBundle) {
        const activeDraft =
          aiBundle[activeLocale]?.[activeTone] ||
          fallbackBundle[activeLocale][activeTone];

        return {
          draft: activeDraft,
          drafts: aiBundle,
          locale: req.locale,
          source: 'ai',
        };
      }
    } catch (err) {
      console.warn('NVIDIA NIM call failed, proceeding to instant zero-cost fallback:', err);
    }
  }

  // 2. Guaranteed Zero-Cost Engine Fallback (Instant <1ms)
  return {
    draft: fallbackBundle[activeLocale][activeTone],
    drafts: fallbackBundle,
    locale: req.locale,
    source: 'fallback',
  };
}

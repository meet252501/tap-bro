import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReviewDraftRequest, ReviewDraftResponse } from '@/types/review';
import { AIProviderType } from '@/types/restaurant';

/**
 * High-variety Zero-Cost Linguistic Engine.
 * 100% free, unlimited, no token fees, instant latency (<5ms).
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
      `Visited ${restaurantName}, but unfortunately the experience was disappointing.`,
      dishes ? `We tried the ${dishes}, but the taste fell below expectations.` : '',
      service > 0 && service <= 2 ? `The service was delayed and disorganized.` : '',
      notes ? `${notes}.` : '',
      `Sharing this feedback constructively so the team can work on improvements.`,
    ]
      .filter(Boolean)
      .join(' ');
  } else {
    return [
      `An average dining experience at ${restaurantName}.`,
      dishes ? `We ordered the ${dishes}; the taste was decent but not memorable.` : '',
      service >= 4 ? `The service was polite and responsive.` : '',
      notes ? `${notes}.` : '',
      `An okay visit with room for improvement in overall consistency.`,
    ]
      .filter(Boolean)
      .join(' ');
  }
}

/**
 * Call NVIDIA NIM API with user's provided key.
 */
async function callNvidiaAI(req: ReviewDraftRequest, apiKey: string): Promise<string | null> {
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
Convert the diner's actual meal details into a natural, first-person Google Review draft (2-3 sentences).

RESTAURANT NAME: ${req.restaurantName || 'The Restaurant'}
RATINGS: ${ratingsSummary}
DISHES ORDERED & TRIED: ${dishes}
DINER NOTES: ${notes}
TARGET LANGUAGE: ${req.locale === 'hinglish' ? 'Hinglish (conversational Romanized Hindi, e.g. "Taste bohot achha tha, especially Dal Makhani ekdum lajawab thi")' : 'English'}
TONE DESIRED: ${req.tone}

RULES:
1. ONLY mention the dishes listed above. DO NOT invent unlisted items.
2. If rating is low (1 or 2 stars), reflect constructive disappointment without false praise.
3. No quotation marks around output.
4. Output ONLY the drafted review text.`;

  const payload = {
    model: modelName,
    messages: [
      { role: 'user', content: systemInstruction },
    ],
    max_tokens: 1024,
    temperature: 0.5,
  };

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.warn(`NVIDIA NIM API responded with ${response.status}:`, errText);
    return null;
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content?.trim();
  return text ? text.replace(/^["']|["']$/g, '') : null;
}

/**
 * Universal AI Caller supporting NVIDIA NIM, Gemini, Groq, and Zero-Cost.
 */
export async function generateUniversalReview(
  req: ReviewDraftRequest,
  provider: AIProviderType = 'nvidia',
  customKey?: string
): Promise<ReviewDraftResponse> {
  // 1. Check NVIDIA NIM (Enabled by default with user's key)
  const nvidiaKey =
    customKey?.startsWith('nvapi-')
      ? customKey
      : process.env.NVIDIA_API_KEY || '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';

  if ((provider === 'nvidia' || !provider) && nvidiaKey) {
    try {
      const draft = await callNvidiaAI(req, nvidiaKey);
      if (draft) {
        return {
          draft,
          locale: req.locale,
          source: 'ai',
        };
      }
    } catch (err) {
      console.warn('NVIDIA NIM call failed, proceeding to fallback:', err);
    }
  }

  // 2. Check Gemini Free Tier
  const geminiKey =
    customKey && !customKey.startsWith('nvapi-')
      ? customKey
      : process.env.GEMINI_API_KEY;

  if (provider === 'free-gemini' && geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 250,
        },
      });

      const dishes = req.selectedDishes.length > 0 ? req.selectedDishes.join(', ') : 'None specified';
      const prompt = `Write a first-person review for ${req.restaurantName || 'The Restaurant'}. Dishes tried: ${dishes}. Ratings: overall ${req.ratings.overall || 4}/5. Language: ${req.locale === 'hinglish' ? 'Hinglish' : 'English'}. No quotes. 2-3 sentences.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim().replace(/^["']|["']$/g, '');
      if (text) {
        return {
          draft: text,
          locale: req.locale,
          source: 'ai',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed:', err);
    }
  }

  // 3. Guaranteed Zero-Cost Engine Fallback
  return {
    draft: generateZeroCostReview(req),
    locale: req.locale,
    source: 'fallback',
  };
}

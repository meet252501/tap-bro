import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReviewDraftRequest, ReviewDraftResponse } from '@/types/review';

/**
 * Deterministic fallback generator adhering strictly to the PRD guardrails:
 * - Reflects genuine ratings (positive, mixed, or negative)
 * - Mentions only the selected dishes
 * - Incorporates customer notes without inventing unmentioned facts
 * - Supports English and authentic Hinglish
 */
export function generateDeterministicFallback(req: ReviewDraftRequest): string {
  const { locale, tone, ratings, selectedDishes, customerNotes, restaurantName = 'Saffron & Spice Bistro' } = req;
  const isHinglish = locale === 'hinglish';
  
  const food = ratings.food ?? 0;
  const service = ratings.service ?? 0;
  const ambiance = ratings.ambiance ?? 0;
  const overall = ratings.overall ?? (Math.round((food + service + ambiance) / 3) || 4);

  const dishList = selectedDishes.length > 0 ? selectedDishes.join(', ') : '';
  const notes = customerNotes ? customerNotes.trim() : '';

  // Tone variations
  if (isHinglish) {
    if (overall >= 4) {
      let draft = `${restaurantName} me visit karke bohot achha laga. `;
      if (dishList) {
        if (food >= 4) {
          draft += `Humne ${dishList} try kiya aur swad sach me lajawab tha. `;
        } else {
          draft += `Humne ${dishList} order kiya tha. `;
        }
      }
      if (service >= 4) {
        draft += `Staff ka behavior aur service bhi kafi polite aur prompt rahi. `;
      } else if (service > 0 && service <= 2) {
        draft += `Lekin service thodi slow thi jisme improvement ki gunjaish hai. `;
      }
      if (ambiance >= 4) {
        draft += `Ambiance bhi family ke sath aane ke liye kafi pleasant tha. `;
      }
      if (notes) {
        draft += `${notes}. `;
      }
      draft += `Overall ek pleasant experience raha.`;
      return draft.trim();
    } else if (overall <= 2) {
      let draft = `${restaurantName} me hamara experience average se kam raha. `;
      if (dishList) {
        draft += `Humne ${dishList} try kiya, par swad hamare expectation ke hisab se theek nahi tha. `;
      }
      if (service > 0 && service <= 2) {
        draft += `Service bhi kaafi slow thi aur staff coordination better ho sakta hai. `;
      }
      if (notes) {
        draft += `${notes}. `;
      }
      draft += `Umeed hai management is par dhyan dekar improvement karega.`;
      return draft.trim();
    } else {
      // Mixed (3 stars)
      let draft = `${restaurantName} me hamara visit theek-thaak raha. `;
      if (dishList) {
        draft += `Hamne ${dishList} try kiya—taste theek tha. `;
      }
      if (service >= 4) {
        draft += `Service achhi aur cooperative thi. `;
      } else if (service > 0 && service <= 2) {
        draft += `Service thodi slow lagi. `;
      }
      if (notes) {
        draft += `${notes}. `;
      }
      draft += `Kuch cheezein achhi thi par thoda improvement expected hai.`;
      return draft.trim();
    }
  }

  // English generator
  if (overall >= 4) {
    let draft = `Had a really pleasant dining experience at ${restaurantName}. `;
    if (dishList) {
      if (food >= 4) {
        draft += `We tried the ${dishList}, and the flavors were spot on. `;
      } else {
        draft += `We had the ${dishList}. `;
      }
    }
    if (service >= 4) {
      draft += `The staff was attentive, warm, and helpful throughout our meal. `;
    } else if (service > 0 && service <= 2) {
      draft += `While the food was enjoyable, the service was noticeably slow and could use improvement. `;
    }
    if (ambiance >= 4) {
      draft += `The ambiance was clean, comfortable, and inviting. `;
    }
    if (notes) {
      draft += `${notes}. `;
    }
    draft += `Overall, a wonderful visit and well worth recommendation.`;
    return draft.trim();
  } else if (overall <= 2) {
    let draft = `Visited ${restaurantName}, but the experience fell short of our expectations. `;
    if (dishList) {
      draft += `We ordered the ${dishList}, but the taste and preparation were disappointing. `;
    }
    if (service > 0 && service <= 2) {
      draft += `The service was slow and could have been much more organized. `;
    }
    if (notes) {
      draft += `${notes}. `;
    }
    draft += `Sharing this feedback in hopes that management can address these areas.`;
    return draft.trim();
  } else {
    // 3 stars (Mixed)
    let draft = `A mixed experience at ${restaurantName}. `;
    if (dishList) {
      draft += `We ordered ${dishList}; the taste was decent but not particularly memorable. `;
    }
    if (service >= 4) {
      draft += `On the positive side, the staff was polite and helpful. `;
    } else if (service > 0 && service <= 2) {
      draft += `Service took longer than expected during our meal. `;
    }
    if (notes) {
      draft += `${notes}. `;
    }
    draft += `An okay visit, with room for improvement in consistency.`;
    return draft.trim();
  }
}

/**
 * Server-side AI Draft Generator using Google Gemini.
 * Follows strict constraints:
 * - Only uses provided user facts
 * - Never hallucinates unselected dishes or unstated impressions
 * - Respects negative and mixed ratings accurately
 */
export async function generateReviewWithAI(req: ReviewDraftRequest): Promise<ReviewDraftResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    // Graceful fallback when API key is not configured
    return {
      draft: generateDeterministicFallback(req),
      locale: req.locale,
      source: 'fallback',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 250,
      },
    });

    const isHinglish = req.locale === 'hinglish';
    const dishes = req.selectedDishes.length > 0 ? req.selectedDishes.join(', ') : 'None specified';
    const notes = req.customerNotes ? req.customerNotes.trim() : 'None provided';
    const ratingsSummary = [
      req.ratings.food ? `Food/Taste: ${req.ratings.food}/5` : null,
      req.ratings.service ? `Service/Hospitality: ${req.ratings.service}/5` : null,
      req.ratings.ambiance ? `Ambiance: ${req.ratings.ambiance}/5` : null,
      req.ratings.overall ? `Overall: ${req.ratings.overall}/5` : null,
    ].filter(Boolean).join(', ') || 'No explicit rating numbers provided';

    const prompt = `You are a respectful writing assistant for restaurant diners writing their own honest Google review draft.
Convert the customer's actual dining details into a natural, first-person review draft (2-4 sentences).

RESTAURANT NAME: ${req.restaurantName || 'Saffron & Spice Bistro'}
RATINGS PROVIDED: ${ratingsSummary}
DISHES ORDERED & TRIED: ${dishes}
ADDITIONAL CUSTOMER NOTES: ${notes}
TARGET LANGUAGE: ${isHinglish ? 'Hinglish (natural Romanized Hindi mixed with conversational English, e.g. "Taste bohot achha tha, staff polite tha")' : 'English'}
TONE DESIRED: ${req.tone}
GENDER GRAMMAR: ${req.genderGrammar || 'neutral'}

CRITICAL INTEGRITY RULES:
1. ONLY mention the dishes listed above. DO NOT invent or assume any dish that is not listed.
2. DO NOT fabricate compliments if ratings are low. If a rating is 1 or 2 stars, reflect constructive, respectful disappointment.
3. If ratings are mixed (e.g. food 5 but service 2), balance both honestly (praise the food, note the slow service).
4. Do NOT use quotation marks around the review.
5. Do NOT include star emojis or placeholders.
6. Write naturally as the customer themselves.
7. Return ONLY the drafted review text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text()?.trim();

    if (!responseText) {
      throw new Error('Empty AI response');
    }

    // Clean up any extraneous quotes or markdown
    const cleanedDraft = responseText.replace(/^["']|["']$/g, '').trim();

    return {
      draft: cleanedDraft,
      locale: req.locale,
      source: 'ai',
    };
  } catch (error) {
    console.error('Gemini API draft generation failed; falling back to deterministic generator:', error);
    return {
      draft: generateDeterministicFallback(req),
      locale: req.locale,
      source: 'fallback',
    };
  }
}

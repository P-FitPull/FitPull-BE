/* eslint-disable no-unused-vars */
import {
  findProductByIdRepo,
  getAllProductsRepo,
} from '../repositories/product.repository.js';
import {
  saveAiPriceEstimation,
  saveAiProductRecommendation,
  getRecentAiPriceEstimations,
} from '../repositories/ai.repository.js';
import { getReviewsByProductIdRepo } from '../repositories/review.repository.js';
import CustomError from '../utils/customError.js';
import { AI_MESSAGES } from '../constants/messages.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//이미지 인식용 테스트용 프롬프트
// - 그리고 이미지에 보이는 특징(색상, 브랜드, 상태 등)을 한 문장으로 reason에 포함해줘

// 백그라운드에서 AI 가격 추정을 처리하는 함수
const processAiPriceEstimation = async ({ productId, adminUser }) => {
  try {
    const product = await findProductByIdRepo(productId);
    if (!product) {
      throw new CustomError(
        404,
        'PRODUCT_NOT_FOUND',
        AI_MESSAGES.PRODUCT_NOT_FOUND,
      );
    }
    if (product.status !== 'PENDING') {
      throw new CustomError(
        400,
        'INVALID_PRODUCT_STATUS',
        AI_MESSAGES.INVALID_PRODUCT_STATUS,
      );
    }

    const { title, description, price, imageUrls } = product;

    // 이미지 URL 검증
    const validImageUrl =
      imageUrls?.length > 0 && imageUrls[0]?.startsWith('http')
        ? imageUrls[0]
        : null;

    const prompt = `
You are an expert rental price analyst specializing in the Korean market. Your task is to analyze product information and estimate both the average used market price and an appropriate daily rental price based on current market conditions.

## Product Information
- Product Name: ${title}
- Description: ${description ?? 'No description'}
- User's suggested daily rental price: ${price ?? 'Not provided'}
${validImageUrl ? '- Image is attached. Please analyze considering the visual characteristics as well.' : '- No image available. Analyze based on product name and description only.'}

## Analysis Guidelines

### 1. Market Price Estimation
- Research and estimate used market prices for each platform:
  * Coupang (쿠팡): Major e-commerce platform, focus on used goods section
  * Danggeun Market (당근마켓): Local marketplace, often lower prices
  * Junggonara (중고나라): Traditional used goods platform
- Consider product condition, age, and market demand
- Use realistic price ranges based on current market trends
- Calculate and provide the average used market price as 'estimatedPrice'.

### 2. Daily Rental Price Calculation
- Base calculation: 1-5% of the average market price (estimatedPrice)
- Adjust based on factors:
  * High-value items (>500,000 KRW): 0.5-2% of market price
  * Mid-value items (100,000-500,000 KRW): 1-3% of market price
  * Low-value items (<100,000 KRW): 2-5% of market price
- Consider rental duration flexibility and demand patterns
- Calculate and provide the daily rental price as 'estimatedDailyRentalPrice'.

### 3. Risk Assessment Factors
- Product fragility and damage potential
- Market demand and seasonal trends
- Availability of similar products
- Brand reputation and reliability
- Maintenance requirements

### 4. Price Validation
- Compare user's suggested price with calculated estimate
- Mark as invalid if user's price is more than 50% higher than estimatedDailyRentalPrice
- Mark as valid if user's price is 70% or less of estimatedDailyRentalPrice (good deal for renters)
- Consider market volatility and acceptable price ranges

### 5. Response Requirements
- Provide specific, actionable reasoning
- Include market context in explanation
- Ensure all numerical values are integers
- Maintain consistency in pricing logic
- **Always include the user's suggested price, the AI's estimated daily rental price, and the estimated used market price in your explanation. Clearly state whether the user's price is appropriate, too high, or too low compared to the AI's estimate.**
- **Example: "유저가 제시한 가격 7,000원은 AI가 산출한 1일 대여 적정가 5,000원보다 40% 높아 적정가보다 비쌉니다."**

## Output Format
Respond ONLY in the following JSON format:

{
  "estimatedPrice": integer, // AI가 판단한 중고 시세(평균)
  "estimatedDailyRentalPrice": integer, // 위 시세를 기반으로 계산한 1일 대여 적정가
  "sources": {
    "쿠팡": integer,
    "당근마켓": integer,
    "중고나라": integer
  },
  "isValid": true/false,
  "reason": "한국어로 유저 가격의 적정성에 대한 구체적이고 명확한 설명 (시장 상황, 가격 비교, 추천 근거 포함)"
}

## Important Notes
- All prices should be in Korean Won (KRW)
- Daily rental price should be reasonable for both owner and renter
- Consider the competitive rental market in Korea
- Provide detailed reasoning for price validation decisions
    `;

    // 멀티모달 메시지 구성
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...(validImageUrl
            ? [{ type: 'image_url', image_url: { url: validImageUrl } }]
            : []),
        ],
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    const contentRaw = completion.choices[0].message.content;

    // AI가 거부하는 경우 처리
    if (
      contentRaw.includes("I'm sorry") ||
      contentRaw.includes("can't assist") ||
      contentRaw.includes('I cannot')
    ) {
      throw new CustomError(400, 'AI_REJECTED', AI_MESSAGES.AI_REJECTED);
    }

    let content = contentRaw;

    // JSON 블록 추출 (```json ... ``` 또는 ``` ... ```)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1].trim();
    } else {
      // JSON 블록이 없으면 전체 내용에서 JSON 부분만 추출
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        content = content.substring(jsonStart, jsonEnd + 1);
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      throw new CustomError(
        500,
        'AI_JSON_BLOCK_NOT_FOUND',
        AI_MESSAGES.AI_JSON_BLOCK_NOT_FOUND,
      );
    }

    // 필수 필드 검증
    if (
      !parsed.estimatedPrice ||
      !parsed.estimatedDailyRentalPrice ||
      !parsed.sources ||
      typeof parsed.isValid !== 'boolean' ||
      !parsed.reason
    ) {
      throw new CustomError(
        500,
        'AI_INVALID_RESPONSE',
        AI_MESSAGES.AI_INVALID_RESPONSE,
      );
    }

    // AI 응답에서 필요한 필드만 추출
    const {
      estimatedPrice,
      estimatedDailyRentalPrice,
      sources,
      isValid,
      reason,
    } = parsed;

    // 필요한 필드만 명시적으로 전달
    const estimationData = {
      estimatedDailyRentalPrice,
      estimatedPrice,
      sources: sources || {},
      isValid: isValid || false,
      reason: reason || '',
      productId,
      userId: adminUser.id,
    };

    await saveAiPriceEstimation(estimationData);
    console.log('AI price estimation completed for product:', productId);
  } catch (error) {
    // CustomError가 아니면 래핑해서 throw
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(
        500,
        'AI_PROCESSING_ERROR',
        AI_MESSAGES.AI_PROCESSING_ERROR,
      );
    }
  }
};

export const requestAiPriceEstimation = async ({ productId, adminUser }) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new CustomError(
      404,
      'PRODUCT_NOT_FOUND',
      AI_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }
  if (product.status !== 'PENDING') {
    throw new CustomError(
      400,
      'INVALID_PRODUCT_STATUS',
      AI_MESSAGES.INVALID_PRODUCT_STATUS,
    );
  }

  // 백그라운드에서 AI 가격 추정 시작
  processAiPriceEstimation({ productId, adminUser }).catch((error) => {
    console.error('Background AI processing error:', error);
  });

  return {
    productId,
    status: 'processing',
  };
};

export const summarizeReviews = async (productId) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new CustomError(
      404,
      'PRODUCT_NOT_FOUND',
      AI_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }
  const reviews = await getReviewsByProductIdRepo(productId);
  const contents = reviews.map((review) => review.comment).join('\n');
  if (!contents) {
    throw new CustomError(
      404,
      'REVIEW_NOT_FOUND',
      AI_MESSAGES.REVIEW_NOT_FOUND,
    );
  }
  const prompt = `
  다음은 어떤 상품에 대한 리뷰들입니다. 전체적인 내용을 한국어로 간결히 요약해주세요.
  ---
  ${contents}
  요약결과:
  `;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });
  return { summary: completion.choices[0].message.content };
};

export const recommendProducts = async ({ prompt, userId }) => {
  if (!prompt) {
    throw new CustomError(400, 'PROMPT_REQUIRED', AI_MESSAGES.PROMPT_REQUIRED);
  }
  const { products } = await getAllProductsRepo({ take: 20 });
  if (products.length === 0) {
    throw new CustomError(404, 'NO_PRODUCTS', AI_MESSAGES.NO_PRODUCTS);
  }
  const itemsText = products
    .map((product, idx) => {
      return `${idx + 1}. [ID: ${product.id}] ${product.title} - ${product.description ?? '설명 없음'}`;
    })
    .join('\n');
  const gptPrompt = `
You are an expert product recommendation assistant specializing in rental services. Your task is to analyze user requests and recommend the most suitable products from the available inventory.

## Available Products
Below is a comprehensive list of rental products available in our system:
${itemsText}

## User Request Analysis
Request: "${prompt}"

## Recommendation Guidelines

### 1. Relevance Assessment
- Analyze the user's specific needs and preferences
- Consider product category, features, and use cases
- Match request keywords with product descriptions
- Prioritize products that directly address the user's requirements

### 2. Quality and Reliability
- Consider product condition and reliability
- Factor in brand reputation and user reviews
- Assess rental history and availability
- Prioritize products with good track records

### 3. Value Proposition
- Consider price-to-value ratio
- Assess competitive advantages of each product
- Factor in rental duration flexibility
- Consider seasonal demand and availability

### 4. Selection Criteria
- Maximum 3 recommendations to avoid choice paralysis
- Ensure diversity in recommendations when possible
- Consider different price points if applicable
- Focus on products that best match the request

### 5. Response Quality
- Provide specific, actionable reasoning for each recommendation
- Include relevant product features that match the request
- Consider user's potential use case and requirements
- Ensure recommendations are practical and realistic

## Output Requirements
- Return exactly 3 products or empty array if no suitable matches
- Use exact product IDs from the provided list
- Provide detailed reasoning in Korean language
- Focus on user benefits and practical advantages

## Output Format
Respond ONLY in the following JSON format:

[
  { 
    "id": "exact_product_id", 
    "reason": "한국어로 구체적이고 명확한 추천 이유 (제품 특징, 사용자 요청과의 연관성, 실용적 장점 포함)" 
  },
  ...
]

If no suitable products match the request, return: []
`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: gptPrompt }],
    temperature: 0.5,
  });
  const content = completion.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
  } catch (err) {
    throw new CustomError(500, 'AI_PARSE_ERROR', AI_MESSAGES.AI_PARSE_ERROR);
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return {
      recommendedProductIds: [],
      reason: '추천할 만한 상품이 없습니다.',
    };
  }
  const recommendedProductIds = parsed.map((item) => item.id);
  const reason = parsed.map((item) => `- ${item.reason}`).join('\n');
  await saveAiProductRecommendation({
    prompt,
    recommendedProducts: recommendedProductIds,
    recommendReason: reason,
    userId: userId ?? null,
  });
  return { recommendedProductIds, reason };
};

export const getRecentPriceEstimations = async ({ take = 20, skip = 0 }) => {
  const estimations = await getRecentAiPriceEstimations({ take, skip });

  // 각 상품별로 최신 결과만 필터링
  const productMap = new Map();

  estimations.forEach((estimation) => {
    const productId = estimation.productId;

    // 이미 해당 상품의 결과가 있으면 더 최신 것만 유지
    if (
      !productMap.has(productId) ||
      productMap.get(productId).createdAt < estimation.createdAt
    ) {
      productMap.set(productId, estimation);
    }
  });

  // Map의 값들을 배열로 변환하고 시간순 정렬
  const uniqueEstimations = Array.from(productMap.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, take);

  return {
    estimations: uniqueEstimations.map((estimation) => ({
      id: estimation.id,
      productId: estimation.productId,
      productTitle: estimation.product.title,
      estimatedPrice: estimation.estimatedPrice,
      estimatedDailyRentalPrice: estimation.estimatedDailyRentalPrice,
      userPrice: estimation.product.price,
      isValid: estimation.isValid,
      reason: estimation.reason,
      sources: estimation.sources,
      createdAt: estimation.createdAt,
    })),
  };
};

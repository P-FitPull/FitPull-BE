/* eslint-disable no-unused-vars */
import {
  findProductByIdRepo,
  getAllProductsRepo,
} from '../repositories/product.repository.js';
import {
  saveAiPriceEstimation,
  saveAiProductRecommendation,
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
      console.error(`Product not found: ${productId}`);
      return;
    }
    if (product.status !== 'PENDING') {
      console.error(`Invalid product status: ${product.status}`);
      return;
    }

    const { title, description, price, imageUrls } = product;

    // 이미지 URL 검증
    const validImageUrl =
      imageUrls?.length > 0 && imageUrls[0]?.startsWith('http')
        ? imageUrls[0]
        : null;

    const prompt = `
당신은 대여 가격 전문가입니다. 주어진 상품 정보를 바탕으로 적정한 대여 가격을 추정해주세요.

상품 정보:
- 상품명: ${title}
- 설명: ${description ?? '설명 없음'}
- 유저가 입력한 1일 대여 가격: ${price ?? '입력 없음'}
${validImageUrl ? '- 이미지가 첨부되어 있습니다. 이미지도 참고하여 분석해주세요.' : '- 이미지가 없으므로 상품명과 설명만으로 분석해주세요.'}

다음 기준에 따라 분석해주세요:
1. 쿠팡, 당근마켓, 중고나라의 중고 판매 가격을 각각 추정
2. 세 플랫폼의 평균 가격을 기준으로 1일 대여 적정가 계산 (일반적으로 1~5% 수준)
3. 제품의 파손 위험, 시장 수요, 대체재 여부 등을 고려하여 유연하게 판단
4. 유저가 제시한 가격이 적정가 대비 20% 이상 차이날 경우 부적절하다고 판단

반드시 아래 JSON 형식으로만 응답해주세요:

{
  "dailyRentalPrice": 정수,
  "sources": {
    "쿠팡": 정수,
    "당근마켓": 정수,
    "중고나라": 정수
  },
  "isValid": true/false,
  "reason": "유저 가격의 적정성에 대한 한 문장 설명"
}
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
      console.error('AI rejected request for product:', productId);
      return;
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
      console.error(
        'AI parse error for product:',
        productId,
        'Response:',
        contentRaw,
      );
      return;
    }

    // 필수 필드 검증
    if (
      !parsed.dailyRentalPrice ||
      !parsed.sources ||
      typeof parsed.isValid !== 'boolean' ||
      !parsed.reason
    ) {
      console.error(
        'AI invalid response for product:',
        productId,
        'Response:',
        contentRaw,
      );
      return;
    }

    // AI 응답에서 필요한 필드만 추출
    const { dailyRentalPrice, sources, isValid, reason } = parsed;

    // 필요한 필드만 명시적으로 전달
    const estimationData = {
      estimatedDailyRentalPrice: dailyRentalPrice,
      estimatedPrice: dailyRentalPrice,
      sources: sources || {},
      isValid: isValid || false,
      reason: reason || '',
      productId,
      userId: adminUser.id,
    };

    await saveAiPriceEstimation(estimationData);
    console.log('AI price estimation completed for product:', productId);
  } catch (error) {
    console.error(
      'AI price estimation failed for product:',
      productId,
      'Error:',
      error.message,
    );
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
    message: AI_MESSAGES.PRICE_ESTIMATION_STARTED,
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
당신은 상품 추천 도우미입니다.

아래는 대여 가능한 상품 목록입니다.
각 상품은 ID, 제목, 설명으로 구성되어 있습니다.

--- 상품 목록 ---
${itemsText}

--- 사용자 요청 ---
"${prompt}"

위 요청에 맞게 적절한 상품 3개를 추천해 주세요.
단, 정말로 적합한 상품이 없다면 빈 배열([])로만 응답하세요.

추천할 때는 상품의 ID를 기준으로 출력하고, 간단한 추천 이유도 함께 작성하세요.

출력 형식 (JSON만 반환):
[
  { "id": "상품ID", "reason": "추천 이유" },
  ...
]
적합한 상품이 없으면 [] 만 반환
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

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

export const estimatePriceFromAI = async (product) => {
  const { title, description, price, imageUrls } = product;
  const prompt = `
너는 대여 가격 전문가야.

다음 상품의 이름, 설명, 유저가 입력한 1일 대여 가격, 그리고 이미지를 기반으로
1) 중고가 기준 1일 대여 적정가를 추정하고,
2) 유저가 입력한 가격이 적정한지 true/false로 판단하고,
3) 이유를 한 문장으로 설명해줘.

다음 기준을 따르도록 해:
- 쿠팡, 당근마켓, 중고나라의 중고 판매 가격을 각기 추정해줘 , 이걸 기반으로 너가 판단하는 적정가는 얼마인지도 적어줘
- 이 세 개의 평균 가격을 기준으로 1일 대여가는 일반적으로 1~5% 수준이 적정하다고 생각해
- 단, 제품의 파손 위험, 시장 수요, 대체재 여부 등을 고려해 적정가를 유연하게 판단해도 돼
- 유저가 제시한 가격이 적정가 대비 20% 이상 차이 날 경우 부적절하다고 판단해
- 최종적으로 왜 true/false 인지 이유도 간결하게 말해줘

응답은 반드시 아래 형식의 JSON으로만 해줘:

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

상품명: ${title}
설명: ${description ?? '설명 없음'}
유저가 입력한 1일 대여 가격: ${price ?? '입력 없음'}
  `;

  // 멀티모달 메시지 구성
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        ...(imageUrls?.length
          ? [{ type: 'image_url', image_url: { url: imageUrls[0] } }]
          : []),
      ],
    },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.3,
  });
  const contentRaw = completion.choices[0].message.content;
  let content = contentRaw;
  if (content.startsWith('```')) {
    content = content
      .replace(/```[a-zA-Z]*\n?/, '')
      .replace(/```/, '')
      .trim();
  }
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new CustomError(
      500,
      'AI_PARSE_ERROR',
      `AI 응답을 파싱하는 데 실패했습니다. 실제 응답: ${contentRaw}`,
    );
  }
  return parsed;
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
  const result = await estimatePriceFromAI(product);
  const { dailyRentalPrice, sources, isValid, reason, ...rest } = result;
  await saveAiPriceEstimation({
    ...rest,
    estimatedDailyRentalPrice: dailyRentalPrice,
    estimatedPrice: dailyRentalPrice,
    sources,
    isValid,
    reason,
    productId,
    userId: adminUser.id,
  });
  return result;
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
    .map((p, idx) => {
      return `${idx + 1}. [ID: ${p.id}] ${p.title} - ${p.description ?? '설명 없음'}`;
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

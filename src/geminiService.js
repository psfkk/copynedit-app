import { GoogleGenerativeAI } from "@google/generative-ai";

// 🚨 여기에 자신의 Gemini API 키를 입력하세요.
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// base64 형식의 이미지 데이터를 파일 객체로 변환하는 도우미 함수
function dataURItoFile(dataURI, fileName) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], fileName, { type: mimeString });
}

/**
 * Gemini AI를 호출하여 위성 이미지를 민화 스타일로 변환하는 함수
 * @param {string} image - base64로 인코딩된 위성 이미지 데이터
 * @returns {Promise<string>} - base64로 인코딩된 민화 이미지 데이터
 */
export async function generateMinhwaPainting(imageBase64) {
  // 최신 Gemini 이미지 모델을 사용합니다.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 🖼️ AI에게 보낼 이미지 파일 부분
  const imageFile = dataURItoFile(imageBase64, "satellite-image.png");

  // ✍️ AI에게 보낼 텍스트 명령어 (프롬프트)
  // 이 부분이 결과물의 스타일을 결정합니다!
  const prompt = `
    Analyze this satellite image of a building and its surroundings.
    Transform it into a beautiful piece of art in the style of traditional Korean folk painting (Minhwa).
    Key characteristics to apply:
    - Use a vibrant, rich, and bold color palette.
    - Employ strong, clear outlines for buildings and natural elements.
    - Adopt a flattened, 2D perspective, ignoring realistic depth.
    - Stylize natural elements like trees, mountains, and water in a classic Minhwa fashion.
    The final result should be an artistic interpretation, not a literal one.
    Output only the image.
  `;

  try {
    // 이미지와 텍스트를 함께 AI에 전송
    const result = await model.generateContent([prompt, imageFile]);
    const response = result.response;

    // AI가 생성한 이미지 데이터를 base64로 다시 변환하여 반환
    const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
    if (!imagePart) {
      throw new Error("AI did not return an image.");
    }
    const base64Result = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    return base64Result;

  } catch (error) {
    console.error("Error generating Minhwa painting:", error);
    throw new Error("Failed to communicate with the AI to create the painting.");
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

async function test() {
  console.log(`Debug - API Key exists: ${!!GEMINI_KEY}`);
  console.log(`Debug - Key starts with: ${GEMINI_KEY.substring(0, 5)}...`);
  console.log(`Debug - Model from env: ${process.env.GEMINI_MODEL}`);
  console.log(`Debug - Using model: ${modelName}`);
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hola, responde solo 'OK' si recibes esto.");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (e: any) {
    console.error("Error testing Gemini:", e.message);
  }
}

test();

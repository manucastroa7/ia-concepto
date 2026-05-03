import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();
const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

async function test() {
  console.log(`Testing Gemini with model: ${modelName}`);
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hola, responde solo 'CONEXION EXITOSA' si recibes esto.");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (e: any) {
    console.error("Error testing Gemini:", e.message);
  }
}

test();

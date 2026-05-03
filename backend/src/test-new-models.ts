import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();

async function testNewModels() {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  
  const modelsToTest = ["gemini-2.0-flash-001", "gemini-flash-latest", "gemini-2.5-flash"];

  for (const m of modelsToTest) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("test");
      console.log(`Success with ${m}!`);
      break;
    } catch (e: any) {
      console.error(`Error with ${m}:`, e.message);
    }
  }
}

testNewModels();

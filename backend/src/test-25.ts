import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();

async function test25() {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  try {
    console.log(`Testing gemini-2.5-flash...`);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("test");
    console.log(`Success with gemini-2.5-flash!`);
  } catch (e: any) {
    console.error(`Error with gemini-2.5-flash:`, e.message);
  }
}

test25();

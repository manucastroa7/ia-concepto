import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();

async function listModels() {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  try {
    // There is no direct listModels in the SDK for some versions, 
    // but we can try to get a model and see if it fails differently.
    console.log("Testing with gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with flash!");
  } catch (e: any) {
    console.error("Error with flash:", e.message);
    
    try {
        console.log("Testing with gemini-pro (legacy name)...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        await model.generateContent("test");
        console.log("Success with gemini-pro!");
    } catch (e2: any) {
        console.error("Error with gemini-pro:", e2.message);
    }
  }
}

listModels();

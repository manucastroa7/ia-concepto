import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();

async function testV1() {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  try {
    console.log("Testing gemini-1.5-flash with v1...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    const result = await model.generateContent("test");
    console.log("Success with v1!");
  } catch (e: any) {
    console.error("Error with v1:", e.message);
  }

  try {
    console.log("Testing gemini-2.0-flash with v1...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: "v1" });
    const result = await model.generateContent("test");
    console.log("Success with 2.0 and v1!");
  } catch (e: any) {
    console.error("Error with 2.0 and v1:", e.message);
  }
}

testV1();

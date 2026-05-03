import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();

async function checkModels() {
  try {
    console.log("Checking models via REST API (v1beta)...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`;
    const response = await axios.get(url);
    console.log("Available models (v1beta):");
    response.data.models.forEach((m: any) => {
      console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(", ")})`);
    });
  } catch (e: any) {
    console.error("Error checking models:", e.response?.data || e.message);
  }
}

checkModels();

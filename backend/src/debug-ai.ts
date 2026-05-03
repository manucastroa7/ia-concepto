import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const key = (process.env.GEMINI_API_KEY || "").trim();
console.log("Testing with API Key (first 5 chars):", key.substring(0, 5) + "...");

const genAI = new GoogleGenerativeAI(key);

async function debug() {
  try {
    console.log("Attempting to list models...");
    // Note: listModels might not be available in all SDK versions, 
    // but we can try a simple generateContent with the most basic model.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hola, responde con la palabra 'OK' si me escuchas.");
    const response = await result.response;
    console.log("Success! AI Response:", response.text());
  } catch (error: any) {
    console.error("FAILED!");
    console.error("Status Code:", error.status);
    console.error("Message:", error.message);
    if (error.status === 404) {
      console.log("\n--- AYUDA ---");
      console.log("El error 404 indica que el modelo no se encuentra o el API está mal configurada.");
      console.log("1. Verifica que en Google Cloud tengas activada la 'Generative Language API'.");
      console.log("2. Asegúrate de que tu API Key no tenga espacios extra.");
      console.log("3. Intenta crear una llave nueva en https://aistudio.google.com/ que es más directo.");
    }
  }
}

debug();

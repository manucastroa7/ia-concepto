import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

type OpenAIInputContent =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail: "auto" }
  | { type: "input_file"; filename: string; file_data: string };

export class OpenAIService {
  private get apiKey() {
    const key = (process.env.OPENAI_API_KEY || "").trim();
    if (!key) throw new Error("No OPENAI_API_KEY configured");
    return key;
  }

  private get model() {
    return process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async generateText(prompt: string): Promise<string> {
    return this.createResponse([{ type: "input_text", text: prompt }]);
  }

  async generateFromImage(prompt: string, fileBase64: string, mimeType: string): Promise<string> {
    const fileContent = this.buildFileContent(fileBase64, mimeType);
    return this.createResponse([{ type: "input_text", text: prompt }, fileContent]);
  }

  private buildFileContent(fileBase64: string, mimeType: string): OpenAIInputContent {
    const dataUrl = `data:${mimeType};base64,${fileBase64}`;

    if (mimeType.startsWith("image/")) {
      return { type: "input_image", image_url: dataUrl, detail: "auto" };
    }

    return {
      type: "input_file",
      filename: this.filenameForMimeType(mimeType),
      file_data: dataUrl,
    };
  }

  private filenameForMimeType(mimeType: string) {
    if (mimeType === "application/pdf") return "input.pdf";
    if (mimeType.includes("wordprocessingml.document")) return "input.docx";
    if (mimeType === "text/plain") return "input.txt";
    return "input-file";
  }

  private async createResponse(content: OpenAIInputContent[]): Promise<string> {
    const payload = {
      model: this.model,
      input: [{ role: "user", content }],
      temperature: 0.2,
    };

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    let response;
    let lastError: any;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await axios.post("https://api.openai.com/v1/responses", payload, { headers });
        break;
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;
        const code = error.response?.data?.error?.code;
        const message = error.response?.data?.error?.message || error.message;

        if (status === 429 && code === "insufficient_quota") {
          throw new Error("OpenAI rechazo la solicitud por cuota o billing agotado. Revisa el saldo, billing y limites del proyecto en OpenAI.");
        }

        if (status === 429 && attempt < 2) {
          const retryAfter = Number(error.response?.headers?.["retry-after"]);
          const waitMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 1000 * Math.pow(2, attempt);
          console.warn(`OpenAI rate limit. Reintentando en ${waitMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }

        throw new Error(`OpenAI error${status ? ` ${status}` : ""}: ${message}`);
      }
    }

    if (!response) throw lastError;

    const text = response.data?.output_text || this.extractOutputText(response.data);
    if (!text) throw new Error("OpenAI no devolvio contenido");
    return text;
  }

  private extractOutputText(data: any): string {
    const output = data?.output || [];
    const chunks: string[] = [];

    for (const item of output) {
      for (const content of item?.content || []) {
        if (content?.type === "output_text" && content?.text) {
          chunks.push(content.text);
        }
      }
    }

    return chunks.join("\n").trim();
  }
}

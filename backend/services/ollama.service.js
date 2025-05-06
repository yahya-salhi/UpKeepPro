import axios from "axios";
import ISO21001Service from "./iso21001.service.js";

const OLLAMA_API_URL = "http://localhost:11434/api";
const MAX_RETRIES = 2;
const TIMEOUT_MS = 15000;
const RETRY_DELAY_MS = 1000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ollamaAxios = axios.create({
  baseURL: OLLAMA_API_URL,
  timeout: TIMEOUT_MS,
});

export const ollamaService = {
  async generateResponse(prompt, retryCount = 0) {
    try {
      // Validate if query is ISO21001 related
      const validation = ISO21001Service.validateQuery(prompt);

      // If not relevant, return redirection message
      if (!validation.isRelevant && !validation.isGreeting) {
        return ISO21001Service.formatResponse("", validation);
      }

      // Enhance prompt with ISO21001 context
      const enhancedPrompt = ISO21001Service.enhancePrompt(prompt, validation);

      const response = await ollamaAxios.post("/generate", {
        model: "tinyllama",
        prompt: enhancedPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 250,
        },
      });

      // Format and validate the response
      const formattedResponse = ISO21001Service.formatResponse(
        response.data.response,
        validation
      );

      return formattedResponse;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(
          `Attempt ${retryCount + 1} failed, retrying in ${RETRY_DELAY_MS}ms...`
        );
        await delay(RETRY_DELAY_MS);
        return this.generateResponse(prompt, retryCount + 1);
      }

      throw new Error(
        error.code === "ECONNABORTED"
          ? "Response timeout - The AI model is taking too long to respond"
          : "Failed to generate AI response"
      );
    }
  },

  async checkHealth() {
    try {
      const response = await ollamaAxios.get("/version");
      return true;
    } catch (error) {
      console.error("Ollama health check failed:", error);
      return false;
    }
  },
};

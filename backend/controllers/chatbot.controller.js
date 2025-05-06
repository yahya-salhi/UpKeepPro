import axios from "axios";
import { ollamaService } from "../services/ollama.service.js";
import ISO21001Service from "../services/iso21001.service.js";

/**
 * Send message to chatbot and get AI response
 * @route POST /api/chat/send-message
 */
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Validate if query is ISO21001 related
    const validation = ISO21001Service.validateQuery(message);

    // Get response from AI
    const aiResponse = await ollamaService.generateResponse(message);

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        meta: {
          isISO21001Related: validation.isRelevant,
          confidence: validation.confidence,
          categories: validation.categories,
          isGreeting: validation.isGreeting,
        },
      },
    });
  } catch (error) {
    console.error("Chat error:", error);

    const isTimeout = error.message.includes("timeout");

    res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: error.message,
      error: error.message,
      meta: {
        isTimeout,
        retryable: true,
      },
    });
  }
};

/**
 * Get chat history
 * @route GET /api/chat/history
 */
export const getChatHistory = async (req, res) => {
  // As per ISO21001 & GDPR requirements, we don't store chat history
  res.status(200).json({
    success: true,
    data: {
      history: [],
    },
  });
};

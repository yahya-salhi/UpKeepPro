import axios from "axios";
import { ollamaService } from "../services/ollama.service.js";
import ISO21001Service from "../services/iso21001.service.js";
import UserQueryService from "../services/userQuery.service.js";

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

    // Check if this is a user data query
    const isUserDataQuery = UserQueryService.isUserDataQuery(message);
    let aiResponse;
    let userDataContext = null;
    let validation = {
      isRelevant: false,
      confidence: 0,
      categories: [],
      isGreeting: false,
    };

    if (isUserDataQuery) {
      // Handle user data query directly without ISO21001 processing
      const parsedQuery = UserQueryService.parseUserQuestion(message);
      const queryResult = await UserQueryService.executeUserQuery(parsedQuery);

      // Generate a direct, human-readable response for user data
      aiResponse = UserQueryService.generateDirectResponse(
        message,
        queryResult
      );
      userDataContext = queryResult;
    } else {
      // Handle ISO21001 queries with the existing system
      validation = ISO21001Service.validateQuery(message);
      aiResponse = await ollamaService.generateResponse(message);
    }

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        meta: {
          isISO21001Related: validation.isRelevant,
          confidence: validation.confidence,
          categories: validation.categories,
          isGreeting: validation.isGreeting,
          isUserDataQuery,
          userDataContext,
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

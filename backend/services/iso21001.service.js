// ISO21001 Educational Management System Knowledge Base
const ISO21001_KEYWORDS = {
  core: [
    "iso21001",
    "iso 21001",
    "eoms",
    "educational organization",
    "management system",
    "quality management",
  ],
  principles: [
    "learner-focused",
    "leadership",
    "engagement",
    "process approach",
    "improvement",
    "evidence-based",
    "relationship management",
  ],
  topics: [
    "educational quality",
    "learning outcomes",
    "student satisfaction",
    "teaching effectiveness",
    "curriculum development",
    "assessment",
    "educational objectives",
    "learning resources",
    "competence development",
  ],
  requirements: [
    "compliance",
    "certification",
    "audit",
    "documentation",
    "policy",
    "objectives",
    "planning",
    "support",
    "operation",
    "performance evaluation",
    "improvement",
  ],
};

const ISO21001_CONTEXT = {
  introduction: `As an ISO21001 Educational Management System Specialist, I provide guidance specifically focused on:
- Educational Organizations Management Systems (EOMS)
- Quality management in educational context
- Learning service delivery standards
- Educational process improvement`,

  redirectionMessage: `I specialize in ISO21001 Educational Management Systems. I can help you with:
1. Understanding ISO21001 requirements
2. Implementing educational quality management
3. Improving learning service delivery
4. Educational organization compliance
5. Enhancing learner satisfaction
6. Developing effective educational processes
7. Assessing educational outcomes
8. Supporting continuous improvement in educational organizations
9. Engaging stakeholders in educational quality management
10. Aligning educational objectives with ISO21001 standards
11. Best practices for educational organizations
12. Training and development for educational staff
13. Documentation and record-keeping for ISO21001 compliance

Would you like to know more about any of these ISO21001-related topics?`,

  greetingResponse: `Hello! I'm your ISO21001 Educational Management System Specialist. I can help you understand and implement ISO21001 standards for educational organizations. What would you like to know about educational quality management?`,
};

class ISO21001Service {
  /**
   * Validates if the query is related to ISO21001
   * @param {string} query - User's input query
   * @returns {Object} Validation result with category and relevance score
   */
  static validateQuery(query) {
    const lowerQuery = query.toLowerCase();
    let relevanceScore = 0;
    let matchedCategories = new Set();

    // Check all keyword categories
    for (const [category, keywords] of Object.entries(ISO21001_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          relevanceScore += 1;
          matchedCategories.add(category);
        }
      }
    }

    // Handle greetings separately
    const greetings = ["hello", "hi", "hey", "greetings"];
    const isGreeting = greetings.some((greeting) =>
      lowerQuery.includes(greeting)
    );

    return {
      isRelevant: relevanceScore > 0 || isGreeting,
      isGreeting: isGreeting,
      relevanceScore: relevanceScore,
      categories: Array.from(matchedCategories),
      confidence: Math.min(relevanceScore / 3, 1), // Normalize confidence score
    };
  }

  /**
   * Formats the response to maintain ISO21001 focus
   * @param {string} response - Raw AI response
   * @param {Object} validation - Validation result
   * @returns {string} Formatted response
   */
  static formatResponse(response, validation) {
    if (validation.isGreeting && validation.relevanceScore === 0) {
      return ISO21001_CONTEXT.greetingResponse;
    }

    if (!validation.isRelevant) {
      return ISO21001_CONTEXT.redirectionMessage;
    }

    // Format response with ISO21001 context if needed
    return response;
  }

  /**
   * Enhances the prompt with ISO21001 context
   * @param {string} query - User's input query
   * @param {Object} validation - Validation result
   * @returns {string} Enhanced prompt
   */
  static enhancePrompt(query, validation) {
    const contextualPrompt = `${ISO21001_CONTEXT.introduction}

Context: You are responding as an ISO21001 Educational Management System Specialist.
Focus Areas: ${validation.categories.join(", ") || "General ISO21001 guidance"}
Query: ${query}

Provide a professional response following ISO21001 principles and guidelines:`;

    return contextualPrompt;
  }
}

export default ISO21001Service;

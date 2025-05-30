import User from "../models/user.modal.js";

/**
 * Service for parsing user questions and querying MongoDB for user data
 */
class UserQueryService {
  /**
   * Parse user question to extract query intent and parameters
   * @param {string} question - User's question
   * @returns {Object} Parsed query information
   */
  static parseUserQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    // Define comprehensive query patterns with professional intents
    const queryPatterns = {
      // Basic user statistics
      userCount: {
        patterns: [
          /how many users?/i,
          /user count/i,
          /number of users/i,
          /total users/i,
          /count users/i,
          /users in.*app/i,
          /users are there/i,
          /user statistics/i,
          /overall user count/i,
        ],
        intent: "count_users",
      },

      // Online/Active status queries
      onlineUsers: {
        patterns: [
          /online users/i,
          /users online/i,
          /how many online/i,
          /who.*online/i,
          /whose.*online/i,
          /who's.*online/i,
          /active users/i,
          /currently online/i,
          /online right now/i,
          /active right now/i,
          /live users/i,
          /connected users/i,
        ],
        intent: "count_online_users",
      },

      // Offline users
      offlineUsers: {
        patterns: [
          /offline users/i,
          /users offline/i,
          /how many offline/i,
          /who.*offline/i,
          /inactive users/i,
          /disconnected users/i,
          /not online/i,
        ],
        intent: "count_offline_users",
      },

      // Availability status
      availableUsers: {
        patterns: [
          /available users/i,
          /users available/i,
          /how many available/i,
          /who.*available/i,
          /ready users/i,
          /free users/i,
        ],
        intent: "count_available_users",
      },

      unavailableUsers: {
        patterns: [
          /unavailable users/i,
          /users unavailable/i,
          /how many unavailable/i,
          /who.*unavailable/i,
          /busy users/i,
          /occupied users/i,
        ],
        intent: "count_unavailable_users",
      },

      // Admin specific queries (REPI and CC roles) - CHECK FIRST!
      adminUsers: {
        patterns: [
          /admin users/i,
          /administrators/i,
          /how many admins/i,
          /admin count/i,
          /management users/i,
          /supervisors/i,
          /show.*admin/i,
          /list.*admin/i,
          /repi.*cc/i,
          /cc.*repi/i,
          /management team/i,
          /leadership/i,
          /administrative team/i,
        ],
        intent: "count_admin_users",
      },

      // Role-based queries (for specific non-admin roles)
      usersByRole: {
        patterns: [
          /users with role (.+)/i,
          /how many (.+) users/i,
          /count (.+) role/i,
          /users are (.+)/i,
          /(.+) role users/i,
          /show me (.+) users/i,
        ],
        intent: "count_users_by_role",
      },

      roleDistribution: {
        patterns: [
          /role distribution/i,
          /users by role/i,
          /role breakdown/i,
          /all roles/i,
          /role statistics/i,
          /show.*roles/i,
          /role summary/i,
        ],
        intent: "role_breakdown",
      },

      // Grade/Department queries
      usersByGrade: {
        patterns: [
          /users in (.+)/i,
          /how many users in (.+)/i,
          /users from (.+)/i,
          /count users in (.+)/i,
          /(.+) department/i,
          /(.+) grade users/i,
        ],
        intent: "count_users_by_grade",
      },

      gradeDistribution: {
        patterns: [
          /grade distribution/i,
          /users by grade/i,
          /grade breakdown/i,
          /department breakdown/i,
          /all grades/i,
          /grade statistics/i,
          /show.*grades/i,
        ],
        intent: "grade_breakdown",
      },

      // User status overview
      userStatusOverview: {
        patterns: [
          /user status/i,
          /status overview/i,
          /user summary/i,
          /complete overview/i,
          /full report/i,
          /dashboard/i,
          /user analytics/i,
        ],
        intent: "user_status_overview",
      },
    };

    // Check each pattern category
    for (const [category, config] of Object.entries(queryPatterns)) {
      for (const pattern of config.patterns) {
        const match = lowerQuestion.match(pattern);
        if (match) {
          return {
            intent: config.intent,
            category,
            extractedValue: match[1] ? match[1].trim() : null,
            confidence: 0.9,
          };
        }
      }
    }

    // Default fallback
    return {
      intent: "unknown",
      category: "general",
      extractedValue: null,
      confidence: 0.1,
    };
  }

  /**
   * Execute MongoDB query based on parsed intent
   * @param {Object} parsedQuery - Parsed query from parseUserQuestion
   * @returns {Object} Query result with data and context
   */
  static async executeUserQuery(parsedQuery) {
    try {
      let result = {};
      let contextMessage = "";

      switch (parsedQuery.intent) {
        case "count_users":
          const totalUsers = await User.countDocuments();
          result = { count: totalUsers, type: "total_users" };
          contextMessage = `There are ${totalUsers} users in the app.`;
          break;

        case "count_online_users":
          const onlineCount = await User.countDocuments({ isOnline: true });
          const onlineUsers = await User.find({ isOnline: true }).select(
            "username role grade"
          );
          result = {
            count: onlineCount,
            type: "online_users",
            users: onlineUsers,
          };
          contextMessage = `There are ${onlineCount} users currently online.`;
          break;

        case "count_offline_users":
          const offlineCount = await User.countDocuments({ isOnline: false });
          const offlineUsers = await User.find({ isOnline: false }).select(
            "username role grade"
          );
          result = {
            count: offlineCount,
            type: "offline_users",
            users: offlineUsers,
          };
          contextMessage = `There are ${offlineCount} users currently offline.`;
          break;

        case "count_available_users":
          const availableCount = await User.countDocuments({
            availability: "available",
          });
          const availableUsers = await User.find({
            availability: "available",
          }).select("username role grade isOnline");
          result = {
            count: availableCount,
            type: "available_users",
            users: availableUsers,
          };
          contextMessage = `There are ${availableCount} users currently available.`;
          break;

        case "count_unavailable_users":
          const unavailableCount = await User.countDocuments({
            availability: "unavailable",
          });
          const unavailableUsers = await User.find({
            availability: "unavailable",
          }).select("username role grade returnDate");
          result = {
            count: unavailableCount,
            type: "unavailable_users",
            users: unavailableUsers,
          };
          contextMessage = `There are ${unavailableCount} users currently unavailable.`;
          break;

        case "count_admin_users":
          const adminCount = await User.countDocuments({
            $or: [{ role: "CC" }, { role: "REPI" }],
          });
          const adminUsers = await User.find({
            $or: [{ role: "CC" }, { role: "REPI" }],
          }).select("username role grade isOnline availability");
          result = {
            count: adminCount,
            type: "admin_users",
            users: adminUsers,
          };
          contextMessage = `There are ${adminCount} administrators (CC and REPI roles).`;
          break;

        case "count_users_by_role":
          if (parsedQuery.extractedValue) {
            const roleCount = await User.countDocuments({
              role: { $regex: parsedQuery.extractedValue, $options: "i" },
            });
            const roleUsers = await User.find({
              role: { $regex: parsedQuery.extractedValue, $options: "i" },
            }).select("username role grade isOnline availability");
            result = {
              count: roleCount,
              type: "users_by_role",
              role: parsedQuery.extractedValue,
              users: roleUsers,
            };
            contextMessage = `There are ${roleCount} users with ${parsedQuery.extractedValue} role.`;
          }
          break;

        case "role_breakdown":
          const roleStats = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]);
          result = { stats: roleStats, type: "role_breakdown" };
          contextMessage = `User distribution by role: ${roleStats
            .map((r) => `${r._id}: ${r.count}`)
            .join(", ")}.`;
          break;

        case "count_users_by_grade":
          if (parsedQuery.extractedValue) {
            const gradeCount = await User.countDocuments({
              grade: { $regex: parsedQuery.extractedValue, $options: "i" },
            });
            const gradeUsers = await User.find({
              grade: { $regex: parsedQuery.extractedValue, $options: "i" },
            }).select("username role grade isOnline availability");
            result = {
              count: gradeCount,
              type: "users_by_grade",
              grade: parsedQuery.extractedValue,
              users: gradeUsers,
            };
            contextMessage = `There are ${gradeCount} users in ${parsedQuery.extractedValue}.`;
          }
          break;

        case "grade_breakdown":
          const gradeStats = await User.aggregate([
            { $group: { _id: "$grade", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]);
          result = { stats: gradeStats, type: "grade_breakdown" };
          contextMessage = `User distribution by grade: ${gradeStats
            .map((g) => `${g._id || "Unknown"}: ${g.count}`)
            .join(", ")}.`;
          break;

        case "user_status_overview":
          const [
            total,
            online,
            offline,
            available,
            unavailable,
            roles,
            grades,
          ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isOnline: true }),
            User.countDocuments({ isOnline: false }),
            User.countDocuments({ availability: "available" }),
            User.countDocuments({ availability: "unavailable" }),
            User.aggregate([
              { $group: { _id: "$role", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ]),
            User.aggregate([
              { $group: { _id: "$grade", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ]),
          ]);

          result = {
            type: "user_status_overview",
            overview: {
              total,
              online,
              offline,
              available,
              unavailable,
              roleDistribution: roles,
              gradeDistribution: grades,
            },
          };
          contextMessage = `Complete user overview: ${total} total, ${online} online, ${available} available.`;
          break;

        default:
          // If we can't determine the intent, return an error instead of defaulting to total users
          return {
            success: false,
            error: "Could not understand the user query",
            contextMessage:
              "I'm not sure what you're asking about. Please try asking about user counts, online status, roles, or grades.",
            queryInfo: parsedQuery,
          };
      }

      return {
        success: true,
        data: result,
        contextMessage,
        queryInfo: parsedQuery,
      };
    } catch (error) {
      console.error("Error executing user query:", error);
      return {
        success: false,
        error: error.message,
        contextMessage: "I encountered an error while retrieving user data.",
        queryInfo: parsedQuery,
      };
    }
  }

  /**
   * Generate enhanced prompt for TinyLlama with user data context
   * @param {string} originalQuestion - User's original question
   * @param {Object} queryResult - Result from executeUserQuery
   * @returns {string} Enhanced prompt for AI
   */
  static generateEnhancedPrompt(originalQuestion, queryResult) {
    if (!queryResult.success) {
      return `User asked: "${originalQuestion}". I encountered an error retrieving user data. Please provide a helpful response explaining that the data is temporarily unavailable.`;
    }

    const basePrompt = `User asked: "${originalQuestion}"

Data Context: ${queryResult.contextMessage}

Please provide a clear, helpful response to the user's question using this data. Be conversational and informative.`;

    return basePrompt;
  }

  /**
   * Generate a direct, human-readable response for user data queries
   * @param {string} originalQuestion - User's original question
   * @param {Object} queryResult - Result from executeUserQuery
   * @returns {string} Human-readable response
   */
  static generateDirectResponse(originalQuestion, queryResult) {
    if (!queryResult.success) {
      // If it's a parsing error, provide helpful guidance
      if (queryResult.error === "Could not understand the user query") {
        return `I'm not sure how to answer "${originalQuestion}". I can help you with:\n\n• **User counts**: "How many users are in my app?"\n• **Online status**: "Who's online right now?"\n• **Role information**: "Show me users by role"\n• **Grade/department data**: "Users by grade"\n\nTry rephrasing your question!`;
      }
      return "I'm sorry, I encountered an error while retrieving the user data. Please try again later.";
    }

    const { data, contextMessage } = queryResult;

    // Generate magnificent, professional responses based on query type
    switch (data.type) {
      case "total_users":
        return `📊 **Total Users**: Your application has **${data.count}** registered users.`;

      case "online_users":
        if (data.users && data.users.length > 0) {
          const userList = data.users
            .slice(0, 5)
            .map(
              (user) => `• **${user.username}** (${user.role} - ${user.grade})`
            )
            .join("\n");
          const moreText =
            data.count > 5 ? `\n\n*...and ${data.count - 5} more users*` : "";
          return `🟢 **Online Users** (${data.count} active):\n\n${userList}${moreText}`;
        }
        return `🟢 **Online Users**: **${data.count}** users are currently active and connected.`;

      case "offline_users":
        if (data.users && data.users.length > 0) {
          const userList = data.users
            .slice(0, 5)
            .map(
              (user) => `• **${user.username}** (${user.role} - ${user.grade})`
            )
            .join("\n");
          const moreText =
            data.count > 5 ? `\n\n*...and ${data.count - 5} more users*` : "";
          return `⚫ **Offline Users** (${data.count} inactive):\n\n${userList}${moreText}`;
        }
        return `⚫ **Offline Users**: **${data.count}** users are currently offline.`;

      case "available_users":
        if (data.users && data.users.length > 0) {
          const userList = data.users
            .slice(0, 5)
            .map(
              (user) =>
                `• **${user.username}** (${user.role} - ${user.grade}) ${
                  user.isOnline ? "🟢" : "⚫"
                }`
            )
            .join("\n");
          const moreText =
            data.count > 5
              ? `\n\n*...and ${data.count - 5} more available users*`
              : "";
          return `✅ **Available Users** (${data.count} ready):\n\n${userList}${moreText}`;
        }
        return `✅ **Available Users**: **${data.count}** users are currently available for work.`;

      case "unavailable_users":
        if (data.users && data.users.length > 0) {
          const userList = data.users
            .slice(0, 5)
            .map((user) => {
              const returnInfo = user.returnDate
                ? ` - Returns: ${new Date(
                    user.returnDate
                  ).toLocaleDateString()}`
                : "";
              return `• **${user.username}** (${user.role} - ${user.grade})${returnInfo}`;
            })
            .join("\n");
          const moreText =
            data.count > 5
              ? `\n\n*...and ${data.count - 5} more unavailable users*`
              : "";
          return `🚫 **Unavailable Users** (${data.count} busy):\n\n${userList}${moreText}`;
        }
        return `🚫 **Unavailable Users**: **${data.count}** users are currently unavailable.`;

      case "admin_users":
        if (data.users && data.users.length > 0) {
          const ccUsers = data.users.filter((user) => user.role === "CC");
          const repiUsers = data.users.filter((user) => user.role === "REPI");

          let userList = "";

          if (ccUsers.length > 0) {
            userList += `**🏛️ CC (Chief Controller) - ${ccUsers.length} users:**\n`;
            userList += ccUsers
              .map(
                (user) =>
                  `• **${user.username}** (${user.grade}) ${
                    user.isOnline ? "🟢 Online" : "⚫ Offline"
                  } ${
                    user.availability === "available"
                      ? "✅ Available"
                      : "🚫 Busy"
                  }`
              )
              .join("\n");
          }

          if (repiUsers.length > 0) {
            if (ccUsers.length > 0) userList += "\n\n";
            userList += `**👨‍💼 REPI (Representative) - ${repiUsers.length} users:**\n`;
            userList += repiUsers
              .map(
                (user) =>
                  `• **${user.username}** (${user.grade}) ${
                    user.isOnline ? "🟢 Online" : "⚫ Offline"
                  } ${
                    user.availability === "available"
                      ? "✅ Available"
                      : "🚫 Busy"
                  }`
              )
              .join("\n");
          }

          return `👑 **Administrative Team** (${data.count} total administrators):\n\n${userList}`;
        }
        return `👑 **Administrative Team**: **${data.count}** administrators (CC and REPI roles).`;

      case "users_by_role":
        if (data.users && data.users.length > 0) {
          const userList = data.users
            .slice(0, 8)
            .map(
              (user) =>
                `• **${user.username}** (${user.grade}) ${
                  user.isOnline ? "🟢" : "⚫"
                } ${user.availability === "available" ? "✅" : "🚫"}`
            )
            .join("\n");
          const moreText =
            data.count > 8
              ? `\n\n*...and ${data.count - 8} more ${data.role} users*`
              : "";
          return `👥 **${data.role.toUpperCase()} Users** (${
            data.count
          } total):\n\n${userList}${moreText}`;
        }
        return `👥 **Users by Role**: **${data.count}** users have the "${data.role}" role.`;

      case "users_by_grade":
        if (data.users && data.users.length > 0) {
          const userList = data.users
            .slice(0, 8)
            .map(
              (user) =>
                `• **${user.username}** (${user.role}) ${
                  user.isOnline ? "🟢" : "⚫"
                } ${user.availability === "available" ? "✅" : "🚫"}`
            )
            .join("\n");
          const moreText =
            data.count > 8
              ? `\n\n*...and ${data.count - 8} more users in ${data.grade}*`
              : "";
          return `🏢 **${data.grade} Department** (${data.count} users):\n\n${userList}${moreText}`;
        }
        return `🏢 **Department Users**: **${data.count}** users in "${data.grade}".`;

      case "role_breakdown":
        const roleBreakdown = data.stats
          .map((stat) => `• **${stat._id}**: ${stat.count} users`)
          .join("\n");
        return `👥 **Role Distribution**:\n\n${roleBreakdown}`;

      case "grade_breakdown":
        const gradeBreakdown = data.stats
          .map((stat) => `• **${stat._id || "Unknown"}**: ${stat.count} users`)
          .join("\n");
        return `🏢 **Department Distribution**:\n\n${gradeBreakdown}`;

      case "user_status_overview":
        const overview = data.overview;
        const roleList = overview.roleDistribution
          .slice(0, 5)
          .map((r) => `• **${r._id}**: ${r.count}`)
          .join("\n");
        const gradeList = overview.gradeDistribution
          .slice(0, 5)
          .map((g) => `• **${g._id || "Unknown"}**: ${g.count}`)
          .join("\n");

        return `📈 **Complete User Analytics Dashboard**

**📊 Overview Statistics:**
• **Total Users**: ${overview.total}
• **🟢 Online**: ${overview.online} users
• **⚫ Offline**: ${overview.offline} users
• **✅ Available**: ${overview.available} users
• **🚫 Unavailable**: ${overview.unavailable} users

**👥 Top Roles:**
${roleList}

**🏢 Top Departments:**
${gradeList}

*Last updated: ${new Date().toLocaleString()}*`;

      default:
        return (
          contextMessage ||
          `I found some information about your users: ${JSON.stringify(
            data,
            null,
            2
          )}`
        );
    }
  }

  /**
   * Check if a question is related to user data
   * @param {string} question - User's question
   * @returns {boolean} True if question is about user data
   */
  static isUserDataQuery(question) {
    const lowerQuestion = question.toLowerCase();

    // Comprehensive patterns for all user data queries
    const userDataPatterns = [
      // Basic counts
      /how many users/i,
      /user count/i,
      /total users/i,
      /number of users/i,
      /users in.*app/i,
      /users are there/i,
      /user statistics/i,

      // Online/Offline status
      /users online/i,
      /online users/i,
      /who.*online/i,
      /whose.*online/i,
      /who's.*online/i,
      /online right now/i,
      /currently online/i,
      /active users/i,
      /live users/i,
      /connected users/i,
      /users offline/i,
      /offline users/i,
      /who.*offline/i,
      /inactive users/i,
      /disconnected users/i,

      // Availability status
      /users available/i,
      /available users/i,
      /who.*available/i,
      /ready users/i,
      /free users/i,
      /users unavailable/i,
      /unavailable users/i,
      /who.*unavailable/i,
      /busy users/i,
      /occupied users/i,

      // Role-based queries
      /users by role/i,
      /role distribution/i,
      /role breakdown/i,
      /role statistics/i,
      /show.*roles/i,
      /users with role/i,
      /admin users/i,
      /administrators/i,
      /how many admins/i,
      /management users/i,
      /supervisors/i,
      /show.*admin/i,
      /list.*admin/i,
      /repi.*users/i,
      /cc.*users/i,
      /repi.*cc/i,
      /cc.*repi/i,
      /management team/i,
      /leadership/i,
      /administrative team/i,

      // Grade/Department queries
      /users by grade/i,
      /grade distribution/i,
      /grade breakdown/i,
      /department breakdown/i,
      /grade statistics/i,
      /show.*grades/i,
      /department/i,

      // Overview and analytics
      /user status/i,
      /status overview/i,
      /user summary/i,
      /complete overview/i,
      /full report/i,
      /user analytics/i,
      /dashboard/i,

      // General user queries
      /show.*users/i,
      /list.*users/i,
      /staff count/i,
      /employee count/i,
    ];

    return userDataPatterns.some((pattern) => pattern.test(lowerQuestion));
  }
}

export default UserQueryService;

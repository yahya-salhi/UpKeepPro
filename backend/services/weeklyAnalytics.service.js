import User from "../models/user.modal.js";

/**
 * Service for generating weekly user activity analytics
 */
class WeeklyAnalyticsService {
  /**
   * Get start and end of current week (Monday-Sunday)
   * @returns {Object} Week boundaries
   */
  static getCurrentWeekBounds() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Monday start
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  }

  /**
   * Get start and end of previous week
   * @returns {Object} Previous week boundaries
   */
  static getPreviousWeekBounds() {
    const { monday } = this.getCurrentWeekBounds();
    const prevSunday = new Date(monday);
    prevSunday.setDate(monday.getDate() - 1);
    prevSunday.setHours(23, 59, 59, 999);
    
    const prevMonday = new Date(prevSunday);
    prevMonday.setDate(prevSunday.getDate() - 6);
    prevMonday.setHours(0, 0, 0, 0);
    
    return { monday: prevMonday, sunday: prevSunday };
  }

  /**
   * Generate comprehensive weekly user trends report
   * @returns {Object} Weekly analytics data
   */
  static async generateWeeklyTrends() {
    try {
      const { monday: thisMonday, sunday: thisSunday } = this.getCurrentWeekBounds();
      const { monday: prevMonday, sunday: prevSunday } = this.getPreviousWeekBounds();

      // Get this week's data
      const thisWeekData = await this.getWeeklyData(thisMonday, thisSunday);
      
      // Get previous week's data for comparison
      const prevWeekData = await this.getWeeklyData(prevMonday, prevSunday);

      // Generate daily breakdown
      const dailyBreakdown = await this.getDailyBreakdown(thisMonday, thisSunday);

      // Calculate trends and insights
      const trends = this.calculateTrends(thisWeekData, prevWeekData);

      // Get peak activity analysis
      const peakActivity = await this.analyzePeakActivity(thisMonday, thisSunday);

      return {
        success: true,
        data: {
          type: "weekly_trends",
          weekPeriod: {
            start: thisMonday.toLocaleDateString(),
            end: thisSunday.toLocaleDateString()
          },
          thisWeek: thisWeekData,
          previousWeek: prevWeekData,
          dailyBreakdown,
          trends,
          peakActivity,
          generatedAt: new Date()
        }
      };

    } catch (error) {
      console.error("Error generating weekly trends:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get weekly aggregated data
   * @param {Date} startDate - Week start date
   * @param {Date} endDate - Week end date
   * @returns {Object} Weekly metrics
   */
  static async getWeeklyData(startDate, endDate) {
    // Users who logged in this week (based on lastLogin or updatedAt)
    const activeUsers = await User.find({
      $or: [
        { lastLogin: { $gte: startDate, $lte: endDate } },
        { updatedAt: { $gte: startDate, $lte: endDate } }
      ]
    }).select("username role grade lastLogin updatedAt createdAt isOnline availability");

    // New users created this week
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Currently online users
    const onlineUsers = await User.countDocuments({ isOnline: true });

    // Available users
    const availableUsers = await User.countDocuments({ availability: "available" });

    // Calculate metrics
    const totalLogins = activeUsers.length;
    const uniqueUsers = new Set(activeUsers.map(user => user._id.toString())).size;
    
    // Estimate average session duration (simplified)
    const avgSessionHours = this.estimateAverageSession(activeUsers);

    return {
      totalLogins,
      uniqueUsers,
      newUsers,
      onlineUsers,
      availableUsers,
      avgSessionHours,
      activeUsersList: activeUsers
    };
  }

  /**
   * Generate daily breakdown for the week
   * @param {Date} startDate - Week start date
   * @param {Date} endDate - Week end date
   * @returns {Array} Daily activity data
   */
  static async getDailyBreakdown(startDate, endDate) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyData = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(startDate.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogins = await User.countDocuments({
        $or: [
          { lastLogin: { $gte: dayStart, $lte: dayEnd } },
          { updatedAt: { $gte: dayStart, $lte: dayEnd } }
        ]
      });

      // Estimate average online users for the day (simplified)
      const avgOnline = Math.max(1, Math.floor(dayLogins * 0.6)); // Rough estimate

      dailyData.push({
        day: days[i],
        date: dayStart.toLocaleDateString(),
        logins: dayLogins,
        avgOnline
      });
    }

    return dailyData;
  }

  /**
   * Calculate trends between this week and previous week
   * @param {Object} thisWeek - Current week data
   * @param {Object} prevWeek - Previous week data
   * @returns {Object} Trend analysis
   */
  static calculateTrends(thisWeek, prevWeek) {
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      logins: {
        change: calculateChange(thisWeek.totalLogins, prevWeek.totalLogins),
        direction: thisWeek.totalLogins >= prevWeek.totalLogins ? 'up' : 'down'
      },
      uniqueUsers: {
        change: calculateChange(thisWeek.uniqueUsers, prevWeek.uniqueUsers),
        direction: thisWeek.uniqueUsers >= prevWeek.uniqueUsers ? 'up' : 'down'
      },
      newUsers: {
        change: calculateChange(thisWeek.newUsers, prevWeek.newUsers),
        direction: thisWeek.newUsers >= prevWeek.newUsers ? 'up' : 'down'
      },
      sessionDuration: {
        change: calculateChange(thisWeek.avgSessionHours, prevWeek.avgSessionHours),
        direction: thisWeek.avgSessionHours >= prevWeek.avgSessionHours ? 'up' : 'down'
      }
    };
  }

  /**
   * Analyze peak activity patterns
   * @param {Date} startDate - Week start date
   * @param {Date} endDate - Week end date
   * @returns {Object} Peak activity analysis
   */
  static async analyzePeakActivity(startDate, endDate) {
    // Get all active users this week
    const activeUsers = await User.find({
      $or: [
        { lastLogin: { $gte: startDate, $lte: endDate } },
        { updatedAt: { $gte: startDate, $lte: endDate } }
      ]
    }).select("lastLogin updatedAt");

    // Analyze activity by hour (simplified)
    const hourlyActivity = new Array(24).fill(0);
    
    activeUsers.forEach(user => {
      const activityDate = user.lastLogin || user.updatedAt;
      if (activityDate) {
        const hour = new Date(activityDate).getHours();
        hourlyActivity[hour]++;
      }
    });

    // Find peak and low activity hours
    const maxActivity = Math.max(...hourlyActivity);
    const minActivity = Math.min(...hourlyActivity.filter(h => h > 0));
    
    const peakHour = hourlyActivity.indexOf(maxActivity);
    const lowHour = hourlyActivity.indexOf(minActivity);

    return {
      peakHour: {
        time: `${peakHour}:00 - ${peakHour + 1}:00`,
        activity: maxActivity
      },
      lowHour: {
        time: `${lowHour}:00 - ${lowHour + 1}:00`,
        activity: minActivity
      },
      hourlyDistribution: hourlyActivity
    };
  }

  /**
   * Estimate average session duration (simplified calculation)
   * @param {Array} users - Array of user objects
   * @returns {number} Estimated average session hours
   */
  static estimateAverageSession(users) {
    if (users.length === 0) return 0;
    
    // Simplified estimation: assume active users have 2-4 hour sessions
    const onlineUsers = users.filter(user => user.isOnline).length;
    const totalUsers = users.length;
    
    // Base estimate: 2.5 hours, adjusted by online ratio
    const baseHours = 2.5;
    const onlineRatio = totalUsers > 0 ? onlineUsers / totalUsers : 0;
    
    return Math.round((baseHours + (onlineRatio * 1.5)) * 10) / 10; // Round to 1 decimal
  }
}

export default WeeklyAnalyticsService;

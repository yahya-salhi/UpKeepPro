import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import moment from 'moment';

// Custom hook to fetch and filter events for the current week
export const useWeeklyEvents = (weekOffset = 0) => {
  const [weekRange, setWeekRange] = useState({
    start: null,
    end: null,
    displayRange: ''
  });

  // Calculate the current week's start and end dates based on the weekOffset
  useEffect(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Create a display string for the date range
    const displayRange = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    setWeekRange({
      start: startOfWeek,
      end: endOfWeek,
      displayRange
    });
  }, [weekOffset]);

  // Fetch all events
  const fetchEvents = async () => {
    const response = await axios.get("/api/events");
    return response.data.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  };

  const { data: allEvents, isLoading, isError, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // Filter events for the current week
  const weeklyEvents = allEvents?.filter(event => {
    if (!weekRange.start || !weekRange.end) return false;
    
    const eventStart = new Date(event.start);
    return eventStart >= weekRange.start && eventStart <= weekRange.end;
  }) || [];

  // Sort events by start date
  const sortedEvents = [...weeklyEvents].sort((a, b) => {
    return new Date(a.start) - new Date(b.start);
  });

  // Group events by day
  const eventsByDay = sortedEvents.reduce((acc, event) => {
    const day = new Date(event.start).getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(event);
    return acc;
  }, {});

  // Get days of the week with their dates
  const weekDays = [];
  if (weekRange.start) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekRange.start);
      date.setDate(weekRange.start.getDate() + i);
      weekDays.push({
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        date: date,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
  }

  // Categorize events by status
  const categorizedEvents = {
    upcoming: sortedEvents.filter(event => new Date(event.start) > new Date()),
    inProgress: sortedEvents.filter(event => {
      const now = new Date();
      return new Date(event.start) <= now && new Date(event.end) >= now;
    }),
    completed: sortedEvents.filter(event => new Date(event.end) < new Date()),
  };

  // Helper function to format event time
  const formatEventTime = (event) => {
    const start = moment(event.start).format('h:mm A');
    const end = moment(event.end).format('h:mm A');
    
    // Check if the event is today, tomorrow, or yesterday
    const today = moment().startOf('day');
    const eventDate = moment(event.start).startOf('day');
    const diff = eventDate.diff(today, 'days');
    
    let datePrefix = moment(event.start).format('ddd, ');
    if (diff === 0) datePrefix = 'Today, ';
    else if (diff === 1) datePrefix = 'Tomorrow, ';
    else if (diff === -1) datePrefix = 'Yesterday, ';
    
    return `${datePrefix}${start} - ${end}`;
  };

  return {
    weeklyEvents: sortedEvents,
    eventsByDay,
    weekDays,
    categorizedEvents,
    weekRange,
    isLoading,
    isError,
    error,
    formatEventTime
  };
};

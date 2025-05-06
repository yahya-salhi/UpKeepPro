import { useState } from "react";
import Calendar from "react-calendar";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Header } from "../components";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-calendar/dist/Calendar.css";

// Custom hook for fetching events
const fetchEvents = async () => {
  const response = await axios.get("/api/events");
  return response.data;
};

// Custom hook for adding events
const addEvent = async (eventData) => {
  const response = await axios.post("/api/events", eventData);
  return response.data;
};

const Scheduler = () => {
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
  });

  const queryClient = useQueryClient();

  const localizer = momentLocalizer(moment);

  // Fetch events using React Query
  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // Mutation for adding an event
  const mutation = useMutation({
    mutationFn: addEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event saved successfully!");
    },
    onError: () => {
      toast.error("Error saving event");
    },
    onSettled: () => {
      // Refetch events after adding
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const handleCalendarChange = (newDate) => {
    setDate(newDate);
    setSelectedDate(newDate); // Sync the selected date for scheduling
  };

  const handleEventClick = (event) => {
    toast(
      () => (
        <div className="alert alert-info">
          <div>
            <strong>Event: {event.title}</strong>
            <br />
            <span>Start: {event.start.toLocaleString()}</span>
            <br />
            <span>End: {event.end.toLocaleString()}</span>
          </div>
        </div>
      ),
      {
        duration: 5000, // Display the toast for 5 seconds
        position: "top-center", // Position of the toast
        style: {
          background: "#333",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      }
    );
  };

  const handleEventCreation = async () => {
    const newEventData = {
      ...newEvent,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
    };

    // Send the new event to the backend
    mutation.mutate(newEventData);
    setNewEvent({ title: "", start: new Date(), end: new Date() }); // Clear form after saving event
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Calendar" />

      {/* Calendar */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Calendar</h3>
        <Calendar
          onChange={handleCalendarChange}
          value={date}
          className="rounded-lg border p-4"
        />
      </div>

      {/* Scheduler (Big Calendar) */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Scheduler</h3>
        {isLoading ? (
          <p>Loading events...</p>
        ) : isError ? (
          <p>Error loading events.</p>
        ) : (
          <BigCalendar
            localizer={localizer}
            events={events || []}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500, width: "100%" }}
            onSelectEvent={handleEventClick}
            views={["month", "week", "day", "agenda"]}
          />
        )}
      </div>

      {/* Date Picker (DaisyUI styled) */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Select a Date</h3>
        <DatePickerComponent
          value={selectedDate}
          showClearButton={false}
          placeholder="Select Date"
          floatLabelType="Always"
          onChange={(e) => setSelectedDate(e.value)}
          className="w-full max-w-xs"
        />
      </div>

      {/* Event Creation Form */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Create Event</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            className="input input-bordered w-full"
          />
          <div className="flex space-x-4">
            <input
              type="datetime-local"
              value={newEvent.start.toISOString().slice(0, 16)}
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: new Date(e.target.value) })
              }
              className="input input-bordered w-full"
            />
            <input
              type="datetime-local"
              value={newEvent.end.toISOString().slice(0, 16)}
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: new Date(e.target.value) })
              }
              className="input input-bordered w-full"
            />
          </div>
          <button
            onClick={handleEventCreation}
            className="btn btn-primary w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Event"}
          </button>
          {mutation.isError && (
            <p className="text-red-500">Error saving event</p>
          )}
          {mutation.isSuccess && (
            <p className="text-green-500">Event saved successfully</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;

import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "../components/ui/Modal";
import { Button } from "../components/ui/button";
import Header from "../components/Header";
import { useStateContext } from "../contexts/ContextProvider";

// Custom styles for the calendar with enhanced dark mode
const calendarStyles = {
  light: {
    className: "rounded-xl shadow-lg bg-white",
    dayPaper: "hover:bg-gray-100 transition-colors duration-200",
    eventPaper: "bg-blue-500 text-white rounded-md px-2 py-1 shadow-sm",
    header: "text-gray-800 font-medium",
    toolbar: "bg-white text-gray-800 rounded-t-xl p-3",
    today: "bg-blue-50 text-blue-600 font-semibold",
  },
  dark: {
    className:
      "rounded-xl shadow-lg bg-secondary-dark-bg border border-gray-700",
    dayPaper: "hover:bg-gray-700 transition-colors duration-200",
    eventPaper: "bg-blue-500 text-white rounded-md px-2 py-1 shadow-md",
    header: "text-gray-200 font-medium",
    toolbar:
      "bg-secondary-dark-bg text-gray-200 rounded-t-xl p-3 border-b border-gray-700",
    today: "bg-blue-900/30 text-blue-400 font-semibold",
  },
};

// Ensure events fetched from the backend have proper Date objects
const fetchEvents = async () => {
  const response = await axios.get("/api/events");
  return response.data.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));
};

const addEvent = async (eventData) => {
  const response = await axios.post("/api/events", eventData);
  return response.data;
};

const deleteEvent = async (eventId) => {
  const response = await axios.delete(`/api/events/${eventId}`);
  return response.data;
};

const updateEvent = async ({ id, updatedData }) => {
  const response = await axios.put(`/api/events/${id}`, updatedData);
  return response.data;
};

const Scheduler = () => {
  const { currentMode } = useStateContext();
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    description: "",
    location: "",
    priority: "medium",
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [view, setView] = useState("month");

  const queryClient = useQueryClient();
  const localizer = momentLocalizer(moment);

  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const addMutation = useMutation({
    mutationFn: addEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event added successfully!");
      setIsModalOpen(false);
    },
    onError: () => toast.error("Failed to add event"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully!");
      setIsDeleteModalOpen(false);
    },
    onError: () => toast.error("Failed to delete event"),
  });

  const updateMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully!");
      setIsModalOpen(false);
    },
    onError: () => toast.error("Failed to update event"),
  });

  const handleEventSave = () => {
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent._id, updatedData: newEvent });
    } else {
      addMutation.mutate(newEvent);
    }
  };

  const handleEventDelete = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent._id);
    }
  };

  const openModal = (event = null) => {
    setSelectedEvent(event);
    setNewEvent(
      event || {
        title: "",
        start: new Date(),
        end: new Date(),
        description: "",
        location: "",
        priority: "medium",
        notifications: {
          oneDayBefore: true,
          oneHourBefore: true,
        },
      }
    );
    setIsModalOpen(true);
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const customDayPropGetter = () => ({
    className:
      currentMode === "Dark"
        ? calendarStyles.dark.dayPaper
        : calendarStyles.light.dayPaper,
  });

  const eventStyleGetter = (event) => {
    // Determine color based on event priority
    const priorityColors = {
      high: currentMode === "Dark" ? "#ef4444" : "#dc2626",
      medium: currentMode === "Dark" ? "#3b82f6" : "#2563eb",
      low: currentMode === "Dark" ? "#10b981" : "#059669",
    };

    const backgroundColor = event.priority
      ? priorityColors[event.priority]
      : currentMode === "Dark"
      ? "#3b82f6"
      : "#2563eb";

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "#fff",
        border: "none",
        padding: "4px 8px",
        fontWeight: "500",
        transition: "all 0.2s ease",
        transform: event === selectedEvent ? "scale(1.02)" : "scale(1)",
        boxShadow:
          event === selectedEvent ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none",
      },
    };
  };

  return (
    <div
      className={`m-2 md:m-10 mt-24 p-2 md:p-10 rounded-3xl transition-colors duration-300
      ${
        currentMode === "Dark"
          ? "bg-main-dark-bg text-gray-200"
          : "bg-white text-gray-800"
      }`}
    >
      <Header category="App" title="Scheduler" />

      <div className="mb-10 flex flex-col">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <Button
              onClick={() => setView("month")}
              className={`transition-all duration-200 px-4 py-2 rounded-lg ${
                view === "month"
                  ? currentMode === "Dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : currentMode === "Dark"
                  ? "bg-secondary-dark-bg text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Month
            </Button>
            <Button
              onClick={() => setView("week")}
              className={`transition-all duration-200 px-4 py-2 rounded-lg ${
                view === "week"
                  ? currentMode === "Dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : currentMode === "Dark"
                  ? "bg-secondary-dark-bg text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Week
            </Button>
            <Button
              onClick={() => setView("day")}
              className={`transition-all duration-200 px-4 py-2 rounded-lg ${
                view === "day"
                  ? currentMode === "Dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : currentMode === "Dark"
                  ? "bg-secondary-dark-bg text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Day
            </Button>
            <Button
              onClick={() => setView("agenda")}
              className={`transition-all duration-200 px-4 py-2 rounded-lg ${
                view === "agenda"
                  ? currentMode === "Dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : currentMode === "Dark"
                  ? "bg-secondary-dark-bg text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Agenda
            </Button>
          </div>
          <Button
            onClick={() => openModal()}
            className={`transition-all duration-200 ease-in-out transform hover:scale-105
              ${
                currentMode === "Dark"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }
              text-white font-semibold py-2 px-4 rounded-lg shadow-lg`}
          >
            Add Event
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : isError ? (
          <div
            className={`text-center p-4 rounded-lg ${
              currentMode === "Dark"
                ? "bg-red-900/20 text-red-400"
                : "bg-red-100 text-red-600"
            }`}
          >
            <p className="font-medium">Error loading events</p>
            <p className="text-sm mt-1">
              Please try again later or contact support
            </p>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-xl shadow-lg transition-all duration-300 ${
              currentMode === "Dark"
                ? "shadow-gray-900/30"
                : "shadow-gray-300/50"
            }`}
          >
            <BigCalendar
              localizer={localizer}
              events={events || []}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 650 }}
              onSelectEvent={(event) => openModal(event)}
              onDoubleClickEvent={(event) => openDeleteModal(event)}
              views={["month", "week", "day", "agenda"]}
              view={view}
              onView={setView}
              dayPropGetter={customDayPropGetter}
              eventPropGetter={eventStyleGetter}
              className={`${
                currentMode === "Dark"
                  ? calendarStyles.dark.className
                  : calendarStyles.light.className
              }
                transition-all duration-300 ease-in-out`}
              components={{
                toolbar: (props) => (
                  <div
                    className={`${
                      currentMode === "Dark"
                        ? calendarStyles.dark.toolbar
                        : calendarStyles.light.toolbar
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => props.onNavigate("PREV")}
                          className={`p-2 rounded-full ${
                            currentMode === "Dark"
                              ? "hover:bg-gray-700 text-gray-300"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => props.onNavigate("TODAY")}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentMode === "Dark"
                              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => props.onNavigate("NEXT")}
                          className={`p-2 rounded-full ${
                            currentMode === "Dark"
                              ? "hover:bg-gray-700 text-gray-300"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      <span
                        className={`text-lg font-semibold ${
                          currentMode === "Dark"
                            ? "text-gray-200"
                            : "text-gray-800"
                        }`}
                      >
                        {props.label}
                      </span>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        )}
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <Modal
          title={selectedEvent ? "Edit Event" : "Add New Event"}
          onClose={() => setIsModalOpen(false)}
        >
          <div
            className={`${
              currentMode === "Dark"
                ? "bg-secondary-dark-bg text-gray-200"
                : "bg-white text-gray-800"
            }`}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className={`w-full p-2 rounded-md border ${
                    currentMode === "Dark"
                      ? "bg-main-dark-bg border-gray-700 text-gray-200 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        start: new Date(e.target.value),
                      })
                    }
                    className={`w-full p-2 rounded-md border ${
                      currentMode === "Dark"
                        ? "bg-main-dark-bg border-gray-700 text-gray-200 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                    } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        end: new Date(e.target.value),
                      })
                    }
                    className={`w-full p-2 rounded-md border ${
                      currentMode === "Dark"
                        ? "bg-main-dark-bg border-gray-700 text-gray-200 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                    } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className={`w-full p-2 rounded-md border ${
                    currentMode === "Dark"
                      ? "bg-main-dark-bg border-gray-700 text-gray-200 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                  placeholder="Event description"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  className={`w-full p-2 rounded-md border ${
                    currentMode === "Dark"
                      ? "bg-main-dark-bg border-gray-700 text-gray-200 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                  placeholder="Event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  value={newEvent.priority || "medium"}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, priority: e.target.value })
                  }
                  className={`w-full p-2 rounded-md border ${
                    currentMode === "Dark"
                      ? "bg-main-dark-bg border-gray-700 text-gray-200 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Notification Preferences */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Notification Preferences
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="oneDayBefore"
                      checked={newEvent.notifications?.oneDayBefore ?? true}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          notifications: {
                            ...newEvent.notifications,
                            oneDayBefore: e.target.checked,
                          },
                        })
                      }
                      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white"
                      }`}
                    />
                    <label htmlFor="oneDayBefore" className="ml-2 text-sm">
                      Notify me 1 day before the event
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="oneHourBefore"
                      checked={newEvent.notifications?.oneHourBefore ?? true}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          notifications: {
                            ...newEvent.notifications,
                            oneHourBefore: e.target.checked,
                          },
                        })
                      }
                      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white"
                      }`}
                    />
                    <label htmlFor="oneHourBefore" className="ml-2 text-sm">
                      Notify me 1 hour before the event
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  currentMode === "Dark"
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                } transition-colors`}
              >
                Cancel
              </Button>
              {selectedEvent && (
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    openDeleteModal(selectedEvent);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </Button>
              )}
              <Button
                onClick={handleEventSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedEvent ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal title="Delete Event" onClose={() => setIsDeleteModalOpen(false)}>
          <div
            className={`${
              currentMode === "Dark"
                ? "bg-secondary-dark-bg text-gray-200"
                : "bg-white text-gray-800"
            }`}
          >
            <p className="mb-4">Are you sure you want to delete this event?</p>
            <p className="font-medium mb-6">{selectedEvent?.title}</p>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  currentMode === "Dark"
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                } transition-colors`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEventDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Scheduler;

import { useState, useEffect } from "react";
import "../../../src/index.css";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Calendar } from "lucide-react";

const FormField = ({ label, children }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    {children}
  </div>
);

const EditProfileModal = ({ authUser }) => {
  const queryClient = useQueryClient();
  const [showCalendar, setShowCalendar] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    grade: "",
    mission: "",
    availability: "",
    phoneUsersCount: "",
    officeUsersCount: "",
    returnDate: null,
    alternativeUser: "",
    newPassword: "",
    currentPassword: "",
  });

  const { mutate: updateProfile, isPanding } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/users/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update profile");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
  });
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    if (authUser) {
      setFormData({
        username: authUser.username,
        email: authUser.email,
        grade: authUser.grade,
        mission: authUser.mission,
        availability: authUser.availability,
        phoneUsersCount: authUser.phoneUsersCount,
        officeUsersCount: authUser.officeUsersCount,
        returnDate: authUser.returnDate,
        alternativeUser: authUser.alternativeUser,
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleDateSelect = (date) => {
    setFormData({ ...formData, returnDate: date });
    setShowCalendar(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const calendar = document.querySelector(".calendar-container");
      if (
        calendar &&
        !calendar.contains(event.target) &&
        !event.target.closest(".calendar-trigger")
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  return (
    <>
      <button
        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit Profile
      </button>

      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box max-w-2xl bg-white dark:bg-gray-800 p-0 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Profile
            </h3>
            <form method="dialog">
              <button className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Form */}
          <form
            className="p-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile();
            }}
          >
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Username">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </FormField>

                <FormField label="Email">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </FormField>
              </div>
            </div>

            {/* Military Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Military Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={
                    authUser?.role === "STAG"
                      ? "Level/Grade (Optional)"
                      : "Military Rank"
                  }
                >
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="">
                      {authUser?.role === "STAG"
                        ? "Select level (optional)"
                        : "Select Rank"}
                    </option>
                    {authUser?.role === "STAG"
                      ? [
                          "BTP MMSI",
                          "BTP TSS",
                          "CAP SOUDURE",
                          "CAP ALUM",
                          "CC SOUDURE",
                          "CC ALUM",
                        ].map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))
                      : [
                          "SGT",
                          "SGT/C",
                          "ADJ",
                          "ADJ/C",
                          "ADJ/M",
                          "S/LT",
                          "LT",
                          "CPT",
                          "CMD",
                          "LT/COL",
                          "COL",
                          "COL/M",
                        ].map((rank) => (
                          <option key={rank} value={rank}>
                            {rank}
                          </option>
                        ))}
                  </select>
                </FormField>

                <FormField label="Mission">
                  <textarea
                    name="mission"
                    value={formData.mission}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                    rows="2"
                  />
                </FormField>
              </div>
            </div>

            {/* Availability Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Availability Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Availability">
                  <select
                    value={formData.availability}
                    onChange={(e) =>
                      setFormData({ ...formData, availability: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </FormField>

                {formData.availability === "unavailable" && (
                  <FormField label="Return Date">
                    <div className="relative">
                      <input
                        type="text"
                        value={formatDate(formData.returnDate)}
                        readOnly
                        className="calendar-trigger w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent cursor-pointer"
                        placeholder="Select return date"
                        onClick={() => setShowCalendar(!showCalendar)}
                      />{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCalendar(!showCalendar);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Calendar className="h-5 w-5" />
                      </button>
                      {showCalendar && (
                        <div className="absolute z-10 mt-1 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="calendar-container">
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                (day) => (
                                  <div
                                    key={day}
                                    className="text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                  >
                                    {day}
                                  </div>
                                )
                              )}
                              {Array.from(
                                { length: new Date().getDay() },
                                (_, i) => (
                                  <div
                                    key={`empty-${i}`}
                                    className="text-center p-2"
                                  />
                                )
                              )}
                              {Array.from({ length: 31 }, (_, i) => {
                                const date = new Date();
                                date.setDate(i + 1);
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleDateSelect(date)}
                                    className={`text-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                      formData.returnDate &&
                                      date.toDateString() ===
                                        new Date(
                                          formData.returnDate
                                        ).toDateString()
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {i + 1}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormField>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Office Phone">
                  <input
                    type="number"
                    name="officeUsersCount"
                    value={formData.officeUsersCount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </FormField>

                <FormField label="Personal Phone">
                  <input
                    type="number"
                    name="phoneUsersCount"
                    value={formData.phoneUsersCount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </FormField>
              </div>
            </div>

            {/* Password Change */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Change Password
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Current Password">
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </FormField>

                <FormField label="New Password">
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </FormField>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <form method="dialog">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </form>
              <button
                type="submit"
                disabled={isPanding}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
              >
                {isPanding ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop bg-black/50">
          <button className="cursor-default w-screen h-screen">close</button>
        </form>
      </dialog>
    </>
  );
};

export default EditProfileModal;

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// index.css
import "../../../src/index.css";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const EditProfileModal = ({ authUser }) => {
  const queryClient = useQueryClient();
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

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile();
            }}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="UserName"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="UserName"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Mission"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.mission}
                name="mission"
                onChange={handleInputChange}
              />
            </div>
            {/* Role */}
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Are you available?</span>
              </div>
              <select
                className="select select-bordered"
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
              >
                <option disabled value="">
                  Pick one
                </option>
                <option value="available">available</option>
                <option value="unavailable">unavailable</option>
              </select>
            </label>
            {/* Return Date with Styled Date Picker */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Return Date</span>
              </div>
              <DatePicker
                selected={formData.returnDate}
                onChange={(date) =>
                  setFormData({ ...formData, returnDate: date })
                }
                dateFormat="yyyy/MM/dd"
                className="input input-bordered w-full p-2"
                placeholderText="Select a return date"
                calendarClassName="custom-datepicker" // Custom class for styling
                popperClassName="custom-popper" // Pop-up styling
              />
            </label>
            {/* {grade} */}
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Pick up the military rank</span>
              </div>
              <select
                className="select select-bordered"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
              >
                <option disabled value="">
                  Pick one
                </option>
                <option value="SGT">SGT</option>
                <option value="SGT/C">SGT/C</option>
                <option value="ADJ">ADJ</option>
                <option value="ADJ/C">ADJ/C</option>
                <option value="ADJ/M">ADJ/M</option>
                <option value="S/LT">S/LT</option>
                <option value="LT">LT</option>
                <option value="CPT">CPT</option>
                <option value="CMD">CMD</option>
                <option value="COL">LT/COL</option>
                <option value="COL/M">COL</option>
                <option value="COL/M">COL/M</option>
              </select>
            </label>
            {/* number phone  */}
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                placeholder="Office Number phone"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.officeUsersCount}
                name="officeUsersCount"
                onChange={handleInputChange}
              />
              <input
                type="number"
                placeholder=" Personal Phone Number"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.phoneUsersCount}
                name="phoneUsersCount"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="Current Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.currentPassword}
                name="currentPassword"
                onChange={handleInputChange}
              />
              <input
                type="password"
                placeholder="New Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.newPassword}
                name="newPassword"
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />
            <button className="btn btn-primary rounded-full btn-sm text-white">
              {isPanding ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default EditProfileModal;

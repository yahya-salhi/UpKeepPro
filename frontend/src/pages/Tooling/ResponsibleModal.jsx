import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enhancedToast } from "./enhancedToast.jsx";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResponsibleModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newResponsible) => {
      const { data } = await axios.post("/api/responsibles", newResponsible);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responsibles"] });
      enhancedToast.success("Responsible added successfully", {
        actionLabel: "View All",
        onAction: () => {
          // Could navigate to responsibles list
          console.log("View all responsibles");
        },
      });
      setName("");
      setGrade("");
      onClose();
    },
    onError: (error) => {
      enhancedToast.error("Failed to add responsible", {
        details: error.response?.data?.error || error.message,
        actionLabel: "Retry",
        onAction: () => {
          // Could retry the form submission
          console.log("Retry adding responsible");
        },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !grade) {
      enhancedToast.warning("All fields are required", {
        actionLabel: "Review Form",
        onAction: () => {
          // Could focus on the first empty field
          console.log("Focus on empty field");
        },
      });
      return;
    }
    mutation.mutate({ name, grade });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Responsible
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Responsible name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="grade"
                  className="block text-sm font-medium text-gray-700"
                >
                  Grade *
                </Label>
                <Input
                  id="grade"
                  type="text"
                  placeholder="Responsible grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? "Adding..." : "Add Responsible"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsibleModal;

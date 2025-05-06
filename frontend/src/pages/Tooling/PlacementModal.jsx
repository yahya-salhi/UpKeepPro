import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PlacementModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newPlacement) => {
      const { data } = await axios.post("/api/placements", newPlacement);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      toast.success("Placement added successfully");
      setName("");
      setDescription("");
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to add placement");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error("All fields are required");
      return;
    }
    mutation.mutate({ name, description });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Placement
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
                  placeholder="Placement name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description *
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Placement description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  {mutation.isLoading ? "Adding..." : "Add Placement"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PlacementModal;

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteTooling } from "./toolingApi";
import {
  AlertDialog,

  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const DeleteToolDialog = ({ isOpen, onClose, tool }) => {
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  // Mutation for deleting tool
  const mutation = useMutation({
    mutationFn: (id) => deleteTooling(id),
    onSuccess: () => {
      toast.success("Tool deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["toolings"] });
      onClose();
      setConfirmText("");
      setError("");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || error.message || "Failed to delete tool"
      );
    },
  });

  const handleDelete = () => {
    if (confirmText.toLowerCase() !== tool?.designation.toLowerCase()) {
      setError("Confirmation text does not match the tool designation");
      return;
    }
    
    mutation.mutate(tool._id);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Tool
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the tool{" "}
            <span className="font-semibold">{tool?.designation}</span> with MAT{" "}
            <span className="font-semibold">{tool?.mat}</span> and remove all its
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-3">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              To confirm, type the tool designation 
              <span className="font-semibold"> {tool?.designation}</span> below:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError("");
              }}
              placeholder="Type tool designation here"
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-medium">Warning:</span> Deleting this tool will remove all 
              associated history, including acquisitions, exits, and conversions.
            </p>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setConfirmText("");
              setError("");
            }}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={
              confirmText.toLowerCase() !== tool?.designation.toLowerCase() ||
              mutation.isPending
            }
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Tool"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteToolDialog;

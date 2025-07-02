import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteTooling, deleteToolHistoryEntry } from "./toolingApi";

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

const DeleteToolDialog = ({ isOpen, onClose, tool, historyEntry }) => {
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  const isDeletingHistoryEntry = !!historyEntry;

  // Mutation for deleting the entire tool
  const deleteToolMutation = useMutation({
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

  // Mutation for deleting a history entry
  const deleteHistoryEntryMutation = useMutation({
    mutationFn: ({ toolId, entryId }) =>
      deleteToolHistoryEntry(toolId, entryId),
    onSuccess: () => {
      toast.success("History entry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["toolHistory", tool._id] });
      queryClient.invalidateQueries({ queryKey: ["toolings"] });
      onClose();
      setConfirmText("");
      setError("");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to delete history entry"
      );
    },
  });

  const handleDelete = () => {
    if (isDeletingHistoryEntry) {
      if (
        confirmText.toLowerCase() !==
        (historyEntry?.reference || historyEntry?.eventType)?.toLowerCase()
      ) {
        setError("Confirmation text does not match the entry reference/type");
        return;
      }
      deleteHistoryEntryMutation.mutate({
        toolId: tool._id,
        entryId: historyEntry._id,
      });
    } else {
      if (confirmText.toLowerCase() !== tool?.designation.toLowerCase()) {
        setError("Confirmation text does not match the tool designation");
        return;
      }
      deleteToolMutation.mutate(tool._id);
    }
  };

  const titleText = isDeletingHistoryEntry
    ? "Delete History Entry"
    : "Delete Tool";
  const descriptionText = isDeletingHistoryEntry
    ? `This action cannot be undone. This will permanently delete the history entry with reference/type "${
        historyEntry?.reference || historyEntry?.eventType
      }" for tool "${tool?.designation}".`
    : `This action cannot be undone. This will permanently delete the tool "${tool?.designation}" with MAT "${tool?.mat}" and remove all its data from our servers.`;
  const confirmationPrompt = isDeletingHistoryEntry
    ? `To confirm, type the entry reference or event type ` +
      (historyEntry?.reference || historyEntry?.eventType) +
      ` below:`
    : `To confirm, type the tool designation ${tool?.designation} below:`;
  const confirmValue = isDeletingHistoryEntry
    ? historyEntry?.reference || historyEntry?.eventType
    : tool?.designation;
  const buttonText = isDeletingHistoryEntry ? "Delete Entry" : "Delete Tool";
  const isPending = isDeletingHistoryEntry
    ? deleteHistoryEntryMutation.isPending
    : deleteToolMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {titleText}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
            {descriptionText}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-3">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
              {confirmationPrompt}
            </p>
            <Input
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError("");
              }}
              placeholder={
                isDeletingHistoryEntry
                  ? "Type entry reference/type here"
                  : "Type tool designation here"
              }
              className={`dark:bg-gray-800 dark:text-gray-100 ${
                error ? "border-destructive" : ""
              }`}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          {!isDeletingHistoryEntry && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <span className="font-medium">Warning:</span> Deleting this tool
                will remove all associated history, including acquisitions,
                exits, and conversions.
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setConfirmText("");
              setError("");
            }}
            className="dark:bg-gray-800 dark:text-gray-100"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={
              confirmText.toLowerCase() !== confirmValue?.toLowerCase() ||
              isPending
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteToolDialog;

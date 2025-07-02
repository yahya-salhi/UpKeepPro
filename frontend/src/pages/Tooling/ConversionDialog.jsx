import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { fetchToolHistory } from "./toolingApi";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export const ConversionDialog = ({
  tool,
  onConvert,
  children,
  pvReference: initialPvReference,
}) => {
  const [pvEntries, setPvEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [conversionMode, setConversionMode] = useState("specific");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch tool history when dialog opens
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["toolHistory", tool?._id],
    queryFn: () => fetchToolHistory(tool?._id),
    enabled: isOpen && !!tool?._id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Extract PV entries from tool history when data is loaded
  useEffect(() => {
    if (isOpen && tool && historyData) {
      // Find all entry events with PV references
      const entries = historyData
        .filter(
          (entry) =>
            entry.eventType === "entry" && entry.reference?.startsWith("pv-")
        )
        .map((entry) => ({
          reference: entry.reference,
          date: new Date(entry.date).toLocaleDateString(),
          quantity: entry.qteChange,
          isMainAcquisition: entry.reference === `pv-${tool.acquisitionRef}`,
        }));

      setPvEntries(entries);

      // Auto-select the main acquisition entry or the initialPvReference
      if (initialPvReference) {
        setSelectedEntry(initialPvReference);
        setConversionMode("specific"); // Ensure specific mode if an initial PV reference is provided
      } else {
        const mainEntry = entries.find((e) => e.isMainAcquisition);
        if (mainEntry) {
          setSelectedEntry(mainEntry.reference);
        } else if (entries.length > 0) {
          setSelectedEntry(entries[0].reference);
        }
      }
    }
  }, [isOpen, tool, historyData, initialPvReference]);

  const onSubmit = (data) => {
    // Don't proceed if no PV entries are available and no initialPvReference
    if (pvEntries.length === 0 && !initialPvReference) return;

    const conversionData = {
      m11Ref: data.reference,
      m11Date: new Date(data.date).toISOString(),
      notes: data.notes,
    };

    // If converting a specific entry (either via selection or initial prop), add the PV reference
    if (
      conversionMode === "specific" &&
      (selectedEntry || initialPvReference)
    ) {
      conversionData.pvReference = initialPvReference || selectedEntry;
    }

    onConvert(conversionData);
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px] bg-white rounded-lg shadow-xl"
        aria-describedby="dialog-description"
      >
        {/* // Add aria-describedby for accessibility */}
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Convert PV to M11
          </DialogTitle>
          <p className="text-sm text-gray-500" id="dialog-description">
            Tool: <span className="font-medium">{tool.designation}</span> (
            {tool.mat})
          </p>
        </DialogHeader>
        {isLoadingHistory ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Loading tool history...
            </p>
          </div>
        ) : pvEntries.length === 0 && !initialPvReference ? (
          <div className="py-8 text-center" id="dialog-description">
            <div className="rounded-full bg-yellow-100 p-3 w-12 h-12 mx-auto flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No PV Entries Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This tool doesn&apos;t have any PV entries in its history that can
              be converted to M11.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="mx-auto"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Simplified UI for single PV entry or when initialPvReference is provided */}
            {pvEntries.length === 1 || initialPvReference ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-800 p-2 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600 dark:text-blue-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">
                      {initialPvReference
                        ? "Converting Selected PV Entry"
                        : "Single PV Entry Found"}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Converting PV entry:{" "}
                      <span className="font-medium">
                        {initialPvReference || pvEntries[0].reference}
                      </span>{" "}
                      from{" "}
                      {initialPvReference
                        ? historyData?.find(
                            (entry) => entry.reference === initialPvReference
                          )?.date
                        : pvEntries[0].date}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Quantity: +
                        {initialPvReference
                          ? historyData?.find(
                              (entry) => entry.reference === initialPvReference
                            )?.qteChange
                          : pvEntries[0].quantity}
                      </span>
                      {(initialPvReference
                        ? historyData?.find(
                            (entry) => entry.reference === initialPvReference
                          )?.isMainAcquisition
                        : pvEntries[0].isMainAcquisition) && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                        >
                          Main Acquisition
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  type="hidden"
                  {...register("conversionMode")}
                  value="specific"
                />
              </div>
            ) : (
              <>
                {/* Conversion Mode Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Select Conversion Mode
                  </Label>
                  <RadioGroup
                    defaultValue="specific"
                    className="space-y-2"
                    value={conversionMode}
                    onValueChange={(value) => {
                      setConversionMode(value);
                      // Register the value in the form
                      register("conversionMode").onChange({
                        target: { name: "conversionMode", value },
                      });
                    }}
                  >
                    <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="specific" id="specific" />
                      <Label
                        htmlFor="specific"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          Convert Specific PV Entry
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Convert an individual PV entry to M11 while keeping
                          others as PV
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="flex-1 cursor-pointer">
                        <div className="font-medium">
                          Convert All PV Entries
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Convert all PV entries to the same M11 reference
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <input
                    type="hidden"
                    {...register("conversionMode")}
                    value={conversionMode}
                  />
                </div>

                {/* PV Entry Selection - Only shown when specific conversion mode is selected */}
                {conversionMode === "specific" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Select PV Entry to Convert
                    </Label>
                    <div className="max-h-[150px] overflow-y-auto border rounded-md divide-y">
                      {pvEntries.map((entry, index) => {
                        const isSelected = selectedEntry === entry.reference;
                        return (
                          <div
                            key={index}
                            className={`p-3 cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "bg-primary/15 border-l-4 border-primary shadow-sm"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => setSelectedEntry(entry.reference)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {isSelected && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-primary"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                  {entry.reference}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Date: {entry.date}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  +{entry.quantity}
                                </span>
                                {entry.isMainAcquisition && (
                                  <Badge variant="outline" className="text-xs">
                                    Main
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Summary for All Conversion Mode */}
                {conversionMode === "all" && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-green-100 dark:bg-green-800 p-2 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-600 dark:text-green-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800 dark:text-green-300">
                          Converting All PV Entries
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          All {pvEntries.length} PV entries will be converted to
                          the same M11 reference.
                        </p>
                        <div className="mt-3 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/50 p-2 rounded">
                          <ul className="list-disc list-inside space-y-1">
                            {pvEntries.slice(0, 3).map((entry, index) => (
                              <li key={index}>
                                {entry.reference} ({entry.date})
                              </li>
                            ))}
                            {pvEntries.length > 3 && (
                              <li>
                                And {pvEntries.length - 3} more entries...
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* M11 Reference */}
            <div className="space-y-2">
              <Label
                htmlFor="reference"
                className="block text-sm font-medium text-gray-700"
              >
                M11 Reference Number *
              </Label>
              <Input
                id="reference"
                className={`w-full ${
                  errors.reference ? "border-red-500" : "border-gray-300"
                }`}
                {...register("reference", {
                  required: "M11 reference is required",
                  pattern: {
                    value: /^M11-/i,
                    message: "Reference must start with M11-",
                  },
                })}
                placeholder="M11-XXXX-XXXX"
              />
              {errors.reference && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.reference.message}
                </p>
              )}
            </div>

            {/* Conversion Date */}
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Conversion Date *
              </Label>
              <Input
                id="date"
                type="date"
                className={`w-full ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
                {...register("date", { required: "Date is required" })}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes
              </Label>
              <Input
                id="notes"
                className="w-full border-gray-300"
                {...register("notes")}
                placeholder="Optional notes about this conversion"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Converting..." : "Confirm Conversion"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

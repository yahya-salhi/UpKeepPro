import { useForm } from "react-hook-form";
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

export const ConversionDialog = ({ tool, onConvert, children }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = (data) => {
    onConvert({
      m11Ref: data.reference,
      m11Date: new Date(data.date).toISOString(),
      notes: data.notes,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Convert PV to M11
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Converting: <span className="font-medium">{tool.designation}</span>
            <br />
            Current PV:{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">
              {tool.acquisitionRef}
            </span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                  message: "Reference must start with M11",
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
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

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
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Converting..." : "Confirm Conversion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

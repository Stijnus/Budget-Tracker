import { useState, useEffect, useRef } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useAuth } from "../../../state/useAuth";
import { BillWithCategory, BillInsert } from "../../../api/supabase/bills";
import {
  showItemCreatedToast,
  showItemUpdatedToast,
  showErrorToast,
} from "../../../utils/toast";
import { getCategories } from "../../../api/supabase/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, Loader2 } from "lucide-react";

interface BillFormProps {
  bill?: BillWithCategory;
  onSubmit: (bill: BillInsert) => Promise<void>;
  onCancel: () => void;
  defaultType?: "bill" | "subscription";
}

export function BillForm({
  bill,
  onSubmit,
  onCancel,
  defaultType,
}: BillFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; color: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is a bill or subscription
  const isEdit = !!bill;
  const itemType: "bill" | "subscription" = isEdit
    ? bill?.frequency === "one-time"
      ? "bill"
      : "subscription"
    : defaultType || "bill";

  // react-hook-form setup
  const methods = useForm<BillInsert>({
    mode: "onBlur",
    defaultValues: {
      user_id: user?.id || "",
      name: bill?.name || "",
      amount: bill?.amount || 0,
      due_date: bill?.due_date || new Date().toISOString().split("T")[0],
      frequency: bill?.frequency || "monthly",
      category_id: bill?.category_id || "none",
      payment_method: bill?.payment_method || "",
      auto_pay: bill?.auto_pay || false,
      reminder_days: bill?.reminder_days || 7,
      notes: bill?.notes || "",
      status: bill?.status || "active",
    },
  });
  const { control, register, handleSubmit, formState } = methods;
  const { errors, isSubmitting, isValid } = formState;

  // Autofocus first input
  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await getCategories();
        if (error) throw error;
        const expenseCategories =
          data?.filter(
            (cat) => cat.type === "expense" || cat.type === "both"
          ) || [];
        setCategories(expenseCategories);
        if (
          methods.getValues("category_id") === "none" &&
          expenseCategories.length > 0 &&
          !bill
        ) {
          methods.setValue("category_id", expenseCategories[0].id);
        }
      } catch {
        setError("Failed to load categories");
      }
    }
    fetchCategories();
  }, [bill, methods]);

  // Submission logic
  const onFormSubmit = async (data: BillInsert) => {
    if (!user) {
      setError("You must be logged in to create a bill");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      data.user_id = user.id;
      if (data.category_id === "none") data.category_id = null;
      await onSubmit(data);
      if (bill) {
        showItemUpdatedToast(itemType);
      } else {
        showItemCreatedToast(itemType);
      }
    } catch {
      setError("Failed to save bill");
      showErrorToast(`Failed to save ${itemType}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-md border shadow p-6 flex flex-col h-full max-h-[90vh]">
      <FormProvider {...methods}>
        {/* Sticky header for mobile */}
        <div className="sticky top-0 z-10 bg-background/95 border-b p-4 flex items-center justify-between">
          <span className="font-semibold text-lg">
            {isEdit
              ? itemType === "subscription"
                ? "Edit Subscription"
                : "Edit Bill"
              : itemType === "subscription"
              ? "Add Subscription"
              : "Add Bill"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </Button>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Scrollable Form Fields */}
          <div className="space-y-4 overflow-y-auto flex-1 px-1 py-2" style={{ maxHeight: '60vh' }}>
            {/* Name */}
            <FormItem>
              <FormLabel>
                {itemType === "subscription"
                  ? "Subscription Name"
                  : "Bill Name"}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...register("name", { required: "Name is required" })}
                  placeholder={
                    itemType === "subscription"
                      ? "e.g., Netflix Subscription"
                      : "e.g., Car Repair"
                  }
                  required
                  ref={nameInputRef}
                  aria-invalid={!!errors.name}
                  aria-describedby="name-error"
                />
              </FormControl>
              <FormDescription>
                Give your {itemType} a clear, recognizable name.
              </FormDescription>
              <FormMessage>{errors.name?.message}</FormMessage>
            </FormItem>

            {/* Amount */}
            <FormItem>
              <FormLabel>
                Amount <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("amount", {
                      required: "Amount is required",
                      valueAsNumber: true,
                      min: { value: 0.01, message: "Must be greater than 0" },
                    })}
                    placeholder="0.00"
                    required
                    className="pl-7"
                    aria-invalid={!!errors.amount}
                    aria-describedby="amount-error"
                  />
                </div>
              </FormControl>
              <FormMessage>{errors.amount?.message}</FormMessage>
            </FormItem>

            {/* Due Date */}
            <FormItem>
              <FormLabel>
                Due Date <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...register("due_date", {
                    required: "Due date is required",
                  })}
                  required
                  aria-invalid={!!errors.due_date}
                  aria-describedby="due-date-error"
                />
              </FormControl>
              <FormMessage>{errors.due_date?.message}</FormMessage>
            </FormItem>

            {/* Frequency (Subscription only) */}
            {itemType === "subscription" && (
              <FormItem>
                <FormLabel>
                  Frequency <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Controller
                    control={control}
                    name="frequency"
                    rules={{ required: "Frequency is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormControl>
                <FormMessage>{errors.frequency?.message}</FormMessage>
              </FormItem>
            )}

            {/* Category */}
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormControl>
            </FormItem>

            {/* Payment Method */}
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <Input
                  {...register("payment_method")}
                  placeholder="e.g., Credit Card"
                />
              </FormControl>
            </FormItem>

            {/* Auto Pay */}
            <FormItem>
              <FormLabel>Auto Pay</FormLabel>
              <FormControl>
                <Controller
                  control={control}
                  name="auto_pay"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="ml-2"
                    />
                  )}
                />
              </FormControl>
            </FormItem>

            {/* Reminder Days */}
            <FormItem>
              <FormLabel>Reminder Days</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...register("reminder_days", { valueAsNumber: true })}
                  placeholder="Days before due date"
                />
              </FormControl>
            </FormItem>

            {/* Status */}
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormControl>
            </FormItem>

            {/* Notes */}
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...register("notes")}
                  placeholder="Optional notes, e.g., login info or payment details"
                />
              </FormControl>
            </FormItem>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSubmitting || !isValid}
              className="flex items-center"
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save"
              ) : itemType === "subscription" ? (
                "Add Subscription"
              ) : (
                "Add Bill"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

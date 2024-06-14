"use client";

import { updateTransaction } from "@/app/dashboard/_actions/transaction";
import BankPicker from "@/app/dashboard/_components/bank-picker";
import CategoryPicker from "@/app/dashboard/_components/category-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateToUTCDate } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  UpdateTransactionSchema,
  UpdateTransactionSchemaType,
} from "@/schema/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { Transaction } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { ReactNode, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  trigger?: ReactNode;
  open: boolean;
  setOpen: () => void;
  initialData: Transaction;
  type: TransactionType;
}
const UpdateTransactionDialog: React.FC<Props> = ({
  trigger,
  open,
  setOpen,
  initialData,
  type,
}) => {
  const form = useForm<UpdateTransactionSchemaType>({
    resolver: zodResolver(UpdateTransactionSchema),
    defaultValues: {
      date: new Date(initialData.date),
      transactionId: initialData.id,
      type: initialData.type as TransactionType,
      description: initialData.description,
      amount: initialData.amount,
      category: initialData.category,
      previousAmount: initialData.amount,
      accountId: initialData.accountId,
      previousAccountId: initialData.accountId,
      previousDate: initialData.date,
    },
  });

  const handleCategoryChange = useCallback(
    (value: string) => {
      form.setValue("category", value);
    },
    [form]
  );
  const handleBankChange = useCallback(
    (id: string) => {
      form.setValue("accountId", id);
    },
    [form]
  );

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      toast.success("Transaction updated successfully 🎉", {
        id: "update-transaction",
      });

      form.reset({
        type: "income",
        description: "",
        amount: 0,
        date: new Date(),
        category: undefined,
        accountId: "",
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      setOpen();
    },
    onError: (error) => {
      toast.error(error.message, {
        id: "update-transaction",
      });
    },
  });

  const onSubmit = useCallback(
    (values: UpdateTransactionSchemaType) => {
      console.log(values);

      mutate({
        ...values,
        date: DateToUTCDate(values.date),
      });
    },
    [mutate]
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Update{" "}
            <span
              className={cn(
                type === "income" ? "text-emerald-500" : "text-rose-500",
                "m-1"
              )}
            >
              {type}
            </span>{" "}
            transaction
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} defaultValue="" />
                  </FormControl>
                  <FormDescription>
                    Transaction description (optional)
                  </FormDescription>
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between gap-2 w-full">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-1">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} defaultValue={0} />
                    </FormControl>
                    <FormDescription>
                      Transaction amount (required)
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-1">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CategoryPicker
                        defaultSelect={initialData.category}
                        type={type}
                        onChange={handleCategoryChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Category for this transaction
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between gap-2 w-full">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-1">
                    <FormLabel>Transaction Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            variant="outline"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(value) => {
                            if (!value) return;
                            field.onChange(value);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <FormDescription>Select a date for this</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-1">
                    <FormLabel>Account</FormLabel>
                    <FormControl>
                      <BankPicker
                        defaultSelect={initialData.accountId}
                        type={type}
                        onChange={handleBankChange}
                      />
                    </FormControl>
                    <FormDescription>Bank for this transaction</FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                form.reset();
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {!isPending && "Update"}
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTransactionDialog;

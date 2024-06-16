"use client";

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
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateTransaction } from "../_actions/transaction";
const CategoryPicker = dynamic(() => import("./category-picker"), {
  ssr: false,
});
const BankPicker = dynamic(() => import("./bank-picker"), {
  ssr: false,
});

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}
const CreateTransactionDialog: React.FC<Props> = ({ trigger, type }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
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
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("Transaction created successfully 🎉", {
        id: "create-transaction",
      });

      form.reset({
        type,
        description: "",
        amount: 0,
        date: new Date(),
        category: undefined,
        accountId: "",
      });

      queryClient.invalidateQueries({
        queryKey: ["overview"],
      });

      setOpen((prev) => !prev);
    },
    onError: (error) => {
      toast.error(error.message, {
        id: "create-transaction",
      });
      console.log();
    },
  });

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      mutate({
        ...values,
        date: DateToUTCDate(values.date),
      });
    },
    [mutate]
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create a new{" "}
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
                      <BankPicker type={type} onChange={handleBankChange} />
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
          <Button
            className="mb-2 md:mb-0"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {!isPending && "Create"}
            {isPending && (
              <span className="flex items-center gap-x-3">
                <Loader2 className="animate-spin h-4 w-4" />
                Saving
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionDialog;

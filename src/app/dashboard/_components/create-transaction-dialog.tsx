"use client";
import {
  DialogClose,
  DialogContainer,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  MotionDialog,
} from "@/components/ui/motion-dialog";

import { Button } from "@/components/ui/button";
import CustomField from "@/components/ui/CustomField";
import { Form } from "@/components/ui/form";
import { DateToUTCDate } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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

export enum FieldType {
  INPUT = "input",
  SKELETON = "skeleton",
  DATE_PICKER = "date",
}

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}
const CreateTransactionDialog: React.FC<Props> = ({ trigger, type }) => {
  const [isOpen, setIsOpen] = useState(false);

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

      setIsOpen((prev) => !prev);
    },
    onError: (error) => {
      console.log(error);
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
    <>
      <MotionDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        transition={{
          type: "just",
          bounce: 0.05,
          duration: 0.45,
        }}
      >
        <DialogTrigger>{trigger}</DialogTrigger>
        <DialogContainer>
          <DialogContent
            style={{
              borderRadius: "24px",
            }}
            className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 sm:w-[500px]"
          >
            <div className="p-6">
              <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
                Create a new{" "}
                <span
                  className={cn(
                    type === "income" ? "text-emerald-500" : "text-rose-500",
                    "m-1"
                  )}
                >
                  {type}
                </span>{" "}
                Transaction
              </DialogTitle>
              <DialogDescription
                disableLayoutAnimation
                variants={{
                  initial: { opacity: 0, scale: 0.8, y: 100 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.8, y: 100 },
                }}
                className="mt-4"
              >
                <Form {...form}>
                  <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <CustomField
                      control={form.control}
                      name="description"
                      fieldType={FieldType.INPUT}
                      label="Description"
                      description="Transaction description (optional)"
                    />
                    <div className="flex items-center justify-between gap-2 w-full">
                      <CustomField
                        control={form.control}
                        name="amount"
                        fieldType={FieldType.INPUT}
                        label="Amount"
                        description=" Transaction amount (required)"
                      />
                      <CustomField
                        control={form.control}
                        name="category"
                        fieldType={FieldType.SKELETON}
                        label="Category"
                        description="Category for this transaction"
                        renderSkeleton={(field) => (
                          <CategoryPicker
                            type={type}
                            onChange={handleCategoryChange}
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 w-full">
                      <CustomField
                        control={form.control}
                        name="date"
                        fieldType={FieldType.DATE_PICKER}
                        label="Transaction Date"
                        description="Select a date for this"
                      />
                      <CustomField
                        control={form.control}
                        name="accountId"
                        fieldType={FieldType.SKELETON}
                        label="Account"
                        description="Bank for this transaction"
                        renderSkeleton={(field) => (
                          <BankPicker type={type} onChange={handleBankChange} />
                        )}
                      />
                    </div>
                  </form>
                </Form>
                <DialogFooter
                  className="mt-4 flex justify-end gap-x-4"
                  onClose={() => form.reset()}
                >
                  <Button
                    className="mb-2 md:mb-0"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isPending}
                    id="button"
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
              </DialogDescription>
            </div>
            <DialogClose className="text-foreground" />
          </DialogContent>
        </DialogContainer>
      </MotionDialog>
    </>
  );
};

export default CreateTransactionDialog;

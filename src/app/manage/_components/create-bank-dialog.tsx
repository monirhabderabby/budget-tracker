"use client";

// Packages
import { zodResolver } from "@hookform/resolvers/zod";
import { Account } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusSquare } from "lucide-react";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Components

import BankSelectionBox from "@/components/ui/bank-selections-box";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  BankSelectionFormSchema,
  BankSelectionFormSchemaType,
} from "@/schema/bank";
import { updateBankAccount } from "../_actions/bank";

interface Props {
  successCallback: (data: string) => void;
  trigger?: ReactNode;
}

const CreateBankDialog = ({ successCallback, trigger }: Props) => {
  const [open, setOpen] = useState(false);

  // Initialize form with validation schema
  const form = useForm<BankSelectionFormSchemaType>({
    resolver: zodResolver(BankSelectionFormSchema),
    defaultValues: {},
  });

  // Fetch bank data from API
  const { data, isLoading } = useQuery({
    queryKey: ["banks"],
    queryFn: () => fetch("/api/bank").then((res) => res.json()),
  });

  const queryClient = useQueryClient();

  // Mutation for updating bank account
  const { mutate, isPending } = useMutation({
    mutationFn: updateBankAccount,
    onSuccess: async (data) => {
      // On success, show toast, reset form, and refresh bank data
      toast.success("Account action successfully.", {
        id: "add-bank",
      });
      form.reset();
      successCallback("");

      await queryClient.invalidateQueries({
        queryKey: ["banks"],
      });

      setOpen((prev) => !prev);
    },
    onError: () => {
      // On error, show error toast
      toast.error("Something went wrong", {
        id: "add-bank",
      });
    },
  });

  const onSubmit = useCallback(
    (values: BankSelectionFormSchemaType) => {
      // Trigger mutation to update bank account
      mutate(values);
    },
    [mutate]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Create new
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create <span className={cn("m-1 text-emerald-500")}>Bank</span>
            details
          </DialogTitle>
          <DialogDescription className="pt-2">
            💡 Please note: Removing your bank account will permanently lose its
            balance, but your transaction history will remain
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-5 my-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="banks"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <BankSelectionBox
                      onValueSelect={(selected) => field.onChange(selected)}
                      isLoading={isLoading}
                      defaultValue={data.map((bank: Account) => ({
                        value: bank.accountLogo,
                        label: bank.accountName,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            disabled={isPending}
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
          >
            {!isPending && "I'm done"}
            {isPending && (
              <div className="flex items-center gap-x-2">
                <Loader2 className="animate-spin h-4 w-4" /> <span>Wait</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBankDialog;

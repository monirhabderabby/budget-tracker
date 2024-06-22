"use client";

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
import FileUpload from "@/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CreateBankSchema, CreateBankSchemaType } from "@/schema/bank";
import { zodResolver } from "@hookform/resolvers/zod";
import { Account } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusSquare } from "lucide-react";
import Image from "next/image";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { addBankAccount } from "../_actions/bank";

interface Props {
  successCallback: (account: Account) => void;
  trigger?: ReactNode;
}

const CreateBankDialog = ({ successCallback, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateBankSchemaType>({
    resolver: zodResolver(CreateBankSchema),
    defaultValues: {
      accountName: "",
      accountLogo: "",
    },
  });

  const { watch } = form;

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: addBankAccount,
    onSuccess: async (data: Account) => {
      toast.success(`Added ${data.accountName} account successfully 🎉`, {
        id: "add-bank",
      });

      form.reset({
        accountLogo: "",
        accountName: "",
      });
      successCallback(data);

      await queryClient.invalidateQueries({
        queryKey: ["banks"],
      });

      setOpen((prev) => !prev);
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "add-bank",
      });
    },
  });

  const onSubmit = useCallback(
    (values: CreateBankSchemaType) => {
      toast.loading("Adding a bank account", {
        id: "add-bank",
      });

      // mutate now
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
          <DialogDescription>
            Categories are used to group your transactions
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Cash/Bkash/Nagad/Bank Name"
                    />
                  </FormControl>
                  <FormDescription>
                    Please note: You cannot change the bank name later.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  {watch("accountLogo") ? (
                    <div className="relative w-full h-[206px] rounded-md border-dotted border-[1px] border-input flex flex-col justify-center items-center gap-y-3">
                      <div className="relative h-[66px] w-[66px]  rounded-md">
                        <Image src={watch("accountLogo")} alt="Logo" fill />
                      </div>
                      <Button
                        variant="link"
                        onClick={() => form.resetField("accountLogo")}
                      >
                        Change Logo
                      </Button>
                    </div>
                  ) : (
                    <FormControl>
                      <FileUpload
                        endpoint="logo"
                        onChange={(urls) => field.onChange(urls[0].url)}
                      />
                    </FormControl>
                  )}

                  <FormDescription>
                    This is will be your bank account logo
                  </FormDescription>
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
          <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
            {!isPending && "Create"}
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBankDialog;

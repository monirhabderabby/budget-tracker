"use client";

// Packages
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Components
import { UpdateWizerdSettings } from "@/app/wizerd/_actions/wizerd-settings";
import { useConfettiStore } from "@/hooks/useConfettiStore";
import { WizerdSchema, WizerdSchemaType } from "@/schema/wizerd.schema";
import { BankAccountInputType } from "@/types";
import BankSelectionBox from "./bank-selections-box";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import CurrencyComboBox from "./currency-combobox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./form";

const Wizerd = () => {
  // Initialize the form with schema validation using Zod and default values
  const form = useForm<WizerdSchemaType>({
    resolver: zodResolver(WizerdSchema),
    defaultValues: {},
  });

  const router = useRouter();
  const confetti = useConfettiStore();
  const queryClient = useQueryClient();

  // Mutation to update wizard settings, handles success and error cases
  const { mutate, isPending } = useMutation({
    mutationFn: UpdateWizerdSettings,
    onSuccess: (data: { success: boolean; error?: string }) => {
      if (!data.success) {
        toast.error(data.error!); // Show error toast if unsuccessful
        return;
      }

      // Show success toast and redirect to dashboard on successful mutation
      toast.success("Your account is all set up and ready to go. 🎉");

      router.push("/dashboard");
      confetti.onOpen(); // Trigger confetti animation
      queryClient.invalidateQueries({ queryKey: ["user-currency"] });
    },
    onError: (error: any) => {
      toast.error(error.message); // Show error toast if mutation fails
    },
  });

  // Form submit handler that triggers the mutation
  function onSubmit(values: WizerdSchemaType) {
    mutate(values);
  }
  return (
    <Form {...form}>
      <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Currency</CardTitle>
                  <CardDescription>
                    Set your default currency for transaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormControl>
                    <CurrencyComboBox
                      isLoading={isPending}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="banks"
          render={({ field }) => (
            <FormItem>
              <Card>
                <CardHeader>
                  <CardTitle>Banks</CardTitle>
                  <CardDescription>
                    Set your banks for transaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormControl>
                    <BankSelectionBox
                      onValueSelect={(data: BankAccountInputType[]) =>
                        field.onChange(data)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-x-3">
              <Loader2 className="animate-spin h-4 w-4" />
              Preparing your dashboard...
            </span>
          ) : (
            "I'm done! Take me to the dashboard"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default Wizerd;

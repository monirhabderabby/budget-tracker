"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { MoneyTransferSchema, MoneyTransferSchemaType } from "@/schema/bank";
import { zodResolver } from "@hookform/resolvers/zod";
import { Account } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useCallback, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { moneyTransfer } from "../_actions/bank";
import AccountSelector from "./account-selector";

const MoneyTransfer = () => {
  const [isLoading, startTransition] = useTransition();
  const form = useForm<MoneyTransferSchemaType>({
    resolver: zodResolver(MoneyTransferSchema),
    defaultValues: {
      from: "",
      to: "",
      amount: 0,
    },
  });

  const queryClient = useQueryClient();

  const bankListQuery = useQuery<Account[]>({
    queryKey: ["banks"],
    queryFn: () => fetch(`/api/bank`).then((res) => res.json()),
  });

  const handleFromAccount = useCallback(
    (id: string) => {
      form.setValue("from", id);
    },
    [form]
  );
  const handleToAccount = useCallback(
    (id: string) => {
      form.setValue("to", id);
    },
    [form]
  );

  const handleAmount = useCallback(
    (amount: number) => {
      form.clearErrors();
      form.setValue("amount", amount);
    },
    [form]
  );

  const onSubmit = async (values: MoneyTransferSchemaType) => {
    startTransition(() => {
      moneyTransfer(values)
        .then((res) => {
          if (res.error) {
            toast.error(res.error as string);
            return;
          }

          if (res.success) {
            toast.success(res.success as string);
            queryClient.invalidateQueries({
              queryKey: ["banks"],
            });
            form.reset();
          }
        })
        .catch((error: any) => {
          toast.error(error.message);
        })
        .finally(() => {
          form.resetField("amount");
          form.resetField("from");
          form.resetField("to");
        });
    });
  };
  return (
    <div className="py-6">
      <SkeletonWrapper isLoading={bankListQuery.isLoading}>
        <Card className="w-full">
          <CardContent className="p-6 w-full flex items-center gap-6 justify-start">
            <AccountSelector
              banks={bankListQuery.data || []}
              value={form.watch("from")}
              onChange={(id) => handleFromAccount(id)}
            />
            <Badge variant="secondary">
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </Badge>
            <AccountSelector
              banks={bankListQuery.data || []}
              value={form.watch("to")}
              onChange={(id) => handleToAccount(id)}
            />
            <Input
              type="number"
              className={`${
                form.formState.errors.amount ? "border-red-500" : ""
              }`}
              placeholder="AMOUNT"
              value={form.watch("amount")}
              onChange={(e) => handleAmount(e.target.valueAsNumber)}
            />
            <Button
              onClick={form.handleSubmit(onSubmit)}
              type="submit"
              disabled={isLoading}
            >
              <span className="flex items-center gap-x-3">
                {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
                Transfer
              </span>
            </Button>
          </CardContent>
        </Card>
      </SkeletonWrapper>
    </div>
  );
};

export default MoneyTransfer;

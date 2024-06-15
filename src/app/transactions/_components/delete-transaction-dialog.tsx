"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteTransaction, bulkDelete } from "../_actions/delete-transaction";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  transactionIds: string[];
  deletionType: "single" | "bulk";
}

function DeleteTransactionDialog({
  open,
  setOpen,
  transactionIds,
  deletionType,
}: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteTransaction,
    onSuccess: async () => {
      toast.success("Transaction deleted successfully", {
        id: deletionType === "single" ? "single" : "bilk",
      });

      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong", {
        id: deletionType === "single" ? "single" : "bilk",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDelete,
    onSuccess: async (data) => {
      toast.success("Transactions deleted successfully", {
        id: deletionType === "single" ? "single" : "bilk",
      });

      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },

    onError: (error) => {
      toast.error(error.message, {
        id: deletionType === "single" ? "single" : "bilk",
      });
    },
  });

  const transactionDeleteAction = () => {
    const loaderText =
      deletionType === "bulk"
        ? "Deleting selected transaction..."
        : "Deleting transaction...";
    toast.loading(loaderText, {
      id: deletionType === "single" ? "single" : "bilk",
    });

    if (deletionType === "single") {
      deleteMutation.mutate(transactionIds[0]);
    } else if (deletionType === "bulk") {
      bulkDeleteMutation.mutate(transactionIds);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {deletionType === "single" &&
              "This action cannot be undone. This will permanently delete your transaction"}

            {deletionType === "bulk" && (
              <p>
                <span className="text-red-500">
                  Are you sure you want to delete all {transactionIds.length}{" "}
                  transactions?
                </span>
                <br /> This will permanently delete your transactions
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
            onClick={transactionDeleteAction}
          >
            Continue{" "}
            {deleteMutation.isPending ||
              (bulkDeleteMutation.isPending && (
                <span className="ml-2 duration-300">
                  <Loader2 className="animate-spin h-4 w-4 text-muted" />
                </span>
              ))}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteTransactionDialog;

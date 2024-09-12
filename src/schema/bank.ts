import { z } from "zod";

export const CreateBankSchema = z.object({
  accountName: z.string().min(4),
  accountLogo: z.string().min(10),
});

export type CreateBankSchemaType = z.infer<typeof CreateBankSchema>;

export const MoneyTransferSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number(),
});

export type MoneyTransferSchemaType = z.infer<typeof MoneyTransferSchema>;

export const BankSelectionFormSchema = z.object({
  banks: z.array(
    z.object({
      accountLogo: z.string().min(1, "Account logo is required"),
      accountName: z.string().min(1, "Account name is required"),
      amount: z.number().min(0, "Amount must be at least 0"),
      userId: z.string().min(1, "User ID is required"),
    }),
    {
      message: "Please select at least one bank account",
    }
  ),
});

export type BankSelectionFormSchemaType = z.infer<
  typeof BankSelectionFormSchema
>;

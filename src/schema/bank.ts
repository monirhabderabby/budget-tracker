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
  banks: z
    .array(z.string().min(1))
    .min(1)
    .nonempty("Please select at least one bank"),
});

export type BankSelectionFormSchemaType = z.infer<
  typeof BankSelectionFormSchema
>;

import { z } from "zod";

export const CreateTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.union([z.literal("income"), z.literal("expense")]),
  accountId: z.string(),
});

export type CreateTransactionSchemaType = z.infer<
  typeof CreateTransactionSchema
>;

export const UpdateTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.union([z.literal("income"), z.literal("expense")]),
  accountId: z.string(),
  transactionId: z.string(),
  previousAmount: z.coerce.number().positive().multipleOf(0.01),
  previousAccountId: z.string(),
  previousDate: z.coerce.date(),
});

export type UpdateTransactionSchemaType = z.infer<
  typeof UpdateTransactionSchema
>;

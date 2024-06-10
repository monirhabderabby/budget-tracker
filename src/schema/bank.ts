import { z } from "zod";

export const CreateBankSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01).default(0),
  accountName: z.string().min(4),
  accountLogo: z.string().min(10),
});

export type CreateBankSchemaType = z.infer<typeof CreateBankSchema>;

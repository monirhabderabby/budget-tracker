import { z } from "zod";

export const CreateBankSchema = z.object({
  accountName: z.string().min(4),
  accountLogo: z.string().min(10),
});

export type CreateBankSchemaType = z.infer<typeof CreateBankSchema>;

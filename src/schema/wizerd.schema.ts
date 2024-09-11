import * as z from "zod";

export const WizerdSchema = z.object({
  currency: z.string({
    message: "Please select your currency",
  }),
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

export type WizerdSchemaType = z.infer<typeof WizerdSchema>;

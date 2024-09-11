import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CurrencyComboBox from "@/components/ui/currency-combobox";
import { UserSettings } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UpdateUserCurrency } from "../_actions/user-settings";

const CurrencyChanger = () => {
  const queryClient = useQueryClient();

  // Fetch the user's active currency from the server
  const { data, isLoading } = useQuery<UserSettings>({
    queryKey: ["user-currency"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
  });

  // Mutation to update the user's currency
  const { mutate, isPending } = useMutation({
    mutationFn: UpdateUserCurrency,
    onSuccess: () => {
      toast.success("Currency updated successfully. 🎉");
      queryClient.invalidateQueries({ queryKey: ["user-currency"] }); // Refresh the currency data after update
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCurrrencyChange = (value: string) => {
    mutate(value); // Trigger currency update
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Set your default currency for transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyComboBox
            isLoading={isPending || isLoading} // Show loading state
            skeleton
            onValueChange={(data) => handleCurrrencyChange(data)} // Handle currency change
            defaultValue={data?.currency}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default CurrencyChanger;

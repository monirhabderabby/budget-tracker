"use client";

// Packages
import { Account, UserSettings } from "@prisma/client";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import CountUp from "react-countup";

// Components
import { Card } from "@/components/ui/card";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";

// Types for params
interface Props {
  userSettings: UserSettings;
}

const BankStats = ({ userSettings }: Props) => {
  const bankListQuery = useQuery<Account[]>({
    queryKey: ["banks"],
    queryFn: () => fetch(`/api/bank`).then((res) => res.json()),
    refetchOnReconnect: true,
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div>
      <div className=" relative flex w-full flex-wrap gap-3 md:flex-nowrap py-6">
        <SkeletonWrapper isLoading={false}>
          {bankListQuery.data?.map((account: Account) => (
            <StatCard
              key={account.id}
              name={account.accountName}
              logo={account.accountLogo}
              amount={account.amount}
              formatter={formatter}
            />
          ))}
        </SkeletonWrapper>
      </div>
    </div>
  );
};

export default BankStats;

function StatCard({
  name,
  logo,
  amount,
  formatter,
}: {
  name: string;
  logo: string;
  amount: number;
  formatter: Intl.NumberFormat;
}) {
  const formatFn = useCallback(
    (value: number) => {
      return formatter.format(value);
    },
    [formatter]
  );

  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      <Image
        height={38}
        width={38}
        src={logo}
        alt={name}
        className="aspect-square"
      />
      <div className="flex flex-col items-start gap-0">
        <p className="text-muted-foreground">{name}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={amount}
          decimals={2}
          formattingFn={formatFn}
          className="text-2xl"
        />
      </div>
    </Card>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { Account, UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import CountUp from "react-countup";

interface Props {
  userSettings: UserSettings;
}

const BankStats = ({ userSettings }: Props) => {
  const bankListQuery = useQuery<Account[]>({
    queryKey: ["banks"],
    queryFn: () => fetch(`/api/bank`).then((res) => res.json()),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div>
      <div className=" relative flex w-full flex-wrap gap-3 md:flex-nowrap py-6">
        <SkeletonWrapper isLoading={bankListQuery.isFetching}>
          {bankListQuery.data?.map((account: Account) => (
            <StatCard
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
      <Image height={48} width={48} src={logo} alt={name} />
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

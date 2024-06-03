"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CurrencyComboBox from "@/components/ui/currency-combobox";
import { Separator } from "@/components/ui/separator";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { PlusSquare, TrashIcon, TrendingDown, TrendingUp } from "lucide-react";
import CreateCategoryDialog from "../dashboard/_components/create-category-dialog";
import DeleteCategoryDialog from "../dashboard/_components/delete-category-dialog";

const Page = () => {
  return (
    <>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">Manage</p>
            <p>Manage your account settings and categories</p>
          </div>
        </div>
      </div>
      {/* END HEADER */}
      <div className="container flex flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Set your default currency for transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyComboBox />
          </CardContent>
        </Card>
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  );
};

export default Page;

function CategoryList({ type }: { type: TransactionType }) {
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  });

  const dataAvailable = categoriesQuery.data && categoriesQuery.data.length > 0;
  return (
    <SkeletonWrapper isLoading={categoriesQuery.isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {type === "expense" ? (
                <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
              ) : (
                <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
              )}
              <div>
                <p className="text-[18px] md:text-[20px]">
                  {type === "income" ? "Income" : "Expense"} categories
                </p>
                <div className="text-sm text-muted-foreground">
                  Sorted by name
                </div>
              </div>
            </div>

            <CreateCategoryDialog
              type={type}
              successCallback={() => {
                categoriesQuery.refetch();
              }}
              trigger={
                <Button className="gap-2 text-sm" size="sm">
                  <PlusSquare className="h-4 w-4" />
                  Create category
                </Button>
              }
            />
          </CardTitle>
        </CardHeader>
        <Separator />
        {!dataAvailable && (
          <div className="flex h-40 w-full flex-col items-center justify-center">
            <p>
              No{" "}
              <span
                className={cn(
                  "m-1 ",
                  type === "income" ? "text-emerald-500" : "text-red-500"
                )}
              >
                {type}
              </span>
              categories yet
            </p>
            <p className="text-sm text-muted-foreground ">
              Create one to get started
            </p>
          </div>
        )}
        {dataAvailable && (
          <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {categoriesQuery?.data?.map((category: Category) => (
              <CategoryCard category={category} key={category.id} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex border-separate flex-col justify-between rounded-md border shadow-sm shadow-black/[0.1] dark:shadow-white/[0.1]">
      <div className="flex flex-col items-center gap-2 p-4">
        <span className="text-3xl " role="img">
          {category.icon}
        </span>
        <span>{category.name}</span>
      </div>
      <DeleteCategoryDialog
        category={category}
        trigger={
          <Button
            className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20"
            variant="secondary"
          >
            <TrashIcon className="w-4 h-4" />
            Remove
          </Button>
        }
      />
    </div>
  );
}

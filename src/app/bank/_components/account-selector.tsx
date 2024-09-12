"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Account } from "@prisma/client";
import { Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface Props {
  onChange: (value: string) => void;
  banks: Account[] | [];
  value: string;
}

const AccountSelector: React.FC<Props> = ({ onChange, banks, value }) => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   if (!value) {
  //     return;
  //   }

  //   // when the value change, call the on Change callback
  //   onChange(value);
  // }, [value, onChange]);

  const successCallbak = useCallback(
    (account: Account) => {
      // setValue(account.id);
      onChange(account.id);
      setOpen((prev) => !prev);
    },
    [setOpen]
  );
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const selectedBankList = banks?.find(
    (account: Account) => account.id === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full  justify-between")}
        >
          {selectedBankList ? (
            <BankRow account={selectedBankList} />
          ) : (
            "Select category"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[300px] p-0">
        <Command
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>
            <p>Category not found</p>
            <p className="text-xs text-muted-foreground">
              Tip: Create a new category
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {banks.length > 1 &&
                banks.map((account: Account) => (
                  <CommandItem
                    key={account.id}
                    onSelect={(currentvalue) => {
                      onChange(account.id);
                      setOpen((prev) => !prev);
                    }}
                  >
                    <BankRow account={account} />
                    <Check
                      className={cn(
                        "mr-2 w-4 h-4 opacity-0",
                        value === account.id && "opacity-100"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AccountSelector;

function BankRow({ account }: { account: Account }) {
  return (
    <div className="flex items-center gap-2">
      <Image
        width={40}
        height={40}
        src={account.accountLogo}
        alt={account.accountName}
      />
      <span>{account.accountName}</span>
    </div>
  );
}

"use client";

// Packages
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Detect screen width (desktop vs mobile)
import { Currencies, Currency } from "@/lib/currency";
import * as React from "react";
import { toast } from "sonner";
import SkeletonWrapper from "./skeleton-wrapper";

// Props interface for the CurrencyComboBox component
interface CurrencyComboBoxProps {
  onValueChange: (currency: string) => void;
  isLoading?: boolean;
  skeleton?: boolean;
  defaultValue?: string | null;
}

export default function CurrencyComboBox({
  onValueChange,
  isLoading,
  skeleton = false,
  defaultValue,
}: CurrencyComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>();

  React.useEffect(() => {
    if (defaultValue) {
      const currency =
        Currencies.filter((c) => c.value === defaultValue)[0] || null;
      setSelectedOption(currency);
    }
  }, [defaultValue]);

  // Handle currency selection
  const selectOption = React.useCallback((currency: Currency | null) => {
    if (!currency) {
      toast.error("Please select a currency");
      return;
    }

    setSelectedOption(currency);
    onValueChange(currency?.value);
  }, []);

  const desktopContent = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={isLoading}
        >
          {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <StatusList setOpen={setOpen} setSelectedOption={selectOption} />
      </PopoverContent>
    </Popover>
  );

  if (isDesktop) {
    return skeleton && isLoading ? (
      <SkeletonWrapper isLoading>{desktopContent}</SkeletonWrapper>
    ) : (
      desktopContent
    );
  }

  const mobileContent = (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={isLoading}
        >
          {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <StatusList setOpen={setOpen} setSelectedOption={selectOption} />
        </div>
      </DrawerContent>
    </Drawer>
  );

  return skeleton && isLoading ? (
    <SkeletonWrapper isLoading>{mobileContent}</SkeletonWrapper>
  ) : (
    mobileContent
  );
}

// Component to list available currency options
function StatusList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void;
  setSelectedOption: (status: Currency | null) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter status..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Currencies.map((item: Currency) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={(value) => {
                setSelectedOption(
                  Currencies.find((priority) => priority.value === value) ||
                    null
                );
                setOpen(false);
              }}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

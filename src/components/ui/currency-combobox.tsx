"use client";

// Packages
import * as React from "react";
import { toast } from "sonner";

// Components
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
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Hook for detecting screen width (desktop vs mobile)
import { Currencies, Currency } from "@/lib/currency";

// Props interface for the CurrencyComboBox component
interface CurrencyComboBoxProps {
  onValueChange: (currency: string) => void;
  isLoading?: boolean;
}

export default function CurrencyComboBox({
  onValueChange,
  isLoading,
}: CurrencyComboBoxProps) {
  const [open, setOpen] = React.useState(false); // State to manage whether the drawer/popover is open
  const isDesktop = useMediaQuery("(min-width: 768px)"); // Check if the screen size is desktop or mobile
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>(
    null
  ); // State to manage the selected currency option

  // Function to handle the selection of a currency
  const selectOption = React.useCallback((currency: Currency | null) => {
    if (!currency) {
      toast.error("Please select a currency"); // Show error if no currency is selected
      return;
    }

    setSelectedOption(currency);
    onValueChange(currency?.value);
  }, []);

  // Render different UI for desktop and mobile
  if (isDesktop) {
    return (
      // Use Popover for desktop
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={isLoading}
          >
            {/* Show selected currency label or default text */}
            {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <StatusList setOpen={setOpen} setSelectedOption={selectOption} />
        </PopoverContent>
      </Popover>
    );
  }

  // Use Drawer for mobile
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={isLoading}
        >
          {/* Show selected currency label or default text */}
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
}

// Component to list available currency options
function StatusList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void; // Function to close the drawer/popover
  setSelectedOption: (status: Currency | null) => void; // Function to handle currency selection
}) {
  return (
    <Command>
      {/* Input for filtering currency options */}
      <CommandInput placeholder="Filter status..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {/* Render each currency as a selectable item */}
          {Currencies.map((item: Currency) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={(value) => {
                // Find the selected currency and update the state
                setSelectedOption(
                  Currencies.find((priority) => priority.value === value) ||
                    null
                );
                setOpen(false); // Close the drawer/popover
              }}
            >
              {item.label} {/* Display currency label */}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

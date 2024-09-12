"use client";
import { BANKLISTS } from "@/data";
import { BankAccountInputType } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import MultipleSelector, { Option } from "./multi-select";
import SkeletonWrapper from "./skeleton-wrapper";

interface BankSelectionBoxProps {
  onValueSelect: (selectedValues: BankAccountInputType[]) => void; // Callback to handle selected bank values
  isLoading?: boolean; // Optional flag to disable selection when loading
  defaultValue?: Option[]; // Optional default selected values
}

const BankSelectionBox = ({
  onValueSelect,
  isLoading,
  defaultValue,
}: BankSelectionBoxProps) => {
  const { user, isLoaded } = useUser(); // Retrieve user data and loading state
  const [selectedBanks, setSelectedBanks] = useState<Option[]>(
    defaultValue || []
  ); // Manage selected banks

  // Handle the selected bank values and map them to the necessary format
  const handleValueChange = (selectedValues: Option[]) => {
    if (!user) {
      return; // Exit if user data is not available
    }

    // Filter selected banks and map to the required format
    const selectedBanks = BANKLISTS.filter((bank: Option) =>
      selectedValues.some(
        (selected: Option) =>
          selected.label === bank.label && selected.value === bank.value
      )
    ).map((bank) => ({
      accountName: bank.label,
      accountLogo: bank.value,
      userId: user?.id, // Assign user ID to the selected bank
      amount: 0,
    }));
    setSelectedBanks(selectedValues);

    onValueSelect(selectedBanks); // Pass the selected banks to the parent component
  };

  return (
    <>
      {/* Show skeleton loader until user data is loaded */}
      <SkeletonWrapper isLoading={!isLoaded}>
        <div className="w-full">
          <MultipleSelector
            disabled={isLoading} // Disable selector when loading
            onChange={handleValueChange} // Handle bank selection change
            options={BANKLISTS} // Provide default list of banks
            value={selectedBanks}
            placeholder="Choose your preferred bank"
            emptyIndicator={
              <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                no results found.
              </p>
            }
          />
        </div>
      </SkeletonWrapper>
    </>
  );
};

export default BankSelectionBox;

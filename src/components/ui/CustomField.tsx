"use client";

import { FieldType } from "@/app/dashboard/_components/create-transaction-dialog";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./form";
import { Input } from "./input";

interface Props {
  control: Control<any>;
  name: string;
  label: string;
  description: string;
  fieldType: FieldType;
  inputType?: string;
  renderSkeleton?: (field: any) => React.ReactNode;
}

const RenderField = ({ field, props }: { field: any; props: Props }) => {
  const { fieldType, name, renderSkeleton } = props;
  switch (fieldType) {
    case FieldType.INPUT:
      return (
        <Input
          {...field}
          type={name == "amount" ? "number" : "text"}
          defaultValue={name === "amount" ? 0 : ""}
        />
      );

    case FieldType.SKELETON:
      return renderSkeleton ? renderSkeleton(field) : null;

    default:
      break;
  }
};
const CustomField = (props: Props) => {
  const { control, name, label, description } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col flex-1">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RenderField field={field} props={props} />
          </FormControl>
          <FormDescription>{description}</FormDescription>
        </FormItem>
      )}
    />
  );
};

export default CustomField;

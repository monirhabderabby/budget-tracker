"use client";

// Packages
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Control } from "react-hook-form";

// Components
import { FieldType } from "@/app/dashboard/_components/create-transaction-dialog";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./form";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

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
  // Component responsible for rendering different types of form fields based on the fieldType.
  const { fieldType, name, renderSkeleton } = props;
  switch (fieldType) {
    case FieldType.INPUT:
      // Rendering an input field with dynamic type based on the field name.
      return (
        <Input
          {...field}
          type={name == "amount" ? "number" : "text"}
          defaultValue={name === "amount" ? 0 : ""}
        />
      );

    case FieldType.SKELETON:
      // Rendering a skeleton loader if provided.
      return renderSkeleton ? renderSkeleton(field) : null;

    case FieldType.DATE_PICKER:
      // Rendering a date picker using a popover and calendar component.
      return (
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
                variant="outline"
              >
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-full">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={(value) => {
                if (!value) return;
                field.onChange(value);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );

    default:
      break;
  }
};
const CustomField = (props: Props) => {
  // Component responsible for rendering a custom form field with label and description.
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

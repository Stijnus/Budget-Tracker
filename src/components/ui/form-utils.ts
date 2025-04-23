import * as React from "react";
import {
  type FieldPath,
  type FieldValues,
  FormProvider,
} from "react-hook-form";

// Re-export FormProvider as Form
export const Form = FormProvider;

// Type definitions
export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

// Create contexts
export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

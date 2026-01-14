import { ValidationError } from "./ValidationError";

interface FormValidationProps {
  fieldName: string;
  hasFieldError: (fieldName: string) => boolean;
  getFieldError: (fieldName: string) => string;
}

export function FormValidation({
  fieldName,
  hasFieldError,
  getFieldError,
}: FormValidationProps) {
  return (
    <ValidationError
      fieldName={fieldName}
      hasFieldError={hasFieldError}
      getFieldError={getFieldError}
    />
  );
}

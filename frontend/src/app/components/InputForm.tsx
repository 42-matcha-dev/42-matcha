import React from "react";
import { FieldError } from "react-hook-form";

type AllowedInputTypes =
  | "text"
  | "password"
  | "email"
  | "number"
  | "date"
  | "checkbox"
  | "file";

interface InputFormProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  type?: AllowedInputTypes;
  error?: FieldError;
}

const InputForm = ({label, type, error, ...props}: InputFormProps) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
        <input
            className="border-b border-gray-300 rounded-md p-2 w-full focus:outline-none "
            type={type}
            name={label.toLowerCase()}
            placeholder={label}
            {...props}
        />
        {error && <div className="text-red-500">{error.message}</div>}
    </div>
  );
};

export default InputForm;

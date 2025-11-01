import React from "react";
import { FieldError } from "react-hook-form";

interface InputFormProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: FieldError;
  values?: string[];
}

const InputFormSelect = ({label, error, values, ...props}: InputFormProps) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <label>{label}</label>
        { values ? (
          <select className="w-full border border-gray-300 p-2 rounded-md focus:outline-none
          focus:ring-2 focus:ring-blue-300 focus:border-transparent">
            {values.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        ) : <div></div>}
        {error && <div className="text-red-500">{error.message}</div>}
    </div>
  );
};

export default InputFormSelect;

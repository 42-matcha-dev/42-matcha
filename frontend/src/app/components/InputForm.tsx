import React from "react";

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
}

const InputForm = ({label, type, ...props}: InputFormProps) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
        <input
            className="border-b border-gray-300 rounded-md p-2 w-full focus:outline-none "
            type={type}
            name={label.toLowerCase()}
            placeholder={label}
            {...props}
        />
    </div>
  );
};

export default InputForm;

import React from 'react'
import { FieldError } from 'react-hook-form'

type AllowedInputTypes = 'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'file'

interface InputFormProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  placeholder?: string
  type?: AllowedInputTypes
  error?: FieldError
}

const InputForm = ({ label, placeholder, type, error, ...props }: InputFormProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className="border-b border-gray-300 p-2 w-full focus:outline-none "
        type={type}
        name={label ? label.toLowerCase() : ""}
        placeholder={placeholder}
        {...props}
      />
      {error && <div className="text-red-500">{error.message}</div>}
    </div>
  )
}

export default InputForm

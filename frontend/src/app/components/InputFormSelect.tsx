import React from 'react'
import { FieldError } from 'react-hook-form'

type Option = {
  label: string
  value: string
}
interface InputFormProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Option[]
  error?: FieldError
}

const InputFormSelect = ({ label, options, error, ...props }: InputFormProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label>{label}</label>
      <select
        {...props}
        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none
            focus:ring-2 focus:ring-blue-300 focus:border-transparent"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="text-red-500">{error.message}</div>}
    </div>
  )
}

export default InputFormSelect

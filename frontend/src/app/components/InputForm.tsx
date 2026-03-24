import React, { useState } from 'react'
import { FieldError } from 'react-hook-form'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

type AllowedInputTypes = 'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'file'

interface InputFormProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  placeholder?: string
  type?: AllowedInputTypes
  error?: FieldError
}

const InputForm = ({ label, placeholder, type, error, ...props }: InputFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative w-full">
        <input
          className="border-b border-gray-300 p-2 w-full focus:outline-none pr-10"
          type={isPassword && showPassword ? 'text' : type}
          name={label ? label.toLowerCase() : ''}
          placeholder={placeholder}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
          </button>
        )}
      </div>
      {error && <div className="text-red-500">{error.message}</div>}
    </div>
  )
}

export default InputForm

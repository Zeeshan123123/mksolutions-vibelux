"use client"

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface ValidationRule {
  validate: (value: string) => boolean
  message: string
}

interface FormFieldProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  value: string
  onChange: (value: string) => void
  rules?: ValidationRule[]
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  showValidation?: boolean
}

interface ValidationState {
  isValid: boolean
  errors: string[]
  touched: boolean
}

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  rules = [],
  required = false,
  disabled = false,
  placeholder,
  className = '',
  showValidation = true
}: FormFieldProps) {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    errors: [],
    touched: false
  })

  const validateField = (fieldValue: string): ValidationState => {
    const errors: string[] = []
    
    // Required validation
    if (required && !fieldValue.trim()) {
      errors.push(`${label} is required`)
    }
    
    // Custom rules validation
    if (fieldValue.trim()) {
      for (const rule of rules) {
        if (!rule.validate(fieldValue)) {
          errors.push(rule.message)
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      touched: true
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    if (validation.touched) {
      setValidation(validateField(newValue))
    }
  }

  const handleBlur = () => {
    setValidation(validateField(value))
  }

  const hasErrors = validation.touched && !validation.isValid
  const hasSuccess = validation.touched && validation.isValid && value.trim()

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 text-white transition-colors ${
            hasErrors
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : hasSuccess
              ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
              : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        {showValidation && validation.touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validation.isValid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {showValidation && hasErrors && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

interface FormSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = ''
}: FormSelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface FormTextareaProps {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  maxLength?: number
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function FormTextarea({
  label,
  value,
  onChange,
  rows = 3,
  maxLength,
  required = false,
  disabled = false,
  placeholder,
  className = ''
}: FormTextareaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white resize-none transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      />
      
      {maxLength && (
        <div className="text-right text-sm text-gray-400">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  )
}

interface FormButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
}

export function FormButton({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = ''
}: FormButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-700 text-gray-300 border border-gray-600 focus:ring-gray-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  )
}

// Common validation rules
export const ValidationRules = {
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  
  minLength: (min: number) => ({
    validate: (value: string) => value.length >= min,
    message: `Must be at least ${min} characters long`
  }),
  
  maxLength: (max: number) => ({
    validate: (value: string) => value.length <= max,
    message: `Must be no more than ${max} characters long`
  }),
  
  password: {
    validate: (value: string) => {
      return value.length >= 8 && 
             /[A-Z]/.test(value) && 
             /[a-z]/.test(value) && 
             /\d/.test(value) && 
             /[!@#$%^&*]/.test(value)
    },
    message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  },
  
  phoneNumber: {
    validate: (value: string) => /^\+?[\d\s\-\(\)]{10,}$/.test(value),
    message: 'Please enter a valid phone number'
  },
  
  url: {
    validate: (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message: 'Please enter a valid URL'
  },
  
  noSpaces: {
    validate: (value: string) => !/\s/.test(value),
    message: 'No spaces allowed'
  },
  
  alphanumeric: {
    validate: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    message: 'Only letters and numbers are allowed'
  }
}

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule[]>>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string[]>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = (name: keyof T, value: any): string[] => {
    const rules = validationRules[name] || []
    const fieldErrors: string[] = []
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        fieldErrors.push(rule.message)
      }
    }
    
    return fieldErrors
  }

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      const fieldErrors = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: fieldErrors }))
    }
  }

  const setFieldTouched = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const fieldErrors = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: fieldErrors }))
  }

  const validateAll = (): boolean => {
    const allErrors: Partial<Record<keyof T, string[]>> = {}
    let isValid = true

    for (const [name, value] of Object.entries(values)) {
      const fieldErrors = validateField(name as keyof T, value)
      if (fieldErrors.length > 0) {
        allErrors[name as keyof T] = fieldErrors
        isValid = false
      }
    }

    setErrors(allErrors)
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    )

    return isValid
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  const isFormValid = Object.values(errors).every(fieldErrors => 
    !fieldErrors || fieldErrors.length === 0
  )

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isFormValid
  }
}
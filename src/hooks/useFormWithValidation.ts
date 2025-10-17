import { useState, useCallback, useMemo } from 'react';
import { logger } from '@/lib/logging/production-logger';

interface ValidationRule<T> {
  field: keyof T;
  validate: (value: any, formData: T) => string | null;
}

interface UseFormWithValidationOptions<T> {
  initialValues: T;
  validationRules?: ValidationRule<T>[];
  onSubmit?: (data: T) => Promise<void> | void;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: (values?: T) => void;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (value: T[keyof T]) => void;
    onBlur: () => void;
    error?: string;
    touched?: boolean;
  };
}

export function useFormWithValidation<T extends Record<string, any>>({
  initialValues,
  validationRules = [],
  onSubmit,
}: UseFormWithValidationOptions<T>): FormState<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Memoized computed properties
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);
  
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => 
      values[key as keyof T] !== initialValues[key as keyof T]
    );
  }, [values, initialValues]);
  
  // Validation logic
  const validateField = useCallback((field: keyof T) => {
    const rule = validationRules.find(r => r.field === field);
    if (!rule) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return;
    }
    
    const error = rule.validate(values[field], values);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined,
    }));
  }, [values, validationRules]);
  
  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    validationRules.forEach(rule => {
      const error = rule.validate(values[rule.field], values);
      if (error) {
        newErrors[rule.field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);
  
  // Form actions
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it's been touched
    if (touched[field]) {
      setTimeout(() => validateField(field), 0);
    }
  }, [touched, validateField]);
  
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);
  
  const setFieldTouched = useCallback((field: keyof T, fieldTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: fieldTouched }));
    if (fieldTouched) {
      validateField(field);
    }
  }, [validateField]);
  
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm() || !onSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      logger.error('api', 'Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, values]);
  
  const reset = useCallback((newValues?: T) => {
    const resetValues = newValues || initialValues;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field],
    onChange: (value: T[keyof T]) => setValue(field, value),
    onBlur: () => setFieldTouched(field),
    error: errors[field],
    touched: touched[field],
  }), [values, errors, touched, setValue, setFieldTouched]);
  
  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    setValue,
    setValues: setFormValues,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    getFieldProps,
  };
}
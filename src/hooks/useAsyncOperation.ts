"use client"

import { useState, useCallback, useRef } from 'react'
import { useNotifications } from '@/components/ui/NotificationSystem'

export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  success: boolean
}

export interface AsyncOperationOptions {
  successMessage?: string
  errorMessage?: string
  loadingMessage?: string
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  showNotifications?: boolean
  retryCount?: number
  retryDelay?: number
}

export function useAsyncOperation<T = any>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  })
  
  const { addNotification } = useNotifications()
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)

  const {
    successMessage,
    errorMessage,
    showNotifications = true,
    retryCount = 0,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options

  const execute = useCallback(async (params?: any) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setState({
      data: null,
      loading: true,
      error: null,
      success: false
    })

    try {
      const result = await operation()
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      setState({
        data: result,
        loading: false,
        error: null,
        success: true
      })

      if (showNotifications && successMessage) {
        addNotification({
          type: 'success',
          title: successMessage
        })
      }

      if (onSuccess) {
        onSuccess(result)
      }

      retryCountRef.current = 0
      return result
    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      const errorMsg = error instanceof Error ? error.message : 'An error occurred'
      
      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++
        
        if (showNotifications) {
          addNotification({
            type: 'warning',
            title: `Retry ${retryCountRef.current}/${retryCount}`,
            message: 'Operation failed, retrying...'
          })
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        
        return execute(params)
      }

      setState({
        data: null,
        loading: false,
        error: errorMsg,
        success: false
      })

      if (showNotifications && errorMessage) {
        addNotification({
          type: 'error',
          title: errorMessage,
          message: errorMsg
        })
      }

      if (onError) {
        onError(errorMsg)
      }

      retryCountRef.current = 0
      throw error
    }
  }, [operation, successMessage, errorMessage, showNotifications, retryCount, retryDelay, onSuccess, onError, addNotification])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    })
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(prev => ({
      ...prev,
      loading: false
    }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    cancel
  }
}

// Hook for handling multiple async operations
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Record<string, AsyncState>>({})

  const addOperation = useCallback((key: string, state: AsyncState) => {
    setOperations(prev => ({ ...prev, [key]: state }))
  }, [])

  const removeOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newOps = { ...prev }
      delete newOps[key]
      return newOps
    })
  }, [])

  const isAnyLoading = Object.values(operations).some(op => op.loading)
  const hasAnyError = Object.values(operations).some(op => op.error)
  const allSuccessful = Object.values(operations).every(op => op.success)

  return {
    operations,
    addOperation,
    removeOperation,
    isAnyLoading,
    hasAnyError,
    allSuccessful
  }
}

// Hook for paginated data loading
export function usePaginatedData<T>(
  fetchFunction: (page: number, limit: number, filters?: any) => Promise<{
    data: T[]
    total: number
    page: number
    limit: number
    hasMore: boolean
  }>,
  initialLimit = 20
) {
  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    error: null as string | null,
    page: 1,
    limit: initialLimit,
    total: 0,
    hasMore: true,
    refreshing: false
  })

  const { addNotification } = useNotifications()

  const loadData = useCallback(async (
    page: number = 1,
    limit: number = initialLimit,
    filters?: any,
    append: boolean = false
  ) => {
    setState(prev => ({
      ...prev,
      loading: !append,
      refreshing: append && page === 1,
      error: null
    }))

    try {
      const result = await fetchFunction(page, limit, filters)
      
      setState(prev => ({
        ...prev,
        data: append ? [...prev.data, ...result.data] : result.data,
        loading: false,
        refreshing: false,
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
        error: null
      }))

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load data'
      
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: errorMsg
      }))

      addNotification({
        type: 'error',
        title: 'Loading Error',
        message: errorMsg
      })

      throw error
    }
  }, [fetchFunction, initialLimit, addNotification])

  const loadMore = useCallback(async (filters?: any) => {
    if (state.loading || !state.hasMore) return
    
    return loadData(state.page + 1, state.limit, filters, true)
  }, [state.loading, state.hasMore, state.page, state.limit, loadData])

  const refresh = useCallback(async (filters?: any) => {
    return loadData(1, state.limit, filters, false)
  }, [state.limit, loadData])

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      page: 1,
      limit: initialLimit,
      total: 0,
      hasMore: true,
      refreshing: false
    })
  }, [initialLimit])

  return {
    ...state,
    loadData,
    loadMore,
    refresh,
    reset
  }
}

// Hook for form submission with loading states
export function useFormSubmission<T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: AsyncOperationOptions = {}
) {
  const [state, setState] = useState({
    submitting: false,
    success: false,
    error: null as string | null
  })

  const { addNotification } = useNotifications()

  const submit = useCallback(async (data: any) => {
    setState({
      submitting: true,
      success: false,
      error: null
    })

    try {
      const result = await submitFunction(data)
      
      setState({
        submitting: false,
        success: true,
        error: null
      })

      if (options.showNotifications !== false && options.successMessage) {
        addNotification({
          type: 'success',
          title: options.successMessage
        })
      }

      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Submission failed'
      
      setState({
        submitting: false,
        success: false,
        error: errorMsg
      })

      if (options.showNotifications !== false && options.errorMessage) {
        addNotification({
          type: 'error',
          title: options.errorMessage,
          message: errorMsg
        })
      }

      if (options.onError) {
        options.onError(errorMsg)
      }

      throw error
    }
  }, [submitFunction, options, addNotification])

  const reset = useCallback(() => {
    setState({
      submitting: false,
      success: false,
      error: null
    })
  }, [])

  return {
    ...state,
    submit,
    reset
  }
}

// Hook for handling file uploads
export function useFileUpload(
  uploadFunction: (file: File, onProgress?: (progress: number) => void) => Promise<any>,
  options: AsyncOperationOptions = {}
) {
  const [state, setState] = useState({
    uploading: false,
    progress: 0,
    success: false,
    error: null as string | null,
    result: null as any
  })

  const { addNotification } = useNotifications()

  const upload = useCallback(async (file: File) => {
    setState({
      uploading: true,
      progress: 0,
      success: false,
      error: null,
      result: null
    })

    try {
      const result = await uploadFunction(file, (progress) => {
        setState(prev => ({ ...prev, progress }))
      })
      
      setState({
        uploading: false,
        progress: 100,
        success: true,
        error: null,
        result
      })

      if (options.showNotifications !== false && options.successMessage) {
        addNotification({
          type: 'success',
          title: options.successMessage
        })
      }

      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
      
      setState({
        uploading: false,
        progress: 0,
        success: false,
        error: errorMsg,
        result: null
      })

      if (options.showNotifications !== false && options.errorMessage) {
        addNotification({
          type: 'error',
          title: options.errorMessage,
          message: errorMsg
        })
      }

      if (options.onError) {
        options.onError(errorMsg)
      }

      throw error
    }
  }, [uploadFunction, options, addNotification])

  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      success: false,
      error: null,
      result: null
    })
  }, [])

  return {
    ...state,
    upload,
    reset
  }
}
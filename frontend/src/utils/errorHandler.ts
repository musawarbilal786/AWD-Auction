import { message } from 'antd';

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
      errors?: any;
      [key: string]: any;
    };
  };
  message?: string;
  code?: string;
}

export const getErrorMessage = (error: unknown, context?: string): string => {
  const apiError = error as ApiError;
  const status = apiError.response?.status;
  const errorData = apiError.response?.data;
  
  console.log('Error handler - Status:', status);
  console.log('Error handler - Error data:', errorData);
  console.log('Error handler - Context:', context);
  console.log('Error handler - Full error:', apiError);
  
  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      if (errorData?.detail) {
        return errorData.detail;
      }
      if (errorData?.message) {
        return errorData.message;
      }
      if (errorData?.error) {
        // Handle the specific error format: {"error":["message"]}
        const errorArray = errorData.error;
        if (Array.isArray(errorArray)) {
          return errorArray.join(', ');
        }
        return String(errorArray);
      }
      if (errorData?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(errorData.errors).flat();
        return Array.isArray(errorMessages) ? errorMessages.join(', ') : 'Please check your input and try again.';
      }
      // Handle root-level validation errors (Django/DRF style)
      if (errorData && typeof errorData === 'object') {
        const fieldErrors = Object.values(errorData).filter(v => Array.isArray(v));
        if (fieldErrors.length) {
          return fieldErrors.flat().join(', ');
        }
      }
      // Handle string error responses
      if (typeof errorData === 'string') {
        return errorData;
      }
      return 'Invalid request. Please check your input and try again.';
    
    case 401:
      return 'You are not authorized to perform this action. Please log in again.';
    
    case 403:
      return 'You do not have permission to perform this action.';
    
    case 404:
      if (errorData?.detail) {
        return errorData.detail;
      }
      if (errorData?.message) {
        return errorData.message;
      }
      return context ? `${context} not found.` : 'The requested resource was not found.';
    
    case 409:
      return 'This record already exists. Please check your input.';
    
    case 422:
      if (errorData?.detail) {
        return errorData.detail;
      }
      return 'Validation failed. Please check your input and try again.';
    
    case 429:
      return 'Too many requests. Please try again later.';
    
    case 500:
      return 'Server error. Please try again later.';
    
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    
    default:
      if (errorData?.detail) {
        return errorData.detail;
      }
      if (errorData?.message) {
        return errorData.message;
      }
      if (apiError.message) {
        return apiError.message;
      }
      return 'An unexpected error occurred. Please try again.';
  }
};

export const getSuccessMessage = (action: string, context?: string): string => {
  const baseMessage = `${action} successfully!`;
  return context ? `${context} ${baseMessage}` : baseMessage;
};

export const showErrorToast = (error: unknown, context?: string) => {
  console.log('showErrorToast called with:', error, context);
  const errorMessage = getErrorMessage(error, context);
  console.log('Error message to display:', errorMessage);
  message.error(errorMessage);
};

export const showSuccessToast = (action: string, context?: string) => {
  console.log('showSuccessToast called with:', action, context);
  const successMessage = getSuccessMessage(action, context);
  console.log('Success message to display:', successMessage);
  message.success(successMessage);
};

// Common error messages for specific actions
export const COMMON_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load data. Please refresh the page and try again.',
  SAVE_FAILED: 'Failed to save changes. Please check your input and try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
  REGISTRATION_FAILED: 'Registration failed. Please check your information and try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  VALIDATION_ERROR: 'Please fill in all required fields correctly.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
};

// Common success messages for specific actions
export const COMMON_SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  DELETED: 'Item deleted successfully!',
  CREATED: 'Item created successfully!',
  UPDATED: 'Item updated successfully!',
  UPLOADED: 'File uploaded successfully!',
  LOGGED_IN: 'Login successful!',
  REGISTERED: 'Registration successful!',
  ASSIGNED: 'Assignment completed successfully!',
  SENT: 'Sent successfully!',
};

// Enhanced error handler for async operations
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorContext?: string,
  customErrorMessage?: string
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error: unknown) {
    const errorMessage = customErrorMessage || getErrorMessage(error, errorContext);
    message.error(errorMessage);
    return null;
  }
};

// Enhanced success handler for async operations
export const handleAsyncSuccess = async <T>(
  asyncFn: () => Promise<T>,
  successAction: string,
  context?: string
): Promise<T | null> => {
  try {
    const result = await asyncFn();
    showSuccessToast(successAction, context);
    return result;
  } catch (error: unknown) {
    showErrorToast(error, context);
    return null;
  }
}; 
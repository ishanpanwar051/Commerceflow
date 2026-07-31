import { AxiosError } from 'axios';

async function getToast() {
  const { toast } = await import('sonner');
  return toast;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export async function handleApiError(error: unknown, customMessage?: string): Promise<string> {
  const toast = await getToast();
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    
    const message = apiError?.message || error.message || 'An unexpected error occurred';
    
    if (apiError?.errors) {
      const validationErrors = Object.entries(apiError.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n');
      
      toast.error(customMessage || 'Validation Error', {
        description: validationErrors,
      });
      
      return validationErrors;
    }
    
    switch (error.response?.status) {
      case 400:
        toast.error(customMessage || 'Bad Request', { description: message });
        break;
      case 401:
        toast.error('Unauthorized', { description: 'Please log in to continue' });
        break;
      case 403:
        toast.error('Forbidden', { description: 'You don\'t have permission to perform this action' });
        break;
      case 404:
        toast.error('Not Found', { description: message });
        break;
      case 409:
        toast.error('Conflict', { description: message });
        break;
      case 429:
        toast.error('Too Many Requests', { description: 'Please slow down and try again later' });
        break;
      case 500:
        toast.error('Server Error', { description: 'Something went wrong on our end. Please try again later.' });
        break;
      default:
        toast.error(customMessage || 'Error', { description: message });
    }
    
    return message;
  }
  
  if (error instanceof Error) {
    const message = error.message || 'An unexpected error occurred';
    toast.error(customMessage || 'Error', { description: message });
    return message;
  }
  
  const fallbackMessage = 'An unexpected error occurred';
  toast.error(customMessage || 'Error', { description: fallbackMessage });
  return fallbackMessage;
}

export async function showSuccessToast(message: string, description?: string) {
  const toast = await getToast();
  toast.success(message, { description });
}

export async function showErrorToast(message: string, description?: string) {
  const toast = await getToast();
  toast.error(message, { description });
}

export async function showInfoToast(message: string, description?: string) {
  const toast = await getToast();
  toast.info(message, { description });
}

export async function showWarningToast(message: string, description?: string) {
  const toast = await getToast();
  toast.warning(message, { description });
}

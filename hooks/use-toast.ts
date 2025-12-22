import { toast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  return {
    toast: (options: ToastOptions) => {
      if (options.variant === 'destructive') {
        toast.error(options.title || '', {
          description: options.description,
          duration: options.duration || 4000,
        });
      } else {
        toast.success(options.title || '', {
          description: options.description,
          duration: options.duration || 4000,
        });
      }
    },
  };
}

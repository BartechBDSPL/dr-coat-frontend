import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dots' | 'spinner';
  label?: string;
}

export function Loading({
  className,
  size = 'md',
  variant = 'dots',
  label,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const containerClasses = {
    sm: 'min-h-[100px]',
    md: 'min-h-[400px]',
    lg: 'min-h-[600px]',
  };

  if (variant === 'spinner') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          containerClasses[size],
          className
        )}
      >
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-muted border-t-primary',
            size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12'
          )}
        ></div>
        {label && (
          <Label className="mt-1 block text-sm text-muted-foreground">
            {label}
          </Label>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        containerClasses[size],
        className
      )}
    >
      <div className="flex space-x-2">
        <div
          className={cn(
            sizeClasses[size],
            'animate-bounce rounded-full bg-primary [animation-delay:-0.3s]'
          )}
        ></div>
        <div
          className={cn(
            sizeClasses[size],
            'animate-bounce rounded-full bg-primary [animation-delay:-0.15s]'
          )}
        ></div>
        <div
          className={cn(
            sizeClasses[size],
            'animate-bounce rounded-full bg-primary'
          )}
        ></div>
      </div>
      {label && (
        <Label className="mt-1 block text-sm text-muted-foreground">
          {label}
        </Label>
      )}
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'toolbar' | 'toolbar-active';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cdts-accent disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-cdts-accent text-white shadow hover:bg-cdts-accent-hover': variant === 'default',
            'bg-cdts-error text-white shadow-sm hover:bg-red-600': variant === 'destructive',
            'border border-cdts-border bg-cdts-bg-primary shadow-sm hover:bg-cdts-bg-secondary hover:text-cdts-text-primary': variant === 'outline',
            'bg-cdts-bg-secondary text-cdts-text-primary shadow-sm hover:bg-cdts-bg-tertiary': variant === 'secondary',
            'hover:bg-cdts-bg-secondary hover:text-cdts-text-primary': variant === 'ghost',
            'text-cdts-accent underline-offset-4 hover:underline': variant === 'link',
            'bg-transparent text-cdts-text-secondary hover:bg-cdts-bg-secondary hover:text-cdts-text-primary': variant === 'toolbar',
            'bg-cdts-accent text-white hover:bg-cdts-accent-hover': variant === 'toolbar-active',
          },
          {
            'h-8 px-3 py-1.5': size === 'default',
            'h-7 rounded-sm px-2 text-xs': size === 'sm',
            'h-9 rounded-sm px-4': size === 'lg',
            'h-8 w-8': size === 'icon',
            'h-6 w-6': size === 'icon-sm',
            'h-5 w-5': size === 'icon-xs',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

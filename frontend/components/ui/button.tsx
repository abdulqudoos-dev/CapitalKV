import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Define button variants with transition and hover effects
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 hover:shadow-xl hover:shadow-purple-900/20 hover:scale-105 transition-all duration-300 ease-in-out',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-300 ease-in-out',
        outline:
          'border border-input bg-transparent border-purple-900 rounded-full hover:shadow-xl hover:shadow-purple-900/20 hover:scale-105 transition-all duration-300 ease-in-out me-2 mb-2 px-5 py-2.5',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 ease-in-out',
        ghost:
          'hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out',
        link: 'text-primary underline-offset-4 hover:underline transition-all duration-300 ease-in-out',
        disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        green:
          'bg-green-500 text-white hover:bg-green-600 shadow-lg font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 hover:shadow-xl hover:shadow-green-900/20 hover:scale-105 transition-all duration-300 ease-in-out',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

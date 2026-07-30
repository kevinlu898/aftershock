import { Text, TextClassContext } from './text';
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import { useTheme } from '../../lib/theme';

const buttonVariants = cva(cn(
  'group min-h-12 shrink-0 flex-row items-center justify-center gap-2 rounded-xl shadow-none active:opacity-90',
  Platform.select({
    web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  })
), {
  variants: {
    variant: {
      default: cn(
        'bg-primary active:bg-primary/90 shadow-sm shadow-black/5',
        Platform.select({ web: 'hover:bg-primary/90' })
      ),
      destructive: cn(
        'bg-destructive active:bg-destructive/90 dark:bg-destructive/60 shadow-sm shadow-black/5',
        Platform.select({
          web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        })
      ),
      outline: cn(
        'border-border bg-background active:bg-accent dark:bg-input/30 dark:border-input dark:active:bg-input/50 border shadow-sm shadow-black/5',
        Platform.select({
          web: 'hover:bg-accent dark:hover:bg-input/50',
        })
      ),
      secondary: cn(
        'bg-secondary active:bg-secondary/80 shadow-sm shadow-black/5',
        Platform.select({ web: 'hover:bg-secondary/80' })
      ),
      ghost: cn(
        'active:bg-accent dark:active:bg-accent/50',
        Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })
      ),
      link: '',
      unstyled: '',
    },
    size: {
      default: cn('min-h-12 px-4 py-3', Platform.select({ web: 'has-[>svg]:px-3' })),
      sm: cn(
        'min-h-10 gap-1.5 px-3 py-2',
        Platform.select({ web: 'has-[>svg]:px-2.5' })
      ),
      lg: cn(
        'min-h-14 px-6 py-4',
        Platform.select({ web: 'has-[>svg]:px-4' })
      ),
      icon: 'h-12 w-12',
      unstyled: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const buttonTextVariants = cva(cn(
  'text-foreground text-sm font-medium',
  Platform.select({ web: 'pointer-events-none transition-colors' })
), {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-white',
      outline: cn(
        'group-active:text-accent-foreground',
        Platform.select({ web: 'group-hover:text-accent-foreground' })
      ),
      secondary: 'text-secondary-foreground',
      ghost: 'group-active:text-accent-foreground',
      link: cn(
        'text-primary group-active:underline',
        Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' })
      ),
      unstyled: 'text-foreground',
    },
    size: {
      default: '',
      sm: '',
      lg: '',
      icon: '',
      unstyled: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

function Button({
  className,
  variant,
  size,
  loading = false,
  children,
  unstyled = false,
  activeOpacity: _activeOpacity,
  ...props
}) {
  const { palette } = useTheme();
  const disabled = props.disabled || loading;
  const label = typeof children === 'string' ? children : null;
  const resolvedVariant = unstyled ? 'unstyled' : variant;
  const resolvedSize = unstyled ? 'unstyled' : size;

  return (
    <TextClassContext.Provider
      value={buttonTextVariants({
        variant: resolvedVariant,
        size: resolvedSize,
      })}>
      <Pressable
        className={cn(
          disabled && 'opacity-50',
          buttonVariants({
            variant: resolvedVariant,
            size: resolvedSize,
          }),
          unstyled && 'h-auto min-h-0 px-0 py-0',
          className
        )}
        role={props.role || "button"}
        {...props}
        accessibilityRole={props.accessibilityRole || "button"}
        accessibilityLabel={props.accessibilityLabel || label || undefined}
        accessibilityState={{
          ...props.accessibilityState,
          disabled: Boolean(disabled),
          busy: loading,
        }}
        disabled={disabled}>
        {loading ? (
          <ActivityIndicator
            color={
              resolvedVariant === 'default'
                ? palette.primaryForeground
                : palette.primary
            }
          />
        ) : label ? (
          <Text>{label}</Text>
        ) : (
          children
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };

import { cn } from '../../lib/utils';
import { Platform, TextInput, useColorScheme } from 'react-native';

function Input({
  className,
  ...props
}) {
  const colorScheme = useColorScheme();
  return (
    <TextInput
      className={cn(
        'dark:bg-input/30 border-input bg-card text-foreground flex min-h-12 w-full min-w-0 flex-row items-center rounded-xl border px-4 py-3 text-base leading-5 shadow-sm shadow-black/5',
        props.editable === false &&
        cn(
          'opacity-50',
          Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
        ),
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
          ),
          native: 'placeholder:text-muted-foreground/50',
        }),
        className
      )}
      placeholderTextColor={
        props.placeholderTextColor ||
        (colorScheme === 'dark' ? '#A6BDB3' : '#5D786C')
      }
      textAlignVertical={props.multiline ? 'top' : 'center'}
      {...props} />
  );
}

export { Input };

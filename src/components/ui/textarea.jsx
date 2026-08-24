import { cn } from '../../lib/utils';
import { Platform, TextInput } from 'react-native';
import { useTheme } from '../../lib/theme';
import { DEFAULT_MAX_SCALE } from './text';

function Textarea({
  className,
  multiline = true,

  // On web, numberOfLines also determines initial height. On native, it determines the maximum height.
  numberOfLines = Platform.select({ web: 2, native: 8 }),

  placeholderClassName,
  ...props
}) {
  const { palette } = useTheme();
  return (
    <TextInput
      className={cn(
        'text-foreground border-input dark:bg-input/30 flex min-h-24 w-full flex-row rounded-xl border bg-card px-4 py-3 text-base leading-6 shadow-sm shadow-black/5 md:text-sm',
        Platform.select({
          web: 'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive field-sizing-content resize-y outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed',
        }),
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      placeholderTextColor={
        props.placeholderTextColor || palette.mutedForeground
      }
      maxFontSizeMultiplier={props.maxFontSizeMultiplier ?? DEFAULT_MAX_SCALE}
      {...props} />
  );
}

export { Textarea };

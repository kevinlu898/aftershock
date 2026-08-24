import { Icon } from './icon';
import { cn } from '../../lib/utils';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import { Check } from 'lucide-react-native';
import { Platform, View } from 'react-native';

const DEFAULT_HIT_SLOP = 24;

function Checkbox({
  className,
  checkedClassName,
  indicatorClassName,
  iconClassName,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'border-input dark:bg-input/30 size-4 shrink-0 rounded-[4px] border shadow-sm shadow-black/5',
        Platform.select({
          web: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive peer cursor-default outline-none transition-shadow focus-visible:ring-[3px] disabled:cursor-not-allowed',
          native: 'overflow-hidden',
        }),
        props.checked && cn('border-primary', checkedClassName),
        props.disabled && 'opacity-50',
        className
      )}
      hitSlop={DEFAULT_HIT_SLOP}
      {...props}>
      <CheckboxPrimitive.Indicator
        className={cn('bg-primary h-full w-full items-center justify-center', indicatorClassName)}>
        <Icon
          as={Check}
          size={12}
          strokeWidth={Platform.OS === 'web' ? 2.5 : 3.5}
          className={cn('text-primary-foreground', iconClassName)} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

function CheckIndicator({ checked, className, size = "md" }) {
  const box = size === "lg" ? "h-7 w-7 rounded-lg" : "h-6 w-6 rounded-md";
  const glyph = size === "lg" ? 17 : 16;

  return (
    <View
      className={cn(
        "shrink-0 items-center justify-center border-2 bg-card",
        box,
        checked ? "border-primary bg-primary" : "border-muted-foreground",
        className
      )}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {checked ? (
        <Icon
          as={Check}
          size={glyph}
          strokeWidth={3}
          className="text-primary-foreground"
        />
      ) : null}
    </View>
  );
}

export { Checkbox, CheckIndicator };

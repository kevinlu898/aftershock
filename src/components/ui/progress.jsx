import { cn } from '../../lib/utils';
import * as ProgressPrimitive from '@rn-primitives/progress';
import { Platform, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}) {
  // Rounded to a whole percent on purpose. The primitive forwards this into
  // accessibilityValue.now, which Fabric types as an integer, so a fractional
  // percent (1 of 6 lessons gives 16.666...) throws "Loss of precision during
  // arithmetic conversion". Whole percents are visually identical on a bar.
  const normalizedValue = Math.round(
    Math.max(0, Math.min(1, Number(value) || 0)) * 100
  );

  return (
    <ProgressPrimitive.Root
      value={normalizedValue}
      max={100}
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}>
      <Indicator value={normalizedValue} className={indicatorClassName} />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

const Indicator = Platform.select({
  web: WebIndicator,
  native: NativeIndicator,
  default: NullIndicator,
});

function WebIndicator({
  value,
  className
}) {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View
      className={cn('bg-primary h-full w-full flex-1 transition-all', className)}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}>
      <ProgressPrimitive.Indicator className={cn('h-full w-full', className)} />
    </View>
  );
}

function NativeIndicator({
  value,
  className
}) {
  const progress = useDerivedValue(() => value ?? 0);

  const indicator = useAnimatedStyle(() => {
    return {
      width: withSpring(
        `${interpolate(progress.value, [0, 100], [1, 100], Extrapolation.CLAMP)}%`,
        { overshootClamping: true }
      ),
    };
  }, [value]);

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <ProgressPrimitive.Indicator asChild>
      <Animated.View style={indicator} className={cn('bg-primary h-full', className)} />
    </ProgressPrimitive.Indicator>
  );
}

function NullIndicator(_props) {
  return null;
}

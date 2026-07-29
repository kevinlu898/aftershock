import { Text, TextClassContext } from './text';
import { cn } from '../../lib/utils';
import { View } from 'react-native';

function Card({
  className,
  ...props
}) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn(
          'bg-card border-border flex flex-col gap-4 rounded-2xl border p-4 shadow-sm shadow-black/5',
          className
        )}
        {...props} />
    </TextClassContext.Provider>
  );
}

function CardHeader({
  className,
  ...props
}) {
  return <View className={cn('flex flex-col gap-1.5', className)} {...props} />;
}

function CardTitle({
  className,
  ref,
  ...props
}) {

  return (
    <Text
      ref={ref}
      role="heading"
      aria-level={3}
      className={cn('font-semibold leading-none', className)}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return <Text className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

function CardContent({
  className,
  ...props
}) {
  return <View className={cn('gap-3', className)} {...props} />;
}

function CardFooter({
  className,
  ...props
}) {
  return <View className={cn('flex flex-row items-center', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

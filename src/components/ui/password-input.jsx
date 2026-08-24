import { Eye, EyeOff } from "lucide-react-native";
import { forwardRef, useState } from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Icon } from "./icon";
import { Input } from "./input";

export const PasswordInput = forwardRef(function PasswordInput(
  { className, ...props },
  ref
) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View className="relative justify-center">
      <Input
        ref={ref}
        secureTextEntry={!revealed}
        autoCapitalize="none"
        autoCorrect={false}
        className={cn("pr-14", className)}
        {...props}
      />
      <Button
        unstyled
        onPress={() => setRevealed((value) => !value)}
        className="absolute right-1 h-11 w-11 items-center justify-center rounded-full active:bg-muted"
        accessibilityLabel={revealed ? "Hide password" : "Show password"}
        accessibilityState={{ selected: revealed }}
        hitSlop={6}
      >
        <Icon
          as={revealed ? EyeOff : Eye}
          size={18}
          className="text-muted-foreground"
        />
      </Button>
    </View>
  );
});

export default PasswordInput;

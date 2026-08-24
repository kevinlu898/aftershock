import { Search, X } from "lucide-react-native";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Icon } from "./icon";
import { Input } from "./input";

export function SearchField({
  value,
  onChangeText,
  placeholder = "Search",
  accessibilityLabel,
  className,
}) {
  return (
    <View className={cn("relative justify-center", className)}>
      <View className="absolute left-4 z-10" pointerEvents="none">
        <Icon as={Search} size={17} className="text-muted-foreground" />
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel || placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        className="pl-11 pr-12"
      />
      {value ? (
        <Button
          unstyled
          onPress={() => onChangeText("")}
          className="absolute right-1 h-11 w-11 items-center justify-center rounded-full active:bg-muted"
          accessibilityLabel="Clear search"
          hitSlop={6}
        >
          <Icon as={X} size={16} className="text-muted-foreground" />
        </Button>
      ) : null}
    </View>
  );
}

export default SearchField;

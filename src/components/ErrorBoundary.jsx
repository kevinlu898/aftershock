import { Component } from "react";
import { ScrollView, View } from "react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { StatusCard } from "./app-ui";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  componentDidCatch(error, info) {
    console.warn("Unhandled render error", error, info?.componentStack);
    this.props.onError?.(error, info);
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback({ error, reset: this.reset });
    }

    return (
      <View className="flex-1 justify-center bg-background p-5">
        <StatusCard
          tone="danger"
          title="Something went wrong"
          description="This screen ran into an unexpected problem. Your saved information is safe."
        >
          <Button className="mt-3 self-start" onPress={this.reset}>
            Try again
          </Button>
        </StatusCard>

        {__DEV__ ? (
          <ScrollView className="mt-4 max-h-48 rounded-xl bg-muted p-3">
            <Text selectable className="text-footnote text-muted-foreground">
              {String(error?.stack || error?.message || error)}
            </Text>
          </ScrollView>
        ) : null}
      </View>
    );
  }
}

export default ErrorBoundary;

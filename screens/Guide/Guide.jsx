import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { globalStyles } from "../../css";
import { aiResponse } from "../../requests";

export default function Guide() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! How can I help you today?" },
  ]);
  const scrollViewRef = useRef(null);

  const handleSubmission = async () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: inputValue },
      { from: "bot", text: "Thinking..." },
    ]);
    const userInput = inputValue;
    setInputValue("");
    const resp = await aiResponse(userInput);
    setMessages((prev) => {
      // Replace the last "Thinking..." bot message with the real response
      const last = [...prev];
      for (let i = last.length - 1; i >= 0; i--) {
        if (last[i].from === "bot" && last[i].text === "Thinking...") {
          last[i] = { from: "bot", text: resp };
          break;
        }
      }
      return last;
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f4f4f4" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1, paddingTop: 40 }}>
        <Text
          style={[globalStyles.heading, { textAlign: "left", marginLeft: 16 }]}
        >
          AI Guide
        </Text>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 12, marginTop: 8 }}
          contentContainerStyle={{
            paddingBottom: 16,
            justifyContent: "flex-end",
          }}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current &&
            scrollViewRef.current.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={{
                alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.from === "user" ? "#519872" : "#fff",
                borderRadius: 16,
                marginVertical: 4,
                padding: 12,
                maxWidth: "80%",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {msg.from === "bot" ? (
                <Markdown style={{ body: { color: "#222", fontSize: 16 } }}>
                  {msg.text || ""}
                </Markdown>
              ) : (
                <Text style={{ color: "#fff", fontSize: 16 }}>{msg.text}</Text>
              )}
            </View>
          ))}
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            backgroundColor: "#f4f4f4",
            borderTopWidth: 1,
            borderColor: "#eee",
          }}
        >
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Type your message..."
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: "#fff",
              fontSize: 16,
            }}
            onSubmitEditing={handleSubmission}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSubmission}
            style={{
              marginLeft: 8,
              backgroundColor: "#519872",
              borderRadius: 20,
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

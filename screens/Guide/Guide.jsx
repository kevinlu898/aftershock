import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Markdown from "react-native-markdown-display";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../../css";
import { aiResponse } from "../../requests";
import styles, { markdownStyles } from './GuideStyles';

export default function Guide() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I'm your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning.",
      time: new Date().toISOString(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [inputHeight, setInputHeight] = useState(40);
  const scrollViewRef = useRef(null);

  const quickPrompts = [
    "Create earthquake kit",
    "During earthquake safety",
    "Secure my home",
    "Emergency contacts",
    "Make a family plan",
    "Learn first aid basics",
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (!scrollViewRef.current) return;
    setTimeout(() => {
      try {
        scrollViewRef.current.scrollToEnd({ animated: true });
      } catch (e) {}
    }, 100);
  }, [messages]);

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInputValue(prompt);
  };

  const handleSubmission = async () => {
    const text = (inputValue || "").trim();
    if (!text) return;

    if (!isOnline) {
      Alert.alert("Offline", "Please check your internet connection and try again.");
      return;
    }

    const userMsg = { from: "user", text, time: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setInputHeight(40);
    setIsThinking(true);

    setMessages((prev) => [
      ...prev,
      { from: "bot", text: "Thinking...", time: new Date().toISOString(), temp: true },
    ]);

    try {
      const resp = await aiResponse(text);
      setMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].from === "bot" && next[i].temp) {
            next[i] = {
              from: "bot",
              text:
                resp ||
                "Sorry, I could not fetch a response at this time. Please try again.",
              time: new Date().toISOString(),
            };
            break;
          }
        }
        return next;
      });
      setIsOnline(true);
    } catch (e) {
      setMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].from === "bot" && next[i].temp) {
            next[i] = {
              from: "bot",
              text:
                "⚠️ **Connection Issue**\n\nI'm having trouble connecting. Please check your internet connection and try again.",
              time: new Date().toISOString(),
            };
            break;
          }
        }
        return next;
      });
      setIsOnline(false);
    } finally {
      setIsThinking(false);
    }
  };

  const clearChat = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear the conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () =>
          setMessages([
            {
              from: "bot",
              text: "Hello! I'm your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning.",
              time: new Date().toISOString(),
            },
          ]),
      },
    ]);
  };

  const handleInputContentSizeChange = (event) => {
    setInputHeight(Math.min(100, Math.max(40, event.nativeEvent.contentSize.height)));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.statusIndicator,
                  isOnline ? styles.statusOnline : styles.statusOffline,
                ]}
              />
              <Text style={styles.headerTitle}>AI Guide</Text>
            </View>
            <TouchableOpacity
              onPress={clearChat}
              style={[styles.clearButton, messages.length <= 1 && { opacity: 0.3 }]}
              disabled={messages.length <= 1}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color={colors.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesWrap}
          contentContainerStyle={styles.messagesContent}
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, idx) => {
            const isUser = msg.from === "user";
            const isFirstMessage = idx === 0;

            return (
              <View
                key={idx}
                style={[
                  styles.messageContainer,
                  isUser ? styles.userContainer : styles.botContainer,
                ]}
              >
                {/* Header with avatar and timestamp */}
                <View
                  style={[
                    styles.messageHeader,
                    isUser ? styles.userHeader : styles.botHeader,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.avatar}>
                      <MaterialCommunityIcons
                        name="robot"
                        size={16}
                        color={isOnline ? colors.primary : colors.muted}
                      />
                    </View>
                  )}
                  <Text style={styles.timestamp}>
                    {isUser ? "You" : "AI Guide"} • {formatTime(msg.time)}
                  </Text>
                  {isUser && (
                    <View style={styles.avatar}>
                      <MaterialCommunityIcons
                        name="account"
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                  )}
                </View>

                {/* Message Bubble */}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                  {msg.from === "bot" && msg.text === "Thinking..." ? (
                    <View style={styles.thinkingRow}>
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.thinkingText}>Thinking…</Text>
                    </View>
                  ) : msg.from === "bot" ? (
                    <>
                      <Markdown style={markdownStyles}>{msg.text || ""}</Markdown>
                      {isFirstMessage && messages.length === 1 && (
                        <View style={styles.quickPromptsContainer}>
                          <Text style={styles.quickPromptsTitle}>Quick questions:</Text>
                          <View style={styles.quickPromptsGrid}>
                            {quickPrompts.map((prompt, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.quickPrompt}
                                onPress={() => handleQuickPrompt(prompt)}
                                disabled={isThinking}
                              >
                                <Text style={styles.quickPromptText}>{prompt}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={styles.bubbleTextUser}>{msg.text}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputBar}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Ask about earthquake safety..."
              style={[styles.input, { height: inputHeight }]}
              onSubmitEditing={handleSubmission}
              onContentSizeChange={handleInputContentSizeChange}
              returnKeyType="send"
              multiline
              maxLength={500}
              editable={!isThinking && isOnline}
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity
              onPress={handleSubmission}
              style={[
                styles.sendButton,
                (!inputValue.trim() || isThinking || !isOnline) &&
                  styles.sendButtonDisabled,
              ]}
              disabled={!inputValue.trim() || isThinking || !isOnline}
            >
              {isThinking ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {!isOnline && (
            <View style={styles.offlineWarning}>
              <MaterialCommunityIcons name="wifi-off" size={14} color="#EF4444" />
              <Text style={styles.offlineText}>Offline - check connection</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ...existing code...

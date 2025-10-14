import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import Markdown from "react-native-markdown-display";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, globalStyles } from "../../css";
import { aiResponse } from "../../requests";

export default function Guide() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { 
      from: "bot", 
      text: "Hello! I'm your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning.", 
      time: new Date().toISOString() 
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [inputHeight, setInputHeight] = useState(40);
  const scrollViewRef = useRef(null);

  // Quick action prompts - now as buttons in first message
  const quickPrompts = [
    "Create earthquake kit",
    "During earthquake safety",
    "Secure my home", 
    "Emergency contacts",
    "Make a family plan",
    "Learn first aid basics"
  ];

  // Auto-scroll to bottom when messages change
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
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) { return ''; }
  };

  const handleQuickPrompt = (prompt) => {
    setInputValue(prompt);
  };

  const handleSubmission = async () => {
    const text = (inputValue || '').trim();
    if (!text) return;

    // Check if offline
    if (!isOnline) {
      Alert.alert("Offline", "Please check your internet connection and try again.");
      return;
    }

    // append user message
    const userMsg = { from: 'user', text, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setInputHeight(40); // Reset input height

    // add thinking indicator
    setIsThinking(true);
    setMessages(prev => [...prev, { 
      from: 'bot', 
      text: 'Thinking...', 
      time: new Date().toISOString(), 
      temp: true 
    }]);

    try {
      const resp = await aiResponse(text);
      // replace last temp bot message
      setMessages(prev => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].from === 'bot' && next[i].temp) {
            next[i] = { 
              from: 'bot', 
              text: resp || 'Sorry, I could not fetch a response at this time. Please try again.', 
              time: new Date().toISOString() 
            };
            break;
          }
        }
        return next;
      });
      setIsOnline(true);
    } catch (e) {
      // replace with error message
      setMessages(prev => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].from === 'bot' && next[i].temp) {
            next[i] = { 
              from: 'bot', 
              text: '⚠️ **Connection Issue**\n\nI\'m having trouble connecting. Please check your internet connection and try again.', 
              time: new Date().toISOString() 
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
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear the conversation?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => setMessages([
            { 
              from: "bot", 
              text: "Hello! I'm your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning.", 
              time: new Date().toISOString() 
            }
          ])
        }
      ]
    );
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
              <View style={[styles.statusIndicator, isOnline ? styles.statusOnline : styles.statusOffline]} />
              <Text style={styles.headerTitle}>AI Guide</Text>
            </View>
            <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.muted} />
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
            const isUser = msg.from === 'user';
            const isFirstMessage = idx === 0;
            
            return (
              <View key={idx} style={[styles.messageContainer, isUser ? styles.userContainer : styles.botContainer]}>
                
                {/* Header with avatar and timestamp - ABOVE the bubble */}
                <View style={[styles.messageHeader, isUser ? styles.userHeader : styles.botHeader]}>
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
                    {isUser ? 'You' : 'AI Guide'} • {formatTime(msg.time)}
                  </Text>
                  {isUser && (
                    <View style={styles.avatar}>
                      <MaterialCommunityIcons name="account" size={16} color={colors.primary} />
                    </View>
                  )}
                </View>

                {/* Message Bubble */}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                  {msg.from === 'bot' && msg.text === 'Thinking...' ? (
                    <View style={styles.thinkingRow}>
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.thinkingText}>Thinking…</Text>
                    </View>
                  ) : msg.from === 'bot' ? (
                    <>
                      <Markdown style={markdownStyles}>{msg.text || ''}</Markdown>
                      {/* Quick prompts only in first bot message */}
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

        {/* Input Area */}
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
              accessibilityLabel="Message input"
              multiline
              maxLength={500}
              editable={!isThinking && isOnline}
              placeholderTextColor={colors.muted}
            />

            <TouchableOpacity
              onPress={handleSubmission}
              style={[
                styles.sendButton, 
                (!inputValue.trim() || isThinking || !isOnline) && styles.sendButtonDisabled
              ]}
              disabled={!inputValue.trim() || isThinking || !isOnline}
              accessibilityRole="button"
              accessibilityLabel="Send message"
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

const markdownStyles = {
  body: { 
    color: colors.secondary, 
    fontSize: 15, 
    lineHeight: 20,
  },
  strong: {
    color: colors.secondary,
    fontWeight: '600'
  },
  paragraph: {
    marginBottom: 8,
  }
};

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: colors.light 
  },
  wrapper: { 
    flex: 1 
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusOnline: {
    backgroundColor: '#10B981',
  },
  statusOffline: {
    backgroundColor: '#EF4444',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  clearButton: {
    padding: 4,
  },

  // Message Container
  messageContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },

  // Message Header (above bubble)
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  botHeader: {
    justifyContent: 'flex-start',
  },
  userHeader: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  timestamp: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },

  // Message Bubble
  bubble: {
    maxWidth: '90%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  bubbleBot: {
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleTextUser: { 
    color: colors.white, 
    fontSize: 15,
    lineHeight: 20,
  },
  
  // Thinking State
  thinkingRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  thinkingText: {
    fontSize: 15,
    color: colors.muted,
    fontStyle: 'italic',
  },

  // Quick Prompts (in first message)
  quickPromptsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 12,
  },
  quickPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPrompt: {
    backgroundColor: colors.light,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  quickPromptText: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '500',
  },

  // Messages Container
  messagesWrap: { 
    flex: 1, 
  },
  messagesContent: { 
    paddingVertical: 16,
  },

  // Input Area
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    backgroundColor: colors.light, 
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
    color: colors.secondary,
  },
  sendButton: { 
    backgroundColor: colors.primary, 
    width: 40,
    height: 40,
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: { 
    opacity: 0.5,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
});
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, } from "react-native";
import Markdown from "react-native-markdown-display";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../../css";
import { aiResponse } from "../../requests";
import { markdownStyles, styles } from "./GuideStyles";

export default function Guide() {
  const [inputValue, setInputValue] = useState("");
  const [drafts, setDrafts] = useState({});
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I'm Epicenter AI, your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning, as well as assisting with app features.",
      time: new Date().toISOString(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [inputHeight, setInputHeight] = useState(40);
  const [requestCount, setRequestCount] = useState(0);
  const [requestDate, setRequestDate] = useState(null);
  const scrollViewRef = useRef(null);
  const preventAutoScrollRef = useRef(false);

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const quickPrompts = [
    "Create earthquake kit",
    "How to stay safe during an earthquake",
    "Secure my home",
    "Emergency contacts",
    "Make a family plan",
    "Learn first aid basics",
  ];

  // Auto scroll 
  useEffect(() => {
    if (!scrollViewRef.current) return;
    if (preventAutoScrollRef.current) {
      setTimeout(() => {
        preventAutoScrollRef.current = false;
      }, 50);
      return;
    }
    setTimeout(() => {
      try {
        scrollViewRef.current.scrollToEnd({ animated: true });
      } catch (_e) {}
    }, 100);
  }, [messages]);

  const toggleStar = (index) => {
    preventAutoScrollRef.current = true;
    setMessages((prev) => {
      const next = prev.map((m, i) =>
        i === index ? { ...m, starred: !m.starred } : m
      );
      return next;
    });
  };

  const copyToClipboard = async (text) => {
    if (!text) return false;
    if (preventAutoScrollRef) preventAutoScrollRef.current = true;
    try {
      try {
        const ExpoClipboard = require("expo-clipboard");
        if (ExpoClipboard && ExpoClipboard.setStringAsync) {
          await ExpoClipboard.setStringAsync(text);
          return true;
        }
      } catch (_e) {
        // ignore
      }
      try {
        const RNClipboard = require("@react-native-clipboard/clipboard");
        if (RNClipboard && RNClipboard.setString) {
          RNClipboard.setString(text);
          return true;
        }
      } catch (_e) {
        // ignore
      }
      Alert.alert(
        "Copy not available",
        "Copying to clipboard is currently not supported on this device."
      );
      return false;
    } catch (_err) {
      console.warn("Copy failed", _err);
      Alert.alert("Copy failed", "Unable to copy message to clipboard.");
      return false;
    }
  };

  // Daily request count
  useEffect(() => {
    const loadCount = async () => {
      try {
        const raw = await AsyncStorage.getItem("guide_request_count");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const today = new Date().toISOString().slice(0, 10);
        if (parsed?.date === today) {
          setRequestCount(parsed.count || 0);
          setRequestDate(parsed.date);
        } else {
          setRequestCount(0);
          setRequestDate(today);
        }
      } catch (_err) {
        // ignore
      }
    };
    loadCount();
  }, []);

  // Load chats from async storage
  useEffect(() => {
    const loadChats = async () => {
      try {
        const raw = await AsyncStorage.getItem("guide_chats");
        if (!raw) {
          const defaultChat = {
            id: `chat_1`,
            name: "Chat 1",
            createdAt: new Date().toISOString(),
            messages: [
              {
                from: "bot",
                text: "Hello! I'm Epicenter AI, your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning, as well as assisting with app features.",
                time: new Date().toISOString(),
              },
            ],
          };
          setChats([defaultChat]);
          setSelectedChatId(defaultChat.id);
          await AsyncStorage.setItem(
            "guide_chats",
            JSON.stringify([defaultChat])
          );
          return;
        }
        const parsed = JSON.parse(raw);
        setChats(parsed || []);
        try {
          const storedSelected = await AsyncStorage.getItem(
            "guide_selected_chat"
          );
          if (storedSelected) {
            const found = (parsed || []).find((c) => c.id === storedSelected);
            if (found) {
              setSelectedChatId(found.id);
              setMessages(found.messages || []);
              return;
            }
          }
        } catch (_err) {}
        if (parsed && parsed.length) {
          setSelectedChatId(parsed[0].id);
          setMessages(parsed[0].messages || []);
        }
      } catch (_err) {
        // ignore
      }
    };
    loadChats();
  }, []);

  const saveChats = async (nextChats) => {
    try {
      await AsyncStorage.setItem("guide_chats", JSON.stringify(nextChats));
    } catch (_err) {
      // ignore
    }
  };

  useEffect(() => {
    if (!selectedChatId) return;
    setChats((prev) => {
      const next = prev.map((c) =>
        c.id === selectedChatId ? { ...c, messages } : c
      );
      saveChats(next);
      return next;
    });
  }, [messages, selectedChatId]);

  const createNewChat = async () => {
    const nextIndex = (() => {
      try {
        const nums = (chats || []).map((c) => {
          const m = c?.name && c.name.match(/Chat\s*(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        });
        const max = nums.length ? Math.max(...nums) : 0;
        return max + 1;
      } catch (_err) {
        return chats && chats.length ? chats.length + 1 : 1;
      }
    })();

    const newChat = {
      id: `chat_${Date.now()}`,
      name: `Chat ${nextIndex}`,
      createdAt: new Date().toISOString(),
      messages: [
        {
          from: "bot",
          text: "Hello! I'm Epicenter AI, your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning.",
          time: new Date().toISOString(),
        },
      ],
    };
    const next = [newChat, ...(chats || [])];
    setChats(next);
    setSelectedChatId(newChat.id);
    try {
      AsyncStorage.setItem("guide_selected_chat", newChat.id);
    } catch (_err) {
      // ignore
    }
    setMessages(newChat.messages);
    setDrafts((prev) => ({ ...prev, [newChat.id]: "" }));
    await saveChats(next);
  };

  const selectChat = (chatId) => {
    const chat = (chats || []).find((c) => c.id === chatId);
    if (!chat) return;
    setSelectedChatId(chatId);
    try {
      AsyncStorage.setItem("guide_selected_chat", chatId);
    } catch (_err) {}
    setMessages(chat.messages || []);
    setInputValue(drafts[chatId] || "");
  };

  const saveRequestCount = async (date, count) => {
    try {
      await AsyncStorage.setItem(
        "guide_request_count",
        JSON.stringify({ date, count })
      );
    } catch (_err) {
      // ignore
    }
  };

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
    if (selectedChatId) setDrafts((p) => ({ ...p, [selectedChatId]: prompt }));
  };

  // Generate response
  const regenerateResponse = async (msgIndex) => {
    try {
      if (preventAutoScrollRef) preventAutoScrollRef.current = true;
      if (!selectedChatId) return;

      const today = new Date().toISOString().slice(0, 10);
      let currentCount = requestCount || 0;
      if (requestDate !== today) {
        currentCount = 0;
        setRequestDate(today);
        setRequestCount(0);
      }
      if (currentCount >= 10) {
        Alert.alert(
          "Daily limit reached",
          "You have reached your daily limit of 10 AI prompts. Please try again tomorrow."
        );
        return;
      }

      const chat = (chats || []).find((c) => c.id === selectedChatId);
      if (!chat) return;
      const msgs = chat.messages || [];
      let userMsg = null;
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (msgs[i] && msgs[i].from === "user") {
          userMsg = msgs[i];
          break;
        }
      }
      if (!userMsg) {
        Alert.alert(
          "Cannot regenerate",
          "No user prompt found to regenerate from."
        );
        return;
      }

      const allUserMessages = [
        ...(msgs || []).filter((m) => m.from === "user"),
      ];
      const priorUserMessages = allUserMessages
        .slice(-8)
        .map((m) => `User: ${m.text.replace(/\n/g, " ")}`)
        .join("\n");

      const promptWithContext = priorUserMessages
        ? `Conversation history:\n${priorUserMessages}\n\nCurrent question: ${userMsg.text}`
        : userMsg.text;

      const tempMsg = {
        from: "bot",
        text: "Thinking...",
        time: new Date().toISOString(),
        temp: true,
      };
      setMessages((prev) => {
        const next = [...prev];
        if (next[msgIndex]) next[msgIndex] = tempMsg;
        return next;
      });
      // update chats array
      setChats((prev) => {
        const next = (prev || []).map((c) =>
          c.id === selectedChatId
            ? {
                ...c,
                messages: (c.messages || []).map((m, i) =>
                  i === msgIndex ? tempMsg : m
                ),
              }
            : c
        );
        saveChats(next);
        return next;
      });

      setIsThinking(true);

      const newCount = (currentCount || 0) + 1;
      setRequestCount(newCount);
      setRequestDate(today);
      saveRequestCount(today, newCount);

      try {
        const resp = await aiResponse(promptWithContext);
        if (preventAutoScrollRef) preventAutoScrollRef.current = true;
        setMessages((prev) => {
          const next = [...prev];
          if (next[msgIndex] && next[msgIndex].temp) {
            next[msgIndex] = {
              from: "bot",
              text: resp || "(no response)",
              time: new Date().toISOString(),
            };
          } else if (next[msgIndex]) {
            next[msgIndex] = {
              ...next[msgIndex],
              text: resp || next[msgIndex].text,
            };
          }
          return next;
        });

        setChats((prev) => {
          const next = (prev || []).map((c) =>
            c.id === selectedChatId
              ? {
                  ...c,
                  messages: (c.messages || []).map((m, i) =>
                    i === msgIndex
                      ? {
                          from: "bot",
                          text: resp || "(no response)",
                          time: new Date().toISOString(),
                        }
                      : m
                  ),
                }
              : c
          );
          saveChats(next);
          return next;
        });
      } catch (_e) {
        if (preventAutoScrollRef) preventAutoScrollRef.current = true;
        setMessages((prev) => {
          const next = [...prev];
          if (next[msgIndex] && next[msgIndex].temp) {
            next[msgIndex] = {
              from: "bot",
              text: "⚠️ **Connection Issue**\n\nI'm having trouble connecting. Please check your internet connection and try again.",
              time: new Date().toISOString(),
            };
          }
          return next;
        });
      } finally {
        setIsThinking(false);
      }
    } catch (_err) {
      console.warn("regenerateResponse error", _err);
    }
  };

  // Send response
  const handleSubmission = async () => {
    const text = (inputValue || "").trim();
    if (!text) return;

    if (!isOnline) {
      Alert.alert(
        "Offline",
        "Please check your internet connection and try again."
      );
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    let currentCount = requestCount || 0;
    if (requestDate !== today) {
      currentCount = 0;
      setRequestDate(today);
      setRequestCount(0);
    }
    if (currentCount >= 10) {
      Alert.alert(
        "Daily limit reached",
        "You have reached your daily limit of 10 AI prompts. Please try again tomorrow."
      );
      return;
    }

    const chatId = selectedChatId;
    if (!chatId) return;

    const userMsg = { from: "user", text, time: new Date().toISOString() };
    const tempBotMsg = {
      from: "bot",
      text: "Thinking...",
      time: new Date().toISOString(),
      temp: true,
    };

    setChats((prev) => {
      const next = (prev || []).map((c) =>
        c.id === chatId
          ? { ...c, messages: [...(c.messages || []), userMsg, tempBotMsg] }
          : c
      );
      saveChats(next);
      return next;
    });

    if (selectedChatId === chatId)
      setMessages((prev) => [...prev, userMsg, tempBotMsg]);

    setInputValue("");
    setInputHeight(40);
    setIsThinking(true);

    const newCount = (currentCount || 0) + 1;
    setRequestCount(newCount);
    setRequestDate(today);
    saveRequestCount(today, newCount);

    try {
      const chat = (chats || []).find((c) => c.id === chatId) || {
        messages: [],
      };
      const allUserMessages = [
        ...(chat.messages || []).filter((m) => m.from === "user"),
        userMsg,
      ];
      const priorUserMessages = allUserMessages
        .slice(-8)
        .map((m) => `User: ${m.text.replace(/\n/g, " ")}`)
        .join("\n");

      const promptWithContext = priorUserMessages
        ? `Conversation history:\n${priorUserMessages}\n\nCurrent question: ${text}`
        : text;

      const resp = await aiResponse(promptWithContext);
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
      if (chatId) {
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[chatId];
          return next;
        });
      }
    } catch (_e) {
      setMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].from === "bot" && next[i].temp) {
            next[i] = {
              from: "bot",
              text: "⚠️ **Connection Issue**\n\nI'm having trouble connecting. Please check your internet connection and try again.",
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

  // Delete  chat
  const deleteChat = () => {
    if (!selectedChatId) return;
    const chat = (chats || []).find((c) => c.id === selectedChatId);
    if (!chat) return;

    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete '${chat.name}'? This will remove the entire conversation.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const next = (chats || []).filter((c) => c.id !== selectedChatId);
              if (!next || next.length === 0) {
                const defaultChat = {
                  id: `chat_1`,
                  name: "Chat 1",
                  createdAt: new Date().toISOString(),
                  messages: [
                    {
                      from: "bot",
                      text: "Hello! I'm Epicenter AI, your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning.",
                      time: new Date().toISOString(),
                    },
                  ],
                };
                setChats([defaultChat]);
                setSelectedChatId(defaultChat.id);
                try {
                  AsyncStorage.setItem("guide_selected_chat", defaultChat.id);
                } catch (_err) {}
                setMessages(defaultChat.messages);
                await saveChats([defaultChat]);
                return;
              }

              setChats(next);
              setSelectedChatId(next[0].id);
              try {
                AsyncStorage.setItem("guide_selected_chat", next[0].id);
              } catch (_err) {}
              setMessages(next[0].messages || []);
              await saveChats(next);
            } catch (_err) {
              // ignore
            }
          },
        },
      ]
    );
  };

  const handleInputContentSizeChange = (event) => {
    const height = event?.nativeEvent?.contentSize?.height || 40;
    setInputHeight(Math.min(100, Math.max(40, height)));
  };

  const otherHasDraft = (() => {
    try {
      const keys = Object.keys(drafts || {});
      for (let k of keys) {
        if (k !== selectedChatId && drafts[k] && drafts[k].trim()) return true;
      }
      return false;
    } catch {
      return false;
    }
  })();

return (
  <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
    >
      <View style={{ flex: 1 }}>
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
              <Text style={styles.headerTitle}>Epicenter AI</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={deleteChat}
                style={[
                  styles.clearButton,
                  !(chats && chats.length > 1) && { opacity: 0.3 },
                ]}
                disabled={!(chats && chats.length > 1)}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createNewChat}
                style={{ marginLeft: 10, padding: 6 }}
                accessibilityLabel="New chat"
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            {`${requestCount}/10 prompts today`}
          </Text>

          {/* Chat menu */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: 12, paddingTop: 8 }}
          >
            {(chats || []).map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => selectChat(c.id)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor:
                    c.id === selectedChatId ? colors.primary : "#fff",
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor:
                    c.id === selectedChatId ? colors.primary : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    color: c.id === selectedChatId ? "#fff" : colors.secondary,
                    fontWeight: "600",
                  }}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesWrap}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: 16 }, // keeps last message above input
          ]}
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
                {/* Header with avatar + timestamp */}
                <View
                  style={[
                    styles.messageHeader,
                    isUser ? styles.userHeader : styles.botHeader,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.avatar}>
                      <Image
                        source={
                          isOnline
                            ? require("../../assets/images/filledEpicenter.png")
                            : require("../../assets/images/outlineEpicenter.png")
                        }
                        style={{
                          width: 16,
                          height: 16,
                          resizeMode: "contain",
                        }}
                      />
                    </View>
                  )}
                  <Text style={styles.timestamp}>
                    {isUser ? "You" : "Epicenter AI"} • {formatTime(msg.time)}
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

                {/* Message bubble */}
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleBot,
                    msg.starred && { backgroundColor: "#FFF9C4" },
                  ]}
                >
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
                      <Markdown style={markdownStyles}>
                        {msg.text || ""}
                      </Markdown>
                      {isFirstMessage && messages.length === 1 && (
                        <View style={styles.quickPromptsContainer}>
                          <Text style={styles.quickPromptsTitle}>
                            Quick questions:
                          </Text>
                          <View style={styles.quickPromptsGrid}>
                            {quickPrompts.map((prompt, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.quickPrompt}
                                onPress={() => handleQuickPrompt(prompt)}
                                disabled={isThinking}
                              >
                                <Text style={styles.quickPromptText}>
                                  {prompt}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.bubbleTextUser,
                        msg.starred && { color: colors.secondary },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  )}

                  {/* Actions */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 8,
                    }}
                  >
                    {msg.from === "bot" && !msg.temp && (
                      <>
                        <TouchableOpacity
                          onPress={async () => {
                            try {
                              await copyToClipboard(msg.text || "");
                            } catch (_err) {
                              console.warn("Copy failed", _err);
                            }
                          }}
                          style={{ padding: 6, marginRight: 6 }}
                        >
                          <MaterialCommunityIcons
                            name="content-copy"
                            size={18}
                            color={colors.muted}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => regenerateResponse(idx)}
                          style={{ padding: 6, marginRight: 6 }}
                        >
                          <MaterialCommunityIcons
                            name="autorenew"
                            size={18}
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        if (preventAutoScrollRef)
                          preventAutoScrollRef.current = true;
                        toggleStar(idx);
                      }}
                      style={{ padding: 6 }}
                    >
                      <MaterialCommunityIcons
                        name={msg.starred ? "star" : "star-outline"}
                        size={18}
                        color={msg.starred ? "#F59E0B" : colors.muted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <View style={styles.inputBar}>
            <TextInput
              value={inputValue}
              onChangeText={(t) => {
                setInputValue(t);
                if (selectedChatId)
                  setDrafts((p) => ({ ...p, [selectedChatId]: t }));
              }}
              placeholder="Ask about earthquake safety..."
              style={[styles.input, { height: inputHeight }]}
              onSubmitEditing={handleSubmission}
              onContentSizeChange={handleInputContentSizeChange}
              returnKeyType="send"
              multiline
              maxLength={500}
              editable={!isThinking && isOnline && !otherHasDraft}
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
              <MaterialCommunityIcons
                name="wifi-off"
                size={14}
                color="#EF4444"
              />
              <Text style={styles.offlineText}>Offline - check connection</Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}
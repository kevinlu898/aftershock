import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppIcon } from "../../components/app-icon";
import {
  SkeletonList,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { aiResponse } from "../../lib/api";
import { useTheme } from "../../lib/theme";
export default function EpicenterAI() {
  const {
    palette
  } = useTheme();
  const markdownStyles = {
    body: {
      color: palette.foreground,
      fontSize: 15,
      lineHeight: 20
    },
    strong: {
      color: palette.foreground,
      fontWeight: "700"
    },
    paragraph: {
      marginBottom: 8
    }
  };
  const [inputValue, setInputValue] = useState("");
  const [drafts, setDrafts] = useState({});
  const [messages, setMessages] = useState([{
    from: "bot",
    text: "Hello! I'm Epicenter AI, your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning, as well as assisting with app features.",
    time: new Date().toISOString()
  }]);
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [inputHeight, setInputHeight] = useState(40);
  const [requestCount, setRequestCount] = useState(0);
  const [requestDate, setRequestDate] = useState(null);
  const scrollViewRef = useRef(null);
  const preventAutoScrollRef = useRef(false);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatLoading, setChatLoading] = useState(true);
  const showChatSkeleton = useDelayedSkeleton(chatLoading);
  const quickPrompts = ["Create earthquake kit", "How to stay safe during an earthquake", "Secure my home", "Emergency contacts", "Make a family plan", "Learn first aid basics"];

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
        scrollViewRef.current.scrollToEnd({
          animated: true
        });
      } catch (_e) {}
    }, 100);
  }, [messages]);
  const toggleStar = index => {
    preventAutoScrollRef.current = true;
    setMessages(prev => {
      const next = prev.map((m, i) => i === index ? {
        ...m,
        starred: !m.starred
      } : m);
      return next;
    });
  };
  const copyToClipboard = async text => {
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
      Alert.alert("Copy not available", "Copying to clipboard is currently not supported on this device.");
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
        const raw = await AsyncStorage.getItem("epicenter_ai_request_count");
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
        const raw = await AsyncStorage.getItem("epicenter_ai_chats");
        if (!raw) {
          const defaultChat = {
            id: `chat_1`,
            name: "Chat 1",
            createdAt: new Date().toISOString(),
            messages: [{
              from: "bot",
              text: "Hello! I'm Epicenter AI, your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning, as well as assisting with app features.",
              time: new Date().toISOString()
            }]
          };
          setChats([defaultChat]);
          setSelectedChatId(defaultChat.id);
          await AsyncStorage.setItem("epicenter_ai_chats", JSON.stringify([defaultChat]));
          return;
        }
        const parsed = JSON.parse(raw);
        setChats(parsed || []);
        try {
          const storedSelected = await AsyncStorage.getItem("epicenter_ai_selected_chat");
          if (storedSelected) {
            const found = (parsed || []).find(c => c.id === storedSelected);
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
      } finally {
        setChatLoading(false);
      }
    };
    loadChats();
  }, []);
  const saveChats = async nextChats => {
    try {
      await AsyncStorage.setItem("epicenter_ai_chats", JSON.stringify(nextChats));
    } catch (_err) {
      // ignore
    }
  };
  useEffect(() => {
    if (!selectedChatId) return;
    setChats(prev => {
      const next = prev.map(c => c.id === selectedChatId ? {
        ...c,
        messages
      } : c);
      saveChats(next);
      return next;
    });
  }, [messages, selectedChatId]);
  const createNewChat = async () => {
    const nextIndex = (() => {
      try {
        const nums = (chats || []).map(c => {
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
      messages: [{
        from: "bot",
        text: "Hello! I'm Epicenter AI, your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning.",
        time: new Date().toISOString()
      }]
    };
    const next = [newChat, ...(chats || [])];
    setChats(next);
    setSelectedChatId(newChat.id);
    try {
      AsyncStorage.setItem("epicenter_ai_selected_chat", newChat.id);
    } catch (_err) {
      // ignore
    }
    setMessages(newChat.messages);
    setDrafts(prev => ({
      ...prev,
      [newChat.id]: ""
    }));
    await saveChats(next);
  };
  const selectChat = chatId => {
    const chat = (chats || []).find(c => c.id === chatId);
    if (!chat) return;
    setSelectedChatId(chatId);
    try {
      AsyncStorage.setItem("epicenter_ai_selected_chat", chatId);
    } catch (_err) {}
    setMessages(chat.messages || []);
    setInputValue(drafts[chatId] || "");
  };
  const saveRequestCount = async (date, count) => {
    try {
      await AsyncStorage.setItem("epicenter_ai_request_count", JSON.stringify({
        date,
        count
      }));
    } catch (_err) {
      // ignore
    }
  };
  const formatTime = iso => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };
  const handleQuickPrompt = prompt => {
    setInputValue(prompt);
    if (selectedChatId) setDrafts(p => ({
      ...p,
      [selectedChatId]: prompt
    }));
  };

  // Generate response
  const regenerateResponse = async msgIndex => {
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
        Alert.alert("Daily limit reached", "You have reached your daily limit of 10 AI prompts. Please try again tomorrow.");
        return;
      }
      const chat = (chats || []).find(c => c.id === selectedChatId);
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
        Alert.alert("Cannot regenerate", "No user prompt found to regenerate from.");
        return;
      }
      const allUserMessages = [...(msgs || []).filter(m => m.from === "user")];
      const priorUserMessages = allUserMessages.slice(-8).map(m => `User: ${m.text.replace(/\n/g, " ")}`).join("\n");
      const promptWithContext = priorUserMessages ? `Conversation history:\n${priorUserMessages}\n\nCurrent question: ${userMsg.text}` : userMsg.text;
      const tempMsg = {
        from: "bot",
        text: "Thinking...",
        time: new Date().toISOString(),
        temp: true
      };
      setMessages(prev => {
        const next = [...prev];
        if (next[msgIndex]) next[msgIndex] = tempMsg;
        return next;
      });
      // update chats array
      setChats(prev => {
        const next = (prev || []).map(c => c.id === selectedChatId ? {
          ...c,
          messages: (c.messages || []).map((m, i) => i === msgIndex ? tempMsg : m)
        } : c);
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
        setMessages(prev => {
          const next = [...prev];
          if (next[msgIndex] && next[msgIndex].temp) {
            next[msgIndex] = {
              from: "bot",
              text: resp || "(no response)",
              time: new Date().toISOString()
            };
          } else if (next[msgIndex]) {
            next[msgIndex] = {
              ...next[msgIndex],
              text: resp || next[msgIndex].text
            };
          }
          return next;
        });
        setChats(prev => {
          const next = (prev || []).map(c => c.id === selectedChatId ? {
            ...c,
            messages: (c.messages || []).map((m, i) => i === msgIndex ? {
              from: "bot",
              text: resp || "(no response)",
              time: new Date().toISOString()
            } : m)
          } : c);
          saveChats(next);
          return next;
        });
      } catch (_e) {
        if (preventAutoScrollRef) preventAutoScrollRef.current = true;
        setMessages(prev => {
          const next = [...prev];
          if (next[msgIndex] && next[msgIndex].temp) {
            next[msgIndex] = {
              from: "bot",
              text: "⚠️ **Connection Issue**\n\nI'm having trouble connecting. Please check your internet connection and try again.",
              time: new Date().toISOString()
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
      Alert.alert("Offline", "Please check your internet connection and try again.");
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
      Alert.alert("Daily limit reached", "You have reached your daily limit of 10 AI prompts. Please try again tomorrow.");
      return;
    }
    const chatId = selectedChatId;
    if (!chatId) return;
    const userMsg = {
      from: "user",
      text,
      time: new Date().toISOString()
    };
    const tempBotMsg = {
      from: "bot",
      text: "Thinking...",
      time: new Date().toISOString(),
      temp: true
    };
    setChats(prev => {
      const next = (prev || []).map(c => c.id === chatId ? {
        ...c,
        messages: [...(c.messages || []), userMsg, tempBotMsg]
      } : c);
      saveChats(next);
      return next;
    });
    if (selectedChatId === chatId) setMessages(prev => [...prev, userMsg, tempBotMsg]);
    setInputValue("");
    setInputHeight(40);
    setIsThinking(true);
    const newCount = (currentCount || 0) + 1;
    setRequestCount(newCount);
    setRequestDate(today);
    saveRequestCount(today, newCount);
    try {
      const chat = (chats || []).find(c => c.id === chatId) || {
        messages: []
      };
      const allUserMessages = [...(chat.messages || []).filter(m => m.from === "user"), userMsg];
      const priorUserMessages = allUserMessages.slice(-8).map(m => `User: ${m.text.replace(/\n/g, " ")}`).join("\n");
      const promptWithContext = priorUserMessages ? `Conversation history:\n${priorUserMessages}\n\nCurrent question: ${text}` : text;
      const resp = await aiResponse(promptWithContext);
      setMessages(prev => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].from === "bot" && next[i].temp) {
            next[i] = {
              from: "bot",
              text: resp || "Sorry, I could not fetch a response at this time. Please try again.",
              time: new Date().toISOString()
            };
            break;
          }
        }
        return next;
      });
      setIsOnline(true);
      if (chatId) {
        setDrafts(prev => {
          const next = {
            ...prev
          };
          delete next[chatId];
          return next;
        });
      }
    } catch (_e) {
      setMessages(prev => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].from === "bot" && next[i].temp) {
            next[i] = {
              from: "bot",
              text: "⚠️ **Connection Issue**\n\nI'm having trouble connecting. Please check your internet connection and try again.",
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

  // Delete  chat
  const deleteChat = () => {
    if (!selectedChatId) return;
    const chat = (chats || []).find(c => c.id === selectedChatId);
    if (!chat) return;
    Alert.alert("Delete Chat", `Are you sure you want to delete '${chat.name}'? This will remove the entire conversation.`, [{
      text: "Cancel",
      style: "cancel"
    }, {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          const next = (chats || []).filter(c => c.id !== selectedChatId);
          if (!next || next.length === 0) {
            const defaultChat = {
              id: `chat_1`,
              name: "Chat 1",
              createdAt: new Date().toISOString(),
              messages: [{
                from: "bot",
                text: "Hello! I'm Epicenter AI, your earthquake safety assistant. I can help you with earthquake preparedness, safety procedures, and emergency planning.",
                time: new Date().toISOString()
              }]
            };
            setChats([defaultChat]);
            setSelectedChatId(defaultChat.id);
            try {
              AsyncStorage.setItem("epicenter_ai_selected_chat", defaultChat.id);
            } catch (_err) {}
            setMessages(defaultChat.messages);
            await saveChats([defaultChat]);
            return;
          }
          setChats(next);
          setSelectedChatId(next[0].id);
          try {
            AsyncStorage.setItem("epicenter_ai_selected_chat", next[0].id);
          } catch (_err) {}
          setMessages(next[0].messages || []);
          await saveChats(next);
        } catch (_err) {
          // ignore
        }
      }
    }]);
  };
  const handleInputContentSizeChange = event => {
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
  return <View className="flex-1 bg-background">
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View className="flex-1">
        <View className="border-b border-border bg-background px-4 pb-3 pt-2">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Image source={isOnline ? require("../../../assets/images/filledEpicenter.png") : require("../../../assets/images/outlineEpicenter.png")} className="h-6 w-6 object-contain" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[17px] font-bold text-foreground">Epicenter AI</Text>
              <Text className="text-[12px] text-muted-foreground">
                {isOnline ? `${requestCount} of 10 prompts used today` : "Offline"}
              </Text>
            </View>
            <Button unstyled className="h-10 w-10 items-center justify-center rounded-full active:bg-muted" onPress={deleteChat} disabled={!(chats && chats.length > 1)} accessibilityLabel="Delete current chat" style={!(chats && chats.length > 1) ? { opacity: 0.35 } : undefined}>
              <AppIcon name="trash-can-outline" size={20} color={palette.mutedForeground} />
            </Button>
            <Button unstyled className="h-10 w-10 items-center justify-center rounded-full bg-primary" onPress={createNewChat} accessibilityLabel="New chat">
              <AppIcon name="plus" size={20} color={palette.primaryForeground} />
            </Button>
          </View>

          {chats.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pt-3">
            {chats.map(c => <Button unstyled key={c.id} onPress={() => selectChat(c.id)} className={[
              "min-h-8 rounded-full border px-3 py-1.5",
              c.id === selectedChatId ? "border-primary bg-secondary" : "border-border bg-background"
            ].join(" ")}>
              <Text className={c.id === selectedChatId ? "text-[13px] font-semibold text-primary" : "text-[13px] text-muted-foreground"}>
                {c.name}
              </Text>
            </Button>)}
          </ScrollView> : null}
        </View>

        <ScrollView
          className="flex-1 bg-background"
          contentContainerClassName="gap-6 px-4 py-5"
          keyboardDismissMode="interactive"
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          {chatLoading ? showChatSkeleton ? <SkeletonList count={4} /> : <View className="h-64" /> : messages.map((msg, idx) => {
            const isUser = msg.from === "user";
            const isFirstMessage = idx === 0;
            if (isUser) {
              return <View key={idx} className="items-end">
                <View className={["max-w-[84%] rounded-[20px] rounded-br-[6px] bg-secondary px-4 py-3", msg.starred && "border border-warning/40 bg-warning/10"].filter(Boolean).join(" ")}>
                  <Text className="text-[15px] leading-[22px] text-foreground">{msg.text}</Text>
                </View>
                <View className="mt-1 flex-row items-center gap-2 pr-1">
                  <Text className="text-[11px] text-muted-foreground">{formatTime(msg.time)}</Text>
                  <Button unstyled className="h-8 w-8 items-center justify-center" onPress={() => toggleStar(idx)} accessibilityLabel={msg.starred ? "Unstar message" : "Star message"}>
                    <AppIcon name={msg.starred ? "star" : "star-outline"} size={16} color={msg.starred ? palette.warning : palette.mutedForeground} fill={msg.starred ? palette.warning : "none"} />
                  </Button>
                </View>
              </View>;
            }

            return <View key={idx} className="flex-row items-start gap-3">
              <View className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Image source={isOnline ? require("../../../assets/images/filledEpicenter.png") : require("../../../assets/images/outlineEpicenter.png")} className="h-5 w-5 object-contain" />
              </View>
              <View className={["min-w-0 flex-1", msg.starred && "rounded-2xl bg-warning/10 p-3"].filter(Boolean).join(" ")}>
                <View className="mb-1 flex-row items-center gap-2">
                  <Text className="text-[13px] font-bold text-foreground">Epicenter AI</Text>
                  <Text className="text-[11px] text-muted-foreground">{formatTime(msg.time)}</Text>
                </View>
                {msg.text === "Thinking..." ? <View className="flex-row items-center gap-2 py-2">
                  <ActivityIndicator size="small" color={palette.primary} />
                  <Text className="text-[15px] text-muted-foreground">Thinking...</Text>
                </View> : <>
                  <Markdown style={markdownStyles}>{msg.text || ""}</Markdown>
                  {isFirstMessage && messages.length === 1 ? <View className="mt-3 gap-2">
                    <Text className="text-[13px] font-semibold text-muted-foreground">Try asking</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
                      {quickPrompts.map(prompt => <Button unstyled key={prompt} className="min-h-10 max-w-[220px] rounded-full border border-border bg-card px-4 py-2" onPress={() => handleQuickPrompt(prompt)} disabled={isThinking}>
                        <Text numberOfLines={1} className="text-[13px] font-medium text-foreground">{prompt}</Text>
                      </Button>)}
                    </ScrollView>
                  </View> : null}
                </>}
                {!msg.temp && msg.text !== "Thinking..." ? <View className="mt-2 flex-row items-center gap-1">
                  <Button unstyled className="h-9 w-9 items-center justify-center rounded-full active:bg-muted" onPress={() => copyToClipboard(msg.text || "")} accessibilityLabel="Copy response">
                    <AppIcon name="content-copy" size={17} color={palette.mutedForeground} />
                  </Button>
                  <Button unstyled className="h-9 w-9 items-center justify-center rounded-full active:bg-muted" onPress={() => regenerateResponse(idx)} accessibilityLabel="Regenerate response">
                    <AppIcon name="autorenew" size={17} color={palette.mutedForeground} />
                  </Button>
                  <Button unstyled className="h-9 w-9 items-center justify-center rounded-full active:bg-muted" onPress={() => toggleStar(idx)} accessibilityLabel={msg.starred ? "Unstar response" : "Star response"}>
                    <AppIcon name={msg.starred ? "star" : "star-outline"} size={17} color={msg.starred ? palette.warning : palette.mutedForeground} fill={msg.starred ? palette.warning : "none"} />
                  </Button>
                </View> : null}
              </View>
            </View>;
          })}
        </ScrollView>

        <View className="bg-background px-3 pb-3 pt-2">
          {!isOnline ? <View className="mb-2 flex-row items-center justify-center gap-2">
            <AppIcon name="wifi-off" size={14} color={palette.destructive} />
            <Text className="text-[12px] font-medium text-destructive">Offline. Check your connection.</Text>
          </View> : null}
          <View className="flex-row items-end gap-2 rounded-[26px] border border-border bg-card p-1.5">
            <Input
              value={inputValue}
              onChangeText={t => {
                setInputValue(t);
                if (selectedChatId) setDrafts(p => ({ ...p, [selectedChatId]: t }));
              }}
              placeholder="Message Epicenter AI"
              className="min-h-11 flex-1 border-0 bg-transparent px-3 py-2 text-[15px] shadow-none"
              style={{ height: inputHeight }}
              onSubmitEditing={handleSubmission}
              onContentSizeChange={handleInputContentSizeChange}
              returnKeyType="send"
              multiline
              maxLength={500}
              editable={!isThinking && isOnline && !otherHasDraft}
            />
            <Button unstyled onPress={handleSubmission} className={["h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary", (!inputValue.trim() || isThinking || !isOnline) && "opacity-40"].filter(Boolean).join(" ")} disabled={!inputValue.trim() || isThinking || !isOnline} accessibilityLabel="Send message">
              {isThinking ? <ActivityIndicator color={palette.primaryForeground} size="small" /> : <AppIcon name="send" size={18} color={palette.primaryForeground} />}
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </View>;
}

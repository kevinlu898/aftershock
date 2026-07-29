import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from "react-native";
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
  return <SafeAreaView className={"flex-1 bg-background"}>
    <KeyboardAvoidingView className={"flex-1"} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}>
      <View className="flex-1">
        {/* Header */}
        <View className={"px-[20px] pb-[14px] bg-card border-b border-border shadow-sm items-center"}>
          <View className={"flex-row justify-between items-center w-[100%]"}>
            <View className={"flex-row items-center flex-1 justify-start"}>
              <View className={["w-[10px] h-[10px] rounded-[5px] mr-[8px]", isOnline ? "bg-primary" : "bg-destructive"].filter(Boolean).join(" ")} />
              <Text className={"text-[18px] font-bold text-secondary-foreground text-center"}>Epicenter AI</Text>
            </View>

            <View className="flex-row items-center">
              <Button unstyled onPress={deleteChat} className={["p-[6px]"].filter(Boolean).join(" ")} style={!(chats && chats.length > 1) && {
                opacity: 0.3
              }} disabled={!(chats && chats.length > 1)}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={palette.mutedForeground} />
              </Button>
              <Button unstyled onPress={createNewChat} className="ml-[10px] p-[6px]" accessibilityLabel="New chat">
                <MaterialCommunityIcons name="plus" size={20} color={palette.primary} />
              </Button>
            </View>
          </View>

          <Text className="text-[12px] text-muted-foreground text-center mt-[6px]">
            {`${requestCount}/10 prompts today`}
          </Text>

          {/* Chat menu */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-[12px] pt-[8px]">
            {(chats || []).map(c => <Button unstyled
              key={c.id}
              onPress={() => selectChat(c.id)}
              className={[
                "mr-2 rounded-full border px-3 py-1.5",
                c.id === selectedChatId
                  ? "border-primary bg-primary"
                  : "border-border bg-card"
              ].join(" ")}
            >
                <Text className={[
                  "font-semibold",
                  c.id === selectedChatId
                    ? "text-primary-foreground"
                    : "text-secondary-foreground"
                ].join(" ")}>
                  {c.name}
                </Text>
              </Button>)}
          </ScrollView>
        </View>

        {/* Messages */}
        <ScrollView className={"flex-1 bg-background"} contentContainerClassName={["p-[18px] pb-[28px]", "pb-[16px]"].filter(Boolean).join(" ")} ref={scrollViewRef} showsVerticalScrollIndicator={false}>
          {messages.map((msg, idx) => {
            const isUser = msg.from === "user";
            const isFirstMessage = idx === 0;
            return <View key={idx} className={["my-[10px]", isUser ? "items-end" : "items-start"].filter(Boolean).join(" ")}>
                {/* Header with avatar + timestamp */}
                <View className={["flex-row items-center mb-[6px] px-[8px]", isUser ? "justify-end" : "justify-start"].filter(Boolean).join(" ")}>
                  {!isUser && <View className={"w-[28px] h-[28px] rounded-[14px] bg-background items-center justify-center mx-[6px]"}>
                      <Image source={isOnline ? require("../../../assets/images/filledEpicenter.png") : require("../../../assets/images/outlineEpicenter.png")} className="w-[16px] h-[16px] object-contain" />
                    </View>}
                  <Text className={"text-[12px] text-muted-foreground font-medium"}>
                    {isUser ? "You" : "Epicenter AI"} • {formatTime(msg.time)}
                  </Text>
                  {isUser && <View className={"w-[28px] h-[28px] rounded-[14px] bg-background items-center justify-center mx-[6px]"}>
                      <MaterialCommunityIcons name="account" size={16} color={palette.primary} />
                    </View>}
                </View>

                {/* Message bubble */}
                <View className={[
                  "max-w-[88%] p-[15px] rounded-[18px] shadow-sm",
                  isUser
                    ? "bg-primary rounded-tr-[6px] mr-[4px]"
                    : "bg-card rounded-tl-[6px] ml-[4px] border border-border",
                  msg.starred && "bg-warning/10"
                ].filter(Boolean).join(" ")}>
                  {msg.from === "bot" && msg.text === "Thinking..." ? <View className={"flex-row items-center"}>
                      <ActivityIndicator size="small" color={palette.primary} className="mr-[8px]" />
                      <Text className={"text-[15px] text-muted-foreground"}>Thinking…</Text>
                    </View> : msg.from === "bot" ? <>
                      <Markdown style={markdownStyles}>
                        {msg.text || ""}
                      </Markdown>
                      {isFirstMessage && messages.length === 1 && <View className={"mt-[14px] pt-[12px] border-t border-border"}>
                          <Text className={"text-[14px] font-semibold text-secondary-foreground mb-[8px]"}>
                            Quick questions:
                          </Text>
                          <View className={"flex-row flex-wrap"}>
                            {quickPrompts.map((prompt, index) => <Button unstyled key={index} className={"bg-background border border-border px-[12px] py-[8px] rounded-[18px] m-[6px]"} onPress={() => handleQuickPrompt(prompt)} disabled={isThinking}>
                                <Text className={"text-[13px] text-secondary-foreground font-medium"}>
                                  {prompt}
                                </Text>
                              </Button>)}
                          </View>
                        </View>}
                    </> : <Text className={[
                      "text-[15px] leading-[21px]",
                      msg.starred ? "text-foreground" : "text-primary-foreground"
                    ].join(" ")}>
                      {msg.text}
                    </Text>}

                  {/* Actions */}
                  <View className="flex-row justify-end mt-[8px]">
                    {msg.from === "bot" && !msg.temp && <>
                        <Button unstyled onPress={async () => {
                      try {
                        await copyToClipboard(msg.text || "");
                      } catch (_err) {
                        console.warn("Copy failed", _err);
                      }
                    }} className="p-[6px] mr-[6px]">
                          <MaterialCommunityIcons name="content-copy" size={18} color={palette.mutedForeground} />
                        </Button>
                        <Button unstyled onPress={() => regenerateResponse(idx)} className="p-[6px] mr-[6px]">
                          <MaterialCommunityIcons name="autorenew" size={18} color={palette.primary} />
                        </Button>
                      </>}
                    <Button unstyled onPress={() => {
                    if (preventAutoScrollRef) preventAutoScrollRef.current = true;
                    toggleStar(idx);
                  }} className="p-[6px]">
                      <MaterialCommunityIcons name={msg.starred ? "star" : "star-outline"} size={18} color={msg.starred ? palette.warning : palette.mutedForeground} />
                    </Button>
                  </View>
                </View>
              </View>;
          })}
        </ScrollView>

        {/* Input Section */}
        <View className={"bg-card px-[16px] pt-[10px] border-t border-border shadow-sm"}>
          <View className={"flex-row items-end"}>
            <Input value={inputValue} onChangeText={t => {
              setInputValue(t);
              if (selectedChatId) setDrafts(p => ({
                ...p,
                [selectedChatId]: t
              }));
            }} placeholder="Ask about earthquake safety..." className={["flex-1 border border-border rounded-[24px] px-[16px] py-[10px] text-[15px] bg-muted mr-[8px] text-secondary-foreground"].filter(Boolean).join(" ")} style={{
              height: inputHeight
            }} onSubmitEditing={handleSubmission} onContentSizeChange={handleInputContentSizeChange} returnKeyType="send" multiline maxLength={500} editable={!isThinking && isOnline && !otherHasDraft} />
            <Button unstyled onPress={handleSubmission} className={["w-[44px] h-[44px] rounded-[22px] bg-primary items-center justify-center", (!inputValue.trim() || isThinking || !isOnline) && "opacity-[0.5]"].filter(Boolean).join(" ")} disabled={!inputValue.trim() || isThinking || !isOnline}>
              {isThinking ? <ActivityIndicator color={palette.primaryForeground} size="small" /> : <MaterialCommunityIcons name="send" size={18} color={palette.primaryForeground} />}
            </Button>
          </View>

          {!isOnline && <View className={"flex-row items-center justify-center mt-[6px]"}>
              <MaterialCommunityIcons name="wifi-off" size={14} color={palette.destructive} />
              <Text className={"text-[12px] text-destructive font-medium"}>Offline - check connection</Text>
            </View>}
        </View>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "../../components/app-icon";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SkeletonList, useDelayedSkeleton } from "../../components/ui/skeleton";
import { aiResponse } from "../../lib/api";
import { useTheme } from "../../lib/theme";

const QUICK_PROMPTS = [
  "Build an earthquake kit for my home",
  "What should I do during an earthquake?",
  "Help me secure my home",
  "Make a family emergency plan",
  "What emergency contacts should I add?",
  "Teach me basic earthquake first aid",
];

const chatNameFromPrompt = (prompt) => {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New conversation";
  const words = cleaned.split(" ");
  return words.slice(0, 6).join(" ") + (words.length > 6 ? "…" : "");
};

const isGenericChatName = (name) => !name || name === "New conversation" || /^Chat\s*\d+$/i.test(name);

export default function EpicenterAI() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState("");
  const [drafts, setDrafts] = useState({});
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [inputHeight, setInputHeight] = useState(44);
  const [requestCount, setRequestCount] = useState(0);
  const [requestDate, setRequestDate] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatLoading, setChatLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollViewRef = useRef(null);
  const showChatSkeleton = useDelayedSkeleton(chatLoading);

  const markdownStyles = {
    body: { color: palette.foreground, fontSize: 15, lineHeight: 22 },
    strong: { color: palette.foreground, fontWeight: "700" },
    paragraph: { marginBottom: 8 },
  };

  const saveChats = async (nextChats) => {
    try {
      await AsyncStorage.setItem("epicenter_ai_chats", JSON.stringify(nextChats));
    } catch (_error) {}
  };

  useEffect(() => {
    AsyncStorage.getItem("epicenter_ai_request_count")
      .then((raw) => {
        if (!raw) return;
        const stored = JSON.parse(raw);
        const today = new Date().toISOString().slice(0, 10);
        if (stored?.date === today) {
          setRequestCount(stored.count || 0);
          setRequestDate(stored.date);
        } else {
          setRequestDate(today);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const raw = await AsyncStorage.getItem("epicenter_ai_chats");
        let storedChats = raw ? JSON.parse(raw) : [];
        storedChats = storedChats.filter((chat) =>
          chat.messages?.some((message) => message.from === "user")
        );
        const namedChats = storedChats.map((chat) => {
          const firstPrompt = chat.messages?.find((message) => message.from === "user")?.text;
          return isGenericChatName(chat.name) && firstPrompt
            ? { ...chat, name: chatNameFromPrompt(firstPrompt) }
            : chat;
        });
        storedChats = namedChats;
        setChats(storedChats);
        const storedSelected = await AsyncStorage.getItem("epicenter_ai_selected_chat");
        const selected = storedChats.find((chat) => chat.id === storedSelected) || storedChats[0];
        setSelectedChatId(selected?.id || null);
        setMessages(selected?.messages || []);
        if (JSON.stringify(namedChats) !== raw) await saveChats(storedChats);
      } catch (_error) {
        setChats([]);
        setSelectedChatId(null);
        setMessages([]);
      } finally {
        setChatLoading(false);
      }
    };
    loadChats();
  }, []);

  useEffect(() => {
    if (!selectedChatId || chatLoading) return;
    setChats((current) => {
      const next = current.map((chat) =>
        chat.id === selectedChatId ? { ...chat, messages } : chat
      );
      saveChats(next);
      return next;
    });
  }, [messages, selectedChatId, chatLoading]);

  useEffect(() => {
    if (!scrollViewRef.current) return;
    const timer = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages, isThinking]);

  const persistSelectedChat = (chatId) => {
    AsyncStorage.setItem("epicenter_ai_selected_chat", chatId).catch(() => {});
  };

  const createNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
    setInputValue("");
    setSidebarOpen(false);
  };

  const selectChat = (chatId) => {
    const chat = chats.find((item) => item.id === chatId);
    if (!chat) return;
    setSelectedChatId(chatId);
    setMessages(chat.messages || []);
    setInputValue(drafts[chatId] || "");
    setSidebarOpen(false);
    persistSelectedChat(chatId);
  };

  const saveRequestCount = (date, count) =>
    AsyncStorage.setItem("epicenter_ai_request_count", JSON.stringify({ date, count })).catch(() => {});

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch (_error) {
      return "";
    }
  };

  const formatChatDate = (iso) => {
    if (!iso) return "";
    try {
      const date = new Date(iso);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) return "Today";
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch (_error) {
      return "";
    }
  };

  const copyToClipboard = async (text) => {
    try {
      const ExpoClipboard = require("expo-clipboard");
      await ExpoClipboard?.setStringAsync?.(text);
    } catch (_error) {
      Alert.alert("Copy not available", "Copying is not supported on this device.");
    }
  };

  const toggleStar = (index) => {
    setMessages((current) => current.map((message, i) => (i === index ? { ...message, starred: !message.starred } : message)));
  };

  const handleQuickPrompt = (prompt) => {
    setInputValue(prompt);
    if (selectedChatId) setDrafts((current) => ({ ...current, [selectedChatId]: prompt }));
  };

  const canMakeRequest = () => {
    const today = new Date().toISOString().slice(0, 10);
    const currentCount = requestDate === today ? requestCount : 0;
    if (currentCount >= 10) {
      Alert.alert("Daily limit reached", "You have reached your daily limit of 10 AI prompts. Please try again tomorrow.");
      return null;
    }
    const nextCount = currentCount + 1;
    setRequestCount(nextCount);
    setRequestDate(today);
    saveRequestCount(today, nextCount);
    return true;
  };

  const regenerateResponse = async (messageIndex) => {
    const userMessage = [...messages.slice(0, messageIndex)].reverse().find((message) => message.from === "user");
    if (!userMessage || !selectedChatId || !canMakeRequest()) return;
    const thinking = { from: "bot", text: "Thinking…", time: new Date().toISOString(), temp: true };
    setMessages((current) => current.map((message, index) => (index === messageIndex ? thinking : message)));
    setIsThinking(true);
    try {
      const context = messages.filter((message) => message.from === "user").slice(-8)
        .map((message) => `User: ${message.text.replace(/\n/g, " ")}`).join("\n");
      const response = await aiResponse(`Conversation history:\n${context}\n\nCurrent question: ${userMessage.text}`);
      setMessages((current) => current.map((message, index) => (
        index === messageIndex ? { from: "bot", text: response || "I couldn’t generate a response. Please try again.", time: new Date().toISOString() } : message
      )));
      setIsOnline(true);
    } catch (_error) {
      setMessages((current) => current.map((message, index) => (
        index === messageIndex ? { from: "bot", text: "⚠️ **Connection issue**\n\nI’m having trouble connecting. Please check your internet connection and try again.", time: new Date().toISOString() } : message
      )));
      setIsOnline(false);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmission = async () => {
    const text = inputValue.trim();
    if (!text || isThinking) return;
    if (!isOnline) {
      Alert.alert("Offline", "Please check your internet connection and try again.");
      return;
    }
    if (!canMakeRequest()) return;
    const userMessage = { from: "user", text, time: new Date().toISOString() };
    const thinking = { from: "bot", text: "Thinking…", time: new Date().toISOString(), temp: true };
    const chatId = selectedChatId || `chat_${Date.now()}`;
    const chatAtSend = chats.find((chat) => chat.id === chatId);
    const nextMessages = [...(chatAtSend?.messages || []), userMessage, thinking];
    const nextChat = chatAtSend
      ? { ...chatAtSend, name: isGenericChatName(chatAtSend.name) ? chatNameFromPrompt(text) : chatAtSend.name, messages: nextMessages }
      : { id: chatId, name: chatNameFromPrompt(text), createdAt: new Date().toISOString(), messages: nextMessages };
    setChats((current) => {
      const next = chatAtSend ? current.map((chat) => (chat.id === chatId ? nextChat : chat)) : [nextChat, ...current];
      saveChats(next);
      return next;
    });
    setSelectedChatId(chatId);
    persistSelectedChat(chatId);
    setMessages(nextMessages);
    setInputValue("");
    setInputHeight(44);
    setDrafts((current) => ({ ...current, [chatId]: "" }));
    setIsThinking(true);
    try {
      const allUserMessages = [...(chatAtSend?.messages || []).filter((message) => message.from === "user"), userMessage];
      const context = allUserMessages.slice(-8).map((message) => `User: ${message.text.replace(/\n/g, " ")}`).join("\n");
      const response = await aiResponse(`Conversation history:\n${context}\n\nCurrent question: ${text}`);
      setMessages((current) => {
        const next = [...current];
        const index = next.map((message) => message.temp).lastIndexOf(true);
        if (index >= 0) next[index] = { from: "bot", text: response || "I couldn’t generate a response. Please try again.", time: new Date().toISOString() };
        return next;
      });
      setIsOnline(true);
    } catch (_error) {
      setMessages((current) => {
        const next = [...current];
        const index = next.map((message) => message.temp).lastIndexOf(true);
        if (index >= 0) next[index] = { from: "bot", text: "⚠️ **Connection issue**\n\nI’m having trouble connecting. Please check your internet connection and try again.", time: new Date().toISOString() };
        return next;
      });
      setIsOnline(false);
    } finally {
      setIsThinking(false);
    }
  };

  const deleteChat = () => {
    const chat = chats.find((item) => item.id === selectedChatId);
    if (!chat || chats.length < 2) return;
    Alert.alert("Delete conversation", `Delete “${chat.name}”? This can’t be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const next = chats.filter((item) => item.id !== selectedChatId);
          setChats(next);
          setSelectedChatId(next[0].id);
          setMessages(next[0].messages || []);
          persistSelectedChat(next[0].id);
          saveChats(next);
        },
      },
    ]);
  };

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const inputDisabled = isThinking || !isOnline;

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1">
          <View className="flex-row items-center gap-3 border-b border-border bg-background px-4 py-3">
            <Button unstyled onPress={() => setSidebarOpen(true)} className="h-10 w-10 items-center justify-center rounded-full active:bg-secondary" accessibilityLabel="Open conversations">
              <AppIcon name="menu" size={22} color={palette.foreground} />
            </Button>
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-[16px] font-bold text-foreground">{selectedChat?.name || "New chat"}</Text>
              <Text className="text-[12px] text-muted-foreground">{isOnline ? "Earthquake safety assistant" : "Offline"}</Text>
            </View>
            <Button unstyled onPress={createNewChat} className="h-10 w-10 items-center justify-center rounded-full bg-primary" accessibilityLabel="Start a new conversation">
              <AppIcon name="plus" size={20} color={palette.primaryForeground} />
            </Button>
          </View>

          <ScrollView ref={scrollViewRef} className="flex-1 bg-background" contentContainerClassName="gap-6 px-4 py-5" contentInsetAdjustmentBehavior="automatic" keyboardDismissMode="interactive" showsVerticalScrollIndicator={false}>
            {chatLoading ? (showChatSkeleton ? <SkeletonList count={4} /> : <View className="h-64" />) : messages.length === 0 ? (
              <View className="gap-2 pt-2">
                <View className="mb-5 items-center gap-2 px-5 pt-2">
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-secondary"><Image source={require("../../../assets/images/filledEpicenter.png")} className="h-9 w-9 object-contain" /></View>
                  <Text className="text-center text-[22px] font-bold text-foreground">Epicenter AI</Text>
                  <Text className="text-center text-[14px] leading-5 text-muted-foreground">Your earthquake safety guide for plans, preparation, and quick answers.</Text>
                </View>
                <View className="flex-row items-center gap-2"><View className="h-8 w-8 items-center justify-center rounded-full bg-secondary"><AppIcon name="lightbulb" size={16} color={palette.primary} /></View><Text className="text-[13px] font-semibold text-muted-foreground">Try asking</Text></View>
                {QUICK_PROMPTS.map((prompt) => (
                  <Button key={prompt} unstyled onPress={() => handleQuickPrompt(prompt)} disabled={inputDisabled} className="flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 active:bg-secondary" style={{ borderCurve: "continuous" }}>
                    <Text className="flex-1 text-left text-[14px] font-medium leading-5 text-foreground">{prompt}</Text>
                    <AppIcon name="chevron-right" size={17} color={palette.mutedForeground} />
                  </Button>
                ))}
              </View>
            ) : messages.map((message, index) => {
              const isUser = message.from === "user";
              if (isUser) return (
                <View key={`${message.time}-${index}`} className="items-end">
                  <View className={["max-w-[86%] rounded-[22px] rounded-br-md bg-primary px-4 py-3", message.starred && "border border-warning/50"].filter(Boolean).join(" ")} style={{ borderCurve: "continuous" }}>
                    <Text selectable className="text-[15px] leading-[22px] text-primary-foreground">{message.text}</Text>
                  </View>
                  <View className="mt-1 flex-row items-center gap-1 pr-1">
                    <Text className="text-[11px] text-muted-foreground">{formatTime(message.time)}</Text>
                    <Button unstyled className="h-7 w-7 items-center justify-center rounded-full active:bg-secondary" onPress={() => toggleStar(index)} accessibilityLabel="Save message">
                      <AppIcon name={message.starred ? "star" : "star-outline"} size={15} color={message.starred ? palette.warning : palette.mutedForeground} fill={message.starred ? palette.warning : "none"} />
                    </Button>
                  </View>
                </View>
              );

              return (
                <View key={`${message.time}-${index}`} className={message.starred ? "rounded-2xl bg-warning/10 p-3" : ""}>
                  <View className="flex-row items-center gap-2">
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-secondary" style={{ borderCurve: "continuous" }}>
                      <Image source={isOnline ? require("../../../assets/images/filledEpicenter.png") : require("../../../assets/images/outlineEpicenter.png")} className="h-6 w-6 object-contain" />
                    </View>
                    <Text className="text-[13px] font-bold text-foreground">Epicenter AI</Text>
                    <Text className="text-[11px] text-muted-foreground">{formatTime(message.time)}</Text>
                  </View>
                  {message.temp ? (
                    <View className="flex-row items-center gap-2 py-3"><ActivityIndicator size="small" color={palette.primary} /><Text className="text-[15px] text-muted-foreground">Thinking…</Text></View>
                  ) : (
                    <Markdown style={markdownStyles}>{message.text || ""}</Markdown>
                  )}
                  {!message.temp ? (
                    <View className="mt-2 flex-row items-center gap-1">
                      <Button unstyled className="h-9 w-9 items-center justify-center rounded-full active:bg-secondary" onPress={() => copyToClipboard(message.text || "")} accessibilityLabel="Copy response"><AppIcon name="content-copy" size={17} color={palette.mutedForeground} /></Button>
                      <Button unstyled className="h-9 w-9 items-center justify-center rounded-full active:bg-secondary" onPress={() => regenerateResponse(index)} disabled={isThinking} accessibilityLabel="Regenerate response"><AppIcon name="autorenew" size={17} color={palette.mutedForeground} /></Button>
                      <Button unstyled className="h-9 w-9 items-center justify-center rounded-full active:bg-secondary" onPress={() => toggleStar(index)} accessibilityLabel="Save response"><AppIcon name={message.starred ? "star" : "star-outline"} size={17} color={message.starred ? palette.warning : palette.mutedForeground} fill={message.starred ? palette.warning : "none"} /></Button>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>

          <View className="border-t border-border bg-background px-4 pb-3 pt-3">
            {!isOnline ? <View className="mb-2 flex-row items-center justify-center gap-2"><AppIcon name="wifi-off" size={14} color={palette.destructive} /><Text className="text-[12px] font-medium text-destructive">Offline. Check your connection.</Text></View> : null}
            <View className="flex-row items-end gap-2 rounded-[24px] border border-border bg-card p-2" style={{ borderCurve: "continuous" }}>
              <Input value={inputValue} onChangeText={(value) => { setInputValue(value); if (selectedChatId) setDrafts((current) => ({ ...current, [selectedChatId]: value })); }} placeholder="Ask about earthquake safety" className="max-h-28 min-h-11 flex-1 border-0 bg-transparent px-2 py-2 text-[15px] shadow-none" style={{ height: inputHeight }} onContentSizeChange={(event) => setInputHeight(Math.min(112, Math.max(44, event.nativeEvent.contentSize.height)))} multiline returnKeyType="send" blurOnSubmit={false} maxLength={500} editable={!inputDisabled} />
              <View className="pb-0.5">
                <Button unstyled onPress={handleSubmission} disabled={!inputValue.trim() || inputDisabled} className={["h-10 w-10 items-center justify-center rounded-full bg-primary", (!inputValue.trim() || inputDisabled) && "opacity-40"].filter(Boolean).join(" ")} accessibilityLabel="Send message">
                  {isThinking ? <ActivityIndicator color={palette.primaryForeground} size="small" /> : <AppIcon name="send" size={18} color={palette.primaryForeground} />}
                </Button>
              </View>
            </View>
            <Text className="px-2 pt-2 text-center text-[11px] text-muted-foreground">Epicenter AI can make mistakes. Check official guidance in an emergency.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={sidebarOpen} transparent animationType="fade" onRequestClose={() => setSidebarOpen(false)}>
        <View className="flex-1 flex-row bg-black/35" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="w-[86%] max-w-[360px] border-r border-border bg-background pt-3" style={{ boxShadow: "2px 0 12px rgba(0, 0, 0, 0.12)" }}>
            <View className="flex-row items-center justify-between px-4 pb-4">
              <View className="flex-row items-center gap-3"><View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary"><Image source={require("../../../assets/images/filledEpicenter.png")} className="h-6 w-6 object-contain" /></View><Text className="text-[19px] font-bold text-foreground">Epicenter AI</Text></View>
              <Button unstyled onPress={() => setSidebarOpen(false)} className="h-10 w-10 items-center justify-center rounded-full active:bg-secondary" accessibilityLabel="Close conversations"><AppIcon name="close" size={20} color={palette.foreground} /></Button>
            </View>
            <View className="px-4 pb-4"><Button onPress={createNewChat} className="min-h-12 rounded-xl"><AppIcon name="plus" size={18} color={palette.primaryForeground} /><Text className="font-semibold text-primary-foreground">New chat</Text></Button></View>
            <Text className="mt-5 px-5 pb-2 text-[12px] font-bold text-muted-foreground">RECENT CHATS</Text>
            <ScrollView className="flex-1" contentContainerClassName="gap-1 px-3 pb-6" showsVerticalScrollIndicator={false}>
              {chats.map((chat) => <Button key={chat.id} unstyled onPress={() => selectChat(chat.id)} className={["w-full items-start justify-start rounded-xl px-3 py-3", chat.id === selectedChatId ? "bg-secondary" : "active:bg-secondary"].join(" ")}>
                <View className="min-w-0 gap-0.5"><Text numberOfLines={1} className={["text-[14px] font-semibold", chat.id === selectedChatId ? "text-primary" : "text-foreground"].join(" ")}>{chat.name}</Text><Text className="text-[12px] text-muted-foreground">{formatChatDate(chat.messages?.[chat.messages.length - 1]?.time || chat.createdAt)}</Text></View>
              </Button>)}
            </ScrollView>
            <View className="border-t border-border p-3"><Button unstyled onPress={deleteChat} disabled={chats.length < 2} className="flex-row items-center gap-3 rounded-xl px-3 py-3 active:bg-secondary"><AppIcon name="trash-can-outline" size={18} color={chats.length < 2 ? palette.border : palette.destructive} /><Text className={chats.length < 2 ? "text-[14px] font-semibold text-muted-foreground" : "text-[14px] font-semibold text-destructive"}>Delete current chat</Text></Button></View>
          </View>
          <Pressable className="flex-1" onPress={() => setSidebarOpen(false)} accessibilityLabel="Close conversations" />
        </View>
      </Modal>
    </View>
  );
}

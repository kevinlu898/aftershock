import { Platform, StyleSheet } from 'react-native';
import { colors } from '../../css';

export const markdownStyles = {
  body: {
    color: colors.secondary,
    fontSize: 15,
    lineHeight: 20,
  },
  strong: {
    color: colors.secondary,
    fontWeight: '600',
  },
  paragraph: {
    marginBottom: 8,
  },
};

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.light,
  },
  wrapper: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 3,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusOnline: { backgroundColor: '#10B981' },
  statusOffline: { backgroundColor: '#EF4444' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  clearButton: { padding: 6 },

  // Messages
  messagesWrap: { flex: 1 },
  messagesContent: { padding: 16 },
  messageContainer: { marginVertical: 10 },
  botContainer: { alignItems: 'flex-start' },
  userContainer: { alignItems: 'flex-end' },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  botHeader: { justifyContent: 'flex-start' },
  userHeader: { justifyContent: 'flex-end' },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Bubbles
  bubble: {
    maxWidth: '88%',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  bubbleBot: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 4,
    marginLeft: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
    marginRight: 4,
  },
  bubbleTextUser: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 21,
  },

  // Thinking
  thinkingRow: { flexDirection: 'row', alignItems: 'center' },
  thinkingText: { fontSize: 15, color: '#9CA3AF', fontStyle: 'italic' },

  // Quick Prompts
  quickPromptsContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 8,
  },
  quickPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickPrompt: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickPromptText: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '500',
  },

  // Input
  inputContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -1 },
    shadowRadius: 3,
    elevation: 5,
  },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    color: colors.secondary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
});

export default styles;

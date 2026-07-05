import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/chat' : 'http://localhost:8000/chat';

export default function TrainerScreen() {
  const { profile, messages, addMessage } = useContext(AppContext);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = { id: Date.now().toString(), text: inputText, sender: 'user', date: new Date().toISOString() };
    await addMessage(newUserMessage);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newUserMessage.text,
          profile: profile
        }),
      });
      const data = await response.json();
      
      const newAiMessage = { id: (Date.now() + 1).toString(), text: data.reply, sender: 'ai', date: new Date().toISOString() };
      await addMessage(newAiMessage);
    } catch (error) {
      console.error(error);
      const errorMessage = { id: (Date.now() + 1).toString(), text: '通信エラー: AIサーバーに接続できませんでした。', sender: 'ai', date: new Date().toISOString() };
      await addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.sender === 'ai' && <Ionicons name="logo-android" size={16} color={theme.colors.primary} style={{ marginBottom: 4 }} />}
      <Text style={[styles.messageText, item.sender === 'ai' && styles.aiMessageText]}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.planBanner}>
        <View style={styles.planBannerLeft}>
          <Ionicons name="clipboard-outline" size={24} color={theme.colors.primary} />
          <View style={styles.planBannerText}>
            <Text style={styles.planTitle}>AIダイエットプラン</Text>
            <Text style={styles.planSubtitle}>1日の目標: 1800kcal</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.planButton}>
          <Text style={styles.planButtonText}>詳細</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
        inverted={false}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>AIが入力中...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="AIコーチに相談する..."
          placeholderTextColor={theme.colors.textLight}
          multiline={true}
          onKeyPress={(e) => {
            if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <TouchableOpacity style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} onPress={sendMessage} disabled={!inputText.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  planBanner: { flexDirection: 'row', backgroundColor: theme.colors.primaryLight, padding: 16, margin: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.colors.primaryLight },
  planBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  planBannerText: { marginLeft: 12 },
  planTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primaryDark },
  planSubtitle: { fontSize: 12, color: theme.colors.primaryDark, marginTop: 2 },
  planButton: { backgroundColor: theme.colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.primary },
  planButtonText: { color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' },
  
  chatList: { paddingHorizontal: 16, paddingBottom: 16 },
  messageBubble: { maxWidth: '85%', padding: 12, borderRadius: 16, marginBottom: 16 },
  userBubble: { backgroundColor: theme.colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: theme.colors.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  messageText: { fontSize: 15, color: '#fff', lineHeight: 22 },
  aiMessageText: { color: theme.colors.text },
  
  typingIndicator: { paddingHorizontal: 20, paddingBottom: 10 },
  typingText: { fontSize: 12, color: theme.colors.textLight, fontStyle: 'italic' },
  
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: theme.colors.card, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 20, marginRight: 10, fontSize: 15, maxHeight: 100, color: theme.colors.text },
  sendButton: { backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  sendButtonDisabled: { backgroundColor: theme.colors.primaryLight },
});

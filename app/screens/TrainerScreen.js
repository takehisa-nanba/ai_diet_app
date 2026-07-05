import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/chat' : 'http://localhost:8000/chat';

export default function TrainerScreen() {
  const { profile, chatSessions, saveSession, deleteSession } = useContext(AppContext);
  const [activeSessionId, setActiveSessionId] = useState(null);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeSession = chatSessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const handleStartNewChat = async () => {
    const newSession = {
      id: Date.now().toString(),
      title: '新しい相談',
      updatedAt: new Date().toISOString(),
      messages: [{ 
        id: '1', 
        text: 'こんにちは！AIダイエットコーチです。今日はどんなご相談ですか？', 
        sender: 'ai',
        date: new Date().toISOString()
      }]
    };
    await saveSession(newSession);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("この相談履歴を削除しますか？")) {
        deleteSession(id);
      }
    } else {
      Alert.alert('確認', 'この相談履歴を削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: () => deleteSession(id) }
      ]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeSession) return;

    const userText = inputText;
    const newUserMessage = { id: Date.now().toString(), text: userText, sender: 'user', date: new Date().toISOString() };
    
    let newTitle = activeSession.title;
    if (activeSession.messages.length <= 1) {
       newTitle = userText.length > 15 ? userText.substring(0, 15) + '...' : userText;
    }

    const updatedSession = {
      ...activeSession,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      messages: [...activeSession.messages, newUserMessage]
    };
    await saveSession(updatedSession);
    
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
      
      const finalSession = {
        ...updatedSession,
        updatedAt: new Date().toISOString(),
        messages: [...updatedSession.messages, newAiMessage]
      };
      await saveSession(finalSession);
      
    } catch (error) {
      console.error(error);
      const errorMessage = { id: (Date.now() + 1).toString(), text: '通信エラー: AIサーバーに接続できませんでした。', sender: 'ai', date: new Date().toISOString() };
      const finalSession = {
        ...updatedSession,
        updatedAt: new Date().toISOString(),
        messages: [...updatedSession.messages, errorMessage]
      };
      await saveSession(finalSession);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageItem = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.sender === 'ai' && <Ionicons name="logo-android" size={16} color={theme.colors.primary} style={{ marginBottom: 4 }} />}
      <Text style={[styles.messageText, item.sender === 'ai' && styles.aiMessageText]}>{item.text}</Text>
    </View>
  );

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity style={styles.sessionItem} onPress={() => setActiveSessionId(item.id)}>
      <View style={styles.sessionItemContent}>
        <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.primary} />
        <View style={styles.sessionItemTextContainer}>
          <Text style={styles.sessionItemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.sessionItemDate}>{new Date(item.updatedAt).toLocaleString()}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteSession(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (!activeSessionId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI相談ルーム</Text>
          <TouchableOpacity style={styles.newChatButton} onPress={handleStartNewChat}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.newChatButtonText}>新しい相談</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={chatSessions}
          keyExtractor={item => item.id}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.sessionList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={48} color={theme.colors.textLight} />
              <Text style={styles.emptyText}>過去の相談はありません。</Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveSessionId(null)}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          <Text style={styles.backButtonText}>一覧へ</Text>
        </TouchableOpacity>
        <Text style={styles.chatHeaderTitle} numberOfLines={1}>{activeSession.title}</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatList}
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
          placeholder="メッセージを入力..."
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  newChatButton: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  newChatButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
  
  sessionList: { padding: 16 },
  sessionItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  sessionItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sessionItemTextContainer: { marginLeft: 12, flex: 1 },
  sessionItemTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  sessionItemDate: { fontSize: 12, color: theme.colors.textLight, marginTop: 4 },
  deleteButton: { padding: 8 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: theme.colors.textLight, marginTop: 16 },

  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { flexDirection: 'row', alignItems: 'center', width: 80 },
  backButtonText: { color: theme.colors.primary, fontSize: 16 },
  chatHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, flex: 1, textAlign: 'center' },
  
  chatList: { paddingHorizontal: 16, paddingVertical: 16 },
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

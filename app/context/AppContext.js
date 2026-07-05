import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    targetDate: '',
    activityLevel: '座り仕事メイン',
    reminderEnabled: false,
    reminderTime: '20:00', // デフォルト20:00
  });
  const [weightRecords, setWeightRecords] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          const p = JSON.parse(storedProfile);
          // 既存データに新しいフィールドがない場合のフォールバック
          if (!p.reminderTime) p.reminderTime = '20:00';
          if (!p.activityLevel || p.activityLevel === '普通') p.activityLevel = '座り仕事メイン';
          setProfile(p);
        }

        const storedRecords = await AsyncStorage.getItem('weightRecords');
        
        // ご指定のデータを初期データとしてセット
        const initialMockData = [
          { id: '1', date: '2026-07-05T10:25:00.000Z', weight: 102.4 },
          { id: '2', date: '2026-07-04T20:12:00.000Z', weight: 104.8 },
          { id: '3', date: '2026-07-04T08:55:00.000Z', weight: 102.6 },
          { id: '4', date: '2026-07-03T19:36:00.000Z', weight: 104.6 },
          { id: '5', date: '2026-07-03T06:30:00.000Z', weight: 104.5 },
          { id: '6', date: '2026-07-02T07:00:00.000Z', weight: 104.0 },
          { id: '7', date: '2026-07-01T07:00:00.000Z', weight: 105.4 },
        ];

        let parsedRecords = storedRecords ? JSON.parse(storedRecords) : [];
        // まだデータがない場合、またはデモ用に強制的にデータを上書き
        if (parsedRecords.length < 7) {
          parsedRecords = initialMockData;
          await AsyncStorage.setItem('weightRecords', JSON.stringify(parsedRecords));
        }
        setWeightRecords(parsedRecords);
        
        const storedSessions = await AsyncStorage.getItem('chatSessions');
        if (storedSessions) {
          setChatSessions(JSON.parse(storedSessions));
        } else {
          const oldMessages = await AsyncStorage.getItem('chatHistory');
          if (oldMessages) {
             const parsed = JSON.parse(oldMessages);
             const newSession = {
                id: Date.now().toString(),
                title: '以前の相談',
                updatedAt: new Date().toISOString(),
                messages: parsed
             };
             setChatSessions([newSession]);
             await AsyncStorage.setItem('chatSessions', JSON.stringify([newSession]));
          } else {
             setChatSessions([]);
          }
        }
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveProfile = async (newProfile) => {
    setProfile(newProfile);
    await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
    
    // リマインダーのスケジュール設定
    if (newProfile.reminderEnabled && newProfile.reminderTime) {
      const [hour, minute] = newProfile.reminderTime.split(':').map(Number);
      if (!isNaN(hour) && !isNaN(minute)) {
        const { registerForPushNotificationsAsync, scheduleDailyReminder } = require('../utils/notifications');
        const hasPermission = await registerForPushNotificationsAsync();
        if (hasPermission) {
          await scheduleDailyReminder(hour, minute);
        }
      }
    } else {
      const { cancelAllReminders } = require('../utils/notifications');
      await cancelAllReminders();
    }
  };

  const addWeightRecord = async (weight, customDate, memo) => {
    const newRecord = {
      id: Date.now().toString(),
      weight: parseFloat(weight),
      date: customDate || new Date().toISOString(),
      memo: memo || ''
    };
    const newRecords = [newRecord, ...weightRecords];
    setWeightRecords(newRecords);
    await AsyncStorage.setItem('weightRecords', JSON.stringify(newRecords));
    
    // プロフィールの体重も更新する
    saveProfile({ ...profile, weight: weight.toString() });
  };
  
  const deleteWeightRecord = async (id) => {
    const newRecords = weightRecords.filter(r => r.id !== id);
    setWeightRecords(newRecords);
    await AsyncStorage.setItem('weightRecords', JSON.stringify(newRecords));
  };

  const saveSession = async (session) => {
    let newSessions;
    const exists = chatSessions.find(s => s.id === session.id);
    if (exists) {
       newSessions = chatSessions.map(s => s.id === session.id ? session : s);
    } else {
       newSessions = [session, ...chatSessions];
    }
    newSessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setChatSessions(newSessions);
    await AsyncStorage.setItem('chatSessions', JSON.stringify(newSessions));
  };
  
  const deleteSession = async (id) => {
    const newSessions = chatSessions.filter(s => s.id !== id);
    setChatSessions(newSessions);
    await AsyncStorage.setItem('chatSessions', JSON.stringify(newSessions));
  };

  return (
    <AppContext.Provider value={{
      profile, saveProfile,
      weightRecords, addWeightRecord, deleteWeightRecord,
      chatSessions, saveSession, deleteSession,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

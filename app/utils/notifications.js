import { Platform } from 'react-native';
import * as Device from 'expo-device';

let Notifications;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    console.log('プッシュ通知はWebではサポートされていません');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00ff7f',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('通知の許可が得られませんでした');
      return false;
    }
    return true;
  } else {
    console.log('プッシュ通知は実機でのみ利用可能です（Webや一部エミュレータでは動作しません）');
    return false;
  }
}

export async function scheduleDailyReminder(hour, minute) {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💪 FitTracker",
      body: "今日の体重はもう記録しましたか？毎日の積み重ねが大切です！",
      sound: true,
    },
    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
    },
  });
}

export async function cancelAllReminders() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

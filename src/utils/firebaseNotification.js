import { Alert, PermissionsAndroid, Platform } from "react-native";
import PushNotification, { Importance } from "react-native-push-notification";
let messaging = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (error) {
  console.log('Firebase messaging not available:', error.message);
}

export async function requestUserPermission() {
  try {
    if (Platform.OS === "ios" && messaging) {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log("✅ iOS permission granted:", authStatus);
        await messaging().registerDeviceForRemoteMessages();
        await getFcmToken();
      } else {
        console.warn("❌ iOS notification permission not granted");
      }
    } else if (Platform.OS === "android" && messaging) {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn("❌ Android notification permission denied");
          Alert.alert(
            "Permission Required",
            "Please enable notifications in settings to receive updates."
          );
          return;
        }
      }
      await messaging().registerDeviceForRemoteMessages();
      console.log("✅ Android registered for remote messages");
      await getFcmToken();
    }
  } catch (error) {
    console.error("Error requesting permission:", error);
  }
}

export const getFcmToken = async () => {
  try {
    if (!messaging) {
      console.log("❌ Firebase messaging not available");
      return null;
    }
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log("✅ FCM Token:", fcmToken);
      return fcmToken;
    } else {
      console.log("❌ Failed to get FCM Token");
      return null;
    }
  } catch (error) {
    console.log("Error in FCM Token:", error);
    return null;
  }
};

export const initAndroidNotifications = () => {
  if (Platform.OS !== 'android') return;
  
  PushNotification.configure({
    onNotification: function (notification) {
      console.log("Notification received:", notification);
    },
    popInitialNotification: true,
    requestPermissions: false, 
  });

  PushNotification.createChannel(
    {
      channelId: "default-channel",
      channelName: "General",
      channelDescription: "Default app notifications",
      importance: Importance.HIGH,
      vibrate: true,
      playSound: true,
      soundName: "default",
    },
    (created) => console.log("Notification channel created?", created)
  );
};

export const showLocal = (msg) => {
  const title = msg.data?.title ?? msg.notification?.title ?? "New message";
  const body =
    msg.data?.body ?? msg.notification?.body ?? "You have a new notification";

  PushNotification.localNotification({
    channelId: Platform.OS === 'android' ? "default-channel" : undefined,
    title,
    message: body, 
    bigText: body,
    largeIconUrl: msg.data?.imageUrl || msg.notification?.android?.imageUrl,
    smallIcon: "ic_notification",
    playSound: true,
    soundName: "default",
    priority: "high",
    importance: Importance.HIGH,
    vibrate: true,
    userInfo: msg.data,
  });
};

// Handle foreground messages
export const setupForegroundHandler = () => {
  if (!messaging) {
    console.log('Firebase messaging not available, returning empty unsubscribe');
    return () => {}; // Return empty function
  }
  
  return messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification received:', remoteMessage);
    showLocal(remoteMessage);
  });
};

// Handle notification when app is in background/quit state
export const setupBackgroundHandler = () => {
  if (!messaging) return;
  
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background notification received:', remoteMessage);
  });
};

// Check if app was opened by notification
export const checkInitialNotification = async () => {
  if (!messaging) return null;
  
  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    console.log('App opened by notification:', initialNotification);
    return initialNotification;
  }
  return null;
};

// Set default notification channel for Android
export const setDefaultNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;
  
  try {
    PushNotification.createChannel(
      {
        channelId: "default-channel",
        channelName: "General",
        channelDescription: "Default app notifications",
        importance: Importance.HIGH,
        vibrate: true,
        playSound: true,
        soundName: "default",
      },
      (created) => console.log("Notification channel created?", created)
    );
  } catch (error) {
    console.error("Error setting notification channel:", error);
  }
};
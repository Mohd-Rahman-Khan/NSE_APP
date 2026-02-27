import messaging from "@react-native-firebase/messaging";

export async function requestUserPermissionIOS() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Authorization status:", authStatus);
    getFcmToken();
  }
}

const getFcmToken = async () => {
  let checkToken = null;
  console.log("Old Token", checkToken);
  if (!checkToken) {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log("Fcm Token Generated", fcmToken);
      }
    } catch (error) {
      console.log("Error in FCM Token", error);
    }
  }
};
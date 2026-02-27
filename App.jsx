import { LogBox, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import JailMonkey from "jail-monkey";
import NoInternet from "./src/screens/auth/NoInternet";
import FlashMessage from "react-native-flash-message";
import RootedDevice from "./src/components/RootedDevice";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { persistor, store } from "./src/redux/Store";
import Route from "./src/navigation/Route";
import {
  initAndroidNotifications,
  requestUserPermission,
  setupForegroundHandler,
  setupBackgroundHandler,
  checkInitialNotification,
} from "./src/utils/firebaseNotification";

const App = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isRooted, setIsRooted] = useState(false);

  LogBox.ignoreLogs(["Warning: ..."]);
  LogBox.ignoreAllLogs();
  LogBox.ignoreLogs(["Remote debugger"]);

  useEffect(() => {
    const checkNetwork = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    checkPhoneRooted();
    if (Platform.OS === "android") {
      setupNotificationHandlers();
    }

    return () => checkNetwork();
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      initAndroidNotifications();
      requestUserPermission();
    }
  }, []);

  const setupNotificationHandlers = async () => {
    // Setup foreground handler
    const unsubscribeForeground = setupForegroundHandler();

    // Setup background handler
    setupBackgroundHandler();

    // Check if app was opened by notification
    await checkInitialNotification();

    return unsubscribeForeground;
  };

  const checkPhoneRooted = () => {
    if (JailMonkey.isJailBroken()) {
      setIsRooted(true);
    }
  };

  if (isRooted) {
    return <RootedDevice />;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {isConnected ? (
            <NavigationContainer>
              <Route />
            </NavigationContainer>
          ) : (
            <NoInternet />
          )}
          <FlashMessage
            position={"top"}
            animated={true}
            titleStyle={{ textTransform: "capitalize" }}
          />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;

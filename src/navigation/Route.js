import { View } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import AuthNavigation from "./AuthNavigation";
import AppNavigation from "./AppNavigation";

const Route = () => {
  const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);
  return (
    <View style={{ flex: 1 }}>
      {isUserLoggedIn ? <AppNavigation /> : <AuthNavigation />}
    </View>
  );
};

export default Route;

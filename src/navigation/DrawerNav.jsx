import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import BottomNav from "./BottomNav";

const Drawer = createDrawerNavigator();

const DrawerNav = () => {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="DashBoard" component={BottomNav} />
    </Drawer.Navigator>
  );
};

export default DrawerNav;


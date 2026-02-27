import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/app/Home";
import Profile from "../screens/app/Profile";
import Colors from "../utils/Colors";
import { moderateScale, textScale } from "../utils/responsiveSize";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontFamily from "../utils/FontFamily";
import Feather from "react-native-vector-icons/Feather";

const Tab = createBottomTabNavigator();

const BottomNav = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarActiveTintColor: Colors.greenColor,
        tabBarInactiveTintColor: Colors.gray,
        tabBarShowLabel: true,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text style={[styles.labelText, { color }]}>Home</Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="home"
                size={moderateScale(25)}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text style={[styles.labelText, { color }]}>Profile</Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Feather name="user" size={moderateScale(25)} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    left: moderateScale(20),
    right: moderateScale(20),
    bottom: moderateScale(25),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: Colors.white,
    elevation: 5,
    shadowColor: Colors.gray,
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(5),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    borderTopWidth: 0,
    paddingHorizontal: moderateScale(10),
    marginHorizontal: moderateScale(15),
  },
  tabBarItem: {
    height: moderateScale(70),
    paddingVertical: moderateScale(5),
  },
  labelText: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsSemiBold,
    marginTop: moderateScale(5),
    textAlign: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { TouchableOpacity, StyleSheet, Text, Animated } from "react-native";

const ChatButton = () => {
  const navigation = useNavigation();

  // 👇 Start from top (hidden)
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // 🔥 Drop animation with bounce
    Animated.spring(translateY, {
      toValue: 0,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Chat")}
      >
        <Text style={styles.text}>💬</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 70,
    right: 20,
  },
  button: {
    backgroundColor: "#2e7d32",
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  text: {
    color: "#fff",
    fontSize: 26,
  },
});

export default ChatButton;

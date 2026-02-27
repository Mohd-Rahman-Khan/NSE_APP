import {
  Image,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Animated,
  Platform,
  Easing,
  Alert,
} from "react-native";
import React, { useEffect, useRef } from "react";
import ImagePath from "../utils/ImagePath";
import en from "../constants/en";
import CustomButton from "./CustomButton";
import Colors from "../utils/Colors";
import FontFamily from "../utils/FontFamily";
import { moderateScale, textScale } from "../utils/responsiveSize";

const RootedDevice = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start(() => {
      // Start pulse animation after entrance
      pulseAnimation();
    });
  }, []);

  const exitApp = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    } else {
      Alert.alert("Cannot Exit App", "Please manually close the application.", [
        { text: "OK" },
      ]);
    }
  };

  const pulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };

  return (
    <View style={styles.main}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            shadowColor: Colors.red,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <Image source={ImagePath.rootedImage} style={styles.image} />
        </Animated.View>

        <Text style={styles.title}>{en.ROOTED_DEVICE.TITLE}</Text>
        <Text style={styles.subtitle}>{en.ROOTED_DEVICE.SUBTITLE}</Text>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
            width: "100%",
            alignItems: "center",
          }}
        >
          <CustomButton
            text={en.ROOTED_DEVICE.EXIT_BUTTON}
            handleAction={exitApp}
            buttonStyle={styles.buttonStyle}
            textStyle={styles.buttonText}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default RootedDevice;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: moderateScale(24),
  },
  container: {
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: moderateScale(150),
    height: moderateScale(150),
    marginBottom: moderateScale(30),
    resizeMode: "contain",
  },
  title: {
    fontSize: textScale(24),
    color: Colors.red,
    marginBottom: moderateScale(12),
    fontFamily: FontFamily.ManropeBold,
    textAlign: "center",
    lineHeight: moderateScale(32),
    textShadowColor: "rgba(255, 59, 48, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: textScale(16),
    color: Colors.gray,
    textAlign: "center",
    marginBottom: moderateScale(40),
    fontFamily: FontFamily.ManropeRegular,
    lineHeight: moderateScale(24),
    paddingHorizontal: moderateScale(20),
  },
  buttonStyle: {
    backgroundColor: Colors.red,
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(12),
    width: "90%",
    shadowColor: Colors.red,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  buttonText: {
    fontFamily: FontFamily.ManropeSemiBold,
    color: Colors.white,
    fontSize: textScale(16),
    letterSpacing: 0.5,
  },
});

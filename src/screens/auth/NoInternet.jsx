import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Linking,
  Easing,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Colors from "../../utils/Colors";
import LottieView from "lottie-react-native";
import ImagePath from "../../utils/ImagePath";
import { moderateScale, scale, textScale } from "../../utils/responsiveSize";
import CustomButton from "../../components/CustomButton";
import FontFamily from "../../utils/FontFamily";
import en from "../../constants/en";

const { width } = Dimensions.get("window");

const NoInternet = () => {
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Linking.openSettings();
    }, 1000);
  };

  return (
    <View style={styles.main}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <LottieView
          source={ImagePath.noInternet}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim2, marginTop: -moderateScale(30) },
        ]}
      >
        <Text style={styles.title}>{en.NO_INTERNET.TITLE}</Text>
        <Text style={styles.subtitle}>{en.NO_INTERNET.SUBTITLE}</Text>
      </Animated.View>
      <Animated.View
        style={{ opacity: fadeAnim3, width: "100%", alignItems: "center" }}
      >
        <CustomButton
          text={
            loading
              ? en.NO_INTERNET.RETRYING_BUTTON
              : en.NO_INTERNET.RETRY_BUTTON
          }
          handleAction={handleRetry}
          buttonStyle={styles.buttonStyle}
          disabled={loading}
          loading={loading}
          textStyle={styles.buttonText}
        />
      </Animated.View>
    </View>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: width * 0.9,
    backgroundColor: Colors.white + "10",
    borderRadius: moderateScale(24),
    alignItems: "center",
    padding: moderateScale(24),
    marginBottom: moderateScale(16),
  },
  lottie: {
    width: moderateScale(160),
    height: moderateScale(160),
    marginBottom: moderateScale(10),
  },
  title: {
    fontSize: textScale(18),
    color: Colors.primary,
    marginBottom: moderateScale(10),
    fontFamily: FontFamily.ManropeMedium,
    textAlign: "center",
  },
  subtitle: {
    fontSize: textScale(13),
    color: Colors.black,
    textAlign: "center",
    maxWidth: moderateScale(300),
    fontFamily: FontFamily.ManropeLight,
    textTransform: "capitalize",
  },
  buttonStyle: {
    backgroundColor: Colors.greenColor,
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(15),
    borderRadius: moderateScale(10),
    width: "90%",
  },
  buttonText: {
    fontFamily: FontFamily.ManropeMedium,
    color: Colors.white,
    fontSize: textScale(14),
    letterSpacing: scale(0.3),
  },
});

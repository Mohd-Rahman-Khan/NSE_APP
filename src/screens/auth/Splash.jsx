import { Image, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import ImagePath from "../../utils/ImagePath";
import { useNavigation } from "@react-navigation/native";

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <View style={styles.main}>
      <Image
        source={ImagePath.splashImage}
        resizeMode="stretch"
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

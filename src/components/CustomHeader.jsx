import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { moderateScale, scale, textScale } from "../utils/responsiveSize";
import Colors from "../utils/Colors";
import Feather from "react-native-vector-icons/Feather";
import FontFamily from "../utils/FontFamily";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import ImagePath from "../utils/ImagePath";

const CustomHeader = ({ data }) => {
  const navigation = useNavigation();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFormattedDate = () => {
    const date = new Date();
    const options = {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <View>
          <Text style={styles.textStyle}>
            Hello
            <Text style={{ fontFamily: FontFamily.PoppinsMedium }}>
              , {getGreeting()}
            </Text>
          </Text>
          <Text
            style={[styles.textStyle, { fontFamily: FontFamily.PoppinsLight }]}
          >
            {getFormattedDate()}
          </Text>
        </View>
        <View style={styles.leftHolder}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.notificationHolder}
            onPress={() => navigation.navigate("Notification")}
          >
            <Feather
              name="bell"
              size={moderateScale(25)}
              color={Colors.black}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("UserProfile")}
          >
            <Image
              source={data?.userProfileImage || ImagePath.userProfile}
              resizeMode="cover"
              style={styles.userProfileHolder}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

CustomHeader.propTypes = {
  data: PropTypes.shape({
    userProfileImage: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.string,
    ]),
  }),
};

export default CustomHeader;

const styles = StyleSheet.create({
  main: {
    padding: moderateScale(10),
    paddingHorizontal: moderateScale(15),
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftHolder: {
    gap: moderateScale(10),
    flexDirection: "row",
  },
  notificationHolder: {
    borderWidth: 2,
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: Colors.bg3,
    borderColor: Colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  userProfileHolder: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: Colors.bg3,
  },
  textStyle: {
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(13),
    color: Colors.black,
    letterSpacing: scale(0.2),
  },
});

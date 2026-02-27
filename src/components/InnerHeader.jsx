import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../utils/responsiveSize";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../utils/Colors";
import FontFamily from "../utils/FontFamily";
import PropTypes from "prop-types";

const InnerHeader = ({
  title,
  rightIcon = null,
  backHandler = false,
  goBack,
}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={() => {
          if (backHandler) {
            goBack();
          } else {
            navigation.goBack();
          }
        }}
      >
        <Ionicons
          name="chevron-back"
          size={moderateScale(22)}
          color={Colors.white}
        />
      </TouchableOpacity>
      <View style={styles.titleHolder}>
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.titleAccent} />
      </View>
      {/* Spacer for symmetry */}
      <View style={{ width: moderateScale(38), alignItems: "flex-end" }}>
        {rightIcon}
      </View>
    </View>
  );
};

InnerHeader.propTypes = {
  title: PropTypes.string.isRequired,
  rightIcon: PropTypes.element,
};

export default InnerHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    justifyContent: "space-between",
  },
  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  titleHolder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    fontSize: textScale(14),
    textAlign: "center",
    letterSpacing: 0.5,
  },
  titleAccent: {
    width: moderateScale(28),
    height: 3,
    backgroundColor: Colors.greenColor,
    borderRadius: 2,
    marginTop: 2,
    alignSelf: "center",
  },
});

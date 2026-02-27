import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";
import { moderateScale, scale, textScale } from "../utils/responsiveSize";
import Colors from "../utils/Colors";
import Feather from "react-native-vector-icons/Feather";
import FontFamily from "../utils/FontFamily";
import AntDesign from "react-native-vector-icons/AntDesign";
import PropTypes from "prop-types";

const CustomSearchBox = ({ value, onChangeText, resetSearchText }) => {
  return (
    <View style={styles.container}>
      <Feather name="search" color={Colors.gray} size={moderateScale(25)} />
      <TextInput
        placeholder="Search.."
        placeholderTextColor={Colors.veryLightGrey}
        value={value}
        onChangeText={onChangeText}
        keyboardType="default"
        multiline={false}
        style={styles.inputBox}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={resetSearchText}>
          <AntDesign
            name={"close"}
            size={moderateScale(20)}
            color={Colors.gray}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

CustomSearchBox.propTypes = {
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  resetSearchText: PropTypes.func.isRequired,
};

export default CustomSearchBox;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(20),
    borderColor: Colors.diabledColor,
    paddingHorizontal: moderateScale(10),
    marginHorizontal: moderateScale(15),
  },
  inputBox: {
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.black,
    padding: moderateScale(10),
    fontSize: textScale(12),
    letterSpacing: scale(0.3),
    width: "80%",
  },
});

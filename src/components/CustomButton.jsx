import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { BallIndicator } from "react-native-indicators";
import PropTypes from "prop-types";
import Colors from "../utils/Colors";
import { moderateScale, textScale } from "../utils/responsiveSize";

const CustomButton = ({
  text,
  handleAction,
  buttonStyle,
  textStyle,
  isloading = false,
  disabled = false,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.main,
        buttonStyle,
        disabled && { backgroundColor: Colors.lightGray },
      ]}
      onPress={handleAction}
      activeOpacity={0.8}
      disabled={disabled}
      {...props}
    >
      {isloading ? (
        <BallIndicator color={Colors.white} size={moderateScale(28)} />
      ) : (
        <Text style={[styles.text, { ...textStyle }]}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

CustomButton.propTypes = {
  text: PropTypes.string.isRequired,
  handleAction: PropTypes.func.isRequired,
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
  isloading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CustomButton;

const styles = StyleSheet.create({
  main: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
  },
  text: {
    color: Colors.white,
    fontSize: textScale(14),
  },
});

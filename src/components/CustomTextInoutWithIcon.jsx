import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Colors from "../utils/Colors";
import { moderateScale, scale, textScale } from "../utils/responsiveSize";
import FontFamily from "../utils/FontFamily";
import AntDesign from "react-native-vector-icons/AntDesign";
import PropTypes from "prop-types";

const CustomTextInoutWithIcon = ({
  label,
  leftIcon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  rightIcon,
  resetvalue,
  props,
  secureTextEntry = false,
  isPasswordField = false,
}) => {
  return (
    <View style={styles.formHolder}>
      <Text style={styles.labelText}>{label}</Text>
      <View style={styles.inputBoxView}>
        <Image
          source={leftIcon}
          resizeMode="contain"
          tintColor={Colors.black}
          style={styles.icon}
        />

        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={false}
          style={styles.inputBox}
          secureTextEntry={secureTextEntry}
          {...props}
        />
        {value?.length > 0 && (
          <TouchableOpacity onPress={resetvalue}>
            <AntDesign
              name={rightIcon}
              size={moderateScale(25)}
              color={isPasswordField ? Colors.greenColor : Colors.black}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomTextInoutWithIcon;

CustomTextInoutWithIcon.propTypes = {
  label: PropTypes.string.isRequired, 
  leftIcon: PropTypes.any,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  keyboardType: PropTypes.string,
  rightIcon: PropTypes.string,
  resetvalue: PropTypes.func,
  props: PropTypes.object,
  secureTextEntry: PropTypes.bool,
  isPasswordField: PropTypes.bool,
};


const styles = StyleSheet.create({
  formHolder: {
    width: "95%",
    alignSelf: "center",
  },
  inputBoxView: {
    borderBottomWidth: moderateScale(2),
    borderColor: Colors.greenColor,
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    paddingHorizontal: moderateScale(5),
    padding: moderateScale(5),
  },
  icon: {
    width: moderateScale(25),
    height: moderateScale(25),
  },
  inputBox: {
    padding: moderateScale(10),
    width: "75%",
    color: Colors.black,
    fontFamily: FontFamily.RubikRegular,
    fontSize: textScale(12),
    letterSpacing: scale(0.3),
  },
  labelText: {
    fontFamily: FontFamily.RubikRegular,
    color: Colors.labelcolor,
    fontSize: textScale(12),
    textAlign: "left",
    textTransform: "capitalize",
    letterSpacing: scale(0.3),
  },
});

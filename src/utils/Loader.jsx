import { Modal, StyleSheet, View } from "react-native";
import React from "react";
import { BallIndicator } from "react-native-indicators";
import Colors from "./Colors";
import PropTypes from "prop-types";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "./responsiveSize";
import FontFamily from "./FontFamily";

const LoadingComponent = () => {
  return (
    <View style={styles.loaderContainer}>
      <BallIndicator color={Colors.greenColor} size={moderateScale(35)} />
      {/* <Text style={styles.text}>Loading...</Text> */}
    </View>
  );
};

const Loader = ({ isLoading }) => {
  if (isLoading) {
    return (
      <Modal visible={isLoading} transparent={true} statusBarTranslucent={true}>
        <LoadingComponent />
      </Modal>
    );
  }
  return null;
};

Loader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default Loader;

const styles = StyleSheet.create({
  loaderContainer: {
    borderWidth: moderateScale(2),
    borderColor: Colors.lightBackground,
    position: "absolute",
    top: "45%",
    gap: moderateScale(12),
    // width: '50%',
    alignSelf: "center",
    padding: moderateScale(10),
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(8),
    elevation: moderateScale(5),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
  },
  text: {
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    fontSize: textScale(15),
    textTransform: "capitalize",
    letterSpacing: scale(0.2),
    textAlign: "center",
    marginTop: moderateScaleVertical(2),
  },
});

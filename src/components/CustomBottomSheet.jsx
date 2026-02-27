import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import PropTypes from "prop-types";
import { moderateScale, moderateScaleVertical } from "../utils/responsiveSize";

const CustomBottomSheet = ({ visible, onRequestClose, children, height }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onRequestClose}
      animationType="slide"
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onRequestClose}
        />
        <View
          style={[styles.modalContainer, { height: height ? height : null }]}
        >
          {/* <View style={styles.dragHandle} /> */}
          {children}
        </View>
      </View>
    </Modal>
  );
};

CustomBottomSheet.propTypes = {
  visible: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

CustomBottomSheet.defaultProps = {
  children: null,
  height: null,
};

export default CustomBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    borderTopLeftRadius: moderateScale(20),
    gap: moderateScaleVertical(10),
    maxHeight: "80%", // You can adjust this
    height: moderateScaleVertical(600),
  },
  dragHandle: {
    width: moderateScale(40),
    height: moderateScale(5),
    backgroundColor: "#ccc",
    borderRadius: moderateScale(3),
    alignSelf: "center",
    marginBottom: moderateScale(10),
  },
});

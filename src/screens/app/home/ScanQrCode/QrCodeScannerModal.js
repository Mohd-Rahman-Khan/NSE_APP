import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
} from "react-native";

import { Camera, CameraType } from "react-native-camera-kit";

export default function QrCodeScannerModal(props) {
  const [flashlight, setFlashlight] = useState(false);
  const [scanned, setScanned] = useState(false);

  const onScan = (event) => {
    try {
      if (scanned) return;

      const value = event?.nativeEvent?.codeStringValue;
      if (!value) return;

      setScanned(true);

      setTimeout(() => {
        // alert(JSON.stringify(value));
        props.qrScanningData(value);
        props.onClose();
        setScanned(false);
      }, 300);
    } catch (e) {
      alert(JSON.stringify(e));
      console.log("Scan error", e);
      setScanned(false);
    }
  };

  return (
    <Modal visible={props.showModal} animationType="slide" transparent={true}>
      <View style={styles.modalBg}>
        {/* FULL SCREEN CAMERA */}
        <Camera
          style={styles.cameraView}
          scanBarcode={true}
          onReadCode={onScan}
          showFrame={true}
          laserColor="red"
          frameColor="white"
          cameraType={CameraType.Back}
        />

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Scan QR Code</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={props.onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: "black",
  },

  cameraView: {
    flex: 1,
    width: "100%",
  },

  header: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 99,
  },

  headerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

  closeBtn: {
    height: 35,
    width: 35,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  closeIcon: {
    width: 15,
    height: 15,
    tintColor: "white",
  },

  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },

  closeButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },

  closeButtonText: {
    color: "#DA0B0B",
    fontSize: 18,
    fontWeight: "bold",
  },
});

import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import QrCodeScannerModal from "./QrCodeScannerModal";
import Colors from "../../../../utils/Colors";

export default function ScanQrCode() {
  const [loading, setLoading] = useState(false);
  const [showScanner, setshowScanner] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS == "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "NSC App Camera Permission",
          message:
            "NSC App needs access to your camera " +
            "so you can scan coupons and take pictures",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      );

      if (granted == "granted") {
        setshowScanner(true);
      } else {
        Alert.alert(
          "Scaner Alert",
          "Please allow the camera permission for scaning.",
          [
            {
              text: "OK",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
      }
    }
  };
  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={"Scan Qr Code"} />
      {showScanner ? (
        <QrCodeScannerModal
          showModal={showScanner}
          onClose={() => {
            setshowScanner(false);
          }}
          qrScanningData={(qrData) => {
            //qrScanerHandler(qrData);
            alert(qrData);
          }}
        />
      ) : null}
      <TouchableOpacity
        onPress={() => {
          setshowScanner(true);
        }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: Colors.greenColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Open Scanner</Text>
      </TouchableOpacity>
    </WrapperContainer>
  );
}

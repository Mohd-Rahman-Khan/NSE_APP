import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import QrCodeScannerModal from "./QrCodeScannerModal";
import Colors from "../../../../utils/Colors";
const dummyData = {
  billNumber: "DLB2026030022",
  dealerIndent: "DIN//2026/03/02907",
  billDate: "20-03-2026",

  party: {
    name: "GreenSprout Agro Pvt. Ltd.",
    address: "noida, LUCKNOW, UTTAR PRADESH, 447885",
    gstin: "19AAACH5509R1ZY",
    state: "UTTAR PRADESH",
  },

  bank: {
    bankName: "STATE BANK OF INDIA",
    accountNo: "7894561230",
    ifsc: "SBIN0078901",
    branch: "dariyaganj, hussainganj",
  },
};
const styles = {
  section: {
    marginTop: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 6,
  },
};

export default function ScanQrCode() {
  const [loading, setLoading] = useState(false);
  const [showScanner, setshowScanner] = useState(false);
  const [qrDetails, setQrDetails] = useState([]);

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

  const parseQrString = (qrString) => {
    const obj = {};

    const lines = qrString?.split("\n");

    lines.forEach((line) => {
      const trimmed = line?.trim();
      if (!trimmed) return;

      const [key, ...rest] = trimmed?.split(":");

      if (key && rest?.length) {
        obj[key.trim()] = rest?.join(":").trim();
      }
    });

    return obj;
  };

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          marginTop: 20,
          backgroundColor: "#fff",
          borderRadius: 12,
          elevation: 4,
          overflow: "hidden",
        }}
      >
        {Object?.entries(item)?.map(([key, value], index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderBottomWidth:
                index !== Object.entries(item).length - 1 ? 1 : 0,
              borderColor: "#eee",
            }}
          >
            {/* LEFT COLUMN (KEY) */}
            <Text
              style={{
                width: "45%",
                fontWeight: "600",
                color: "#333",
              }}
            >
              {key}
            </Text>

            {/* RIGHT COLUMN (VALUE) */}
            <Text
              style={{
                width: "55%",
                color: "#555",
              }}
            >
              {value}
            </Text>
          </View>
        ))}
      </View>
    );
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
          // qrScanningData={(qrData) => {
          //   setQrDetails((prev) => [...prev, dummyData]);
          //   //alert(qrData);
          // }}
          qrScanningData={(qrData) => {
            console.log("qrScanningData", qrData);
            const parsedData = parseQrString(qrData);
            //setQrDetails([parsedData]);
            setQrDetails((prev) => [...prev, parsedData]);
          }}
        />
      ) : null}
      <FlatList
        data={qrDetails}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        style={{ marginBottom: 50 }}
      />
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

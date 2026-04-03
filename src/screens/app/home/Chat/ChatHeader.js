import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "../../../../utils/Colors";
import { useNavigation } from "@react-navigation/native";

export default function ChatHeader({ onExport, onNewChat, selectedCategory }) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Left: Logo + Title */}
      <View style={styles.left}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        {/* <View style={styles.logo}>
          <Text style={{ color: "#fff" }}>🌱</Text>
        </View> */}
        {/* <View>
          <Text style={styles.title}>बीज वाणी</Text>
          <Text style={styles.subtitle}>आपकी AI सहायक</Text>
        </View> */}
      </View>

      {/* Right: Buttons */}
      <View style={styles.right}>
        <TouchableOpacity style={styles.categoryBtn}>
          <Text style={styles.categoryText}>
            📦 {selectedCategory || "Production"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={onExport}>
          <AntDesign name="download" size={15} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={onNewChat}>
          <AntDesign name="plus" size={15} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2e7d32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  subtitle: {
    fontSize: 12,
    color: "#6c757d",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  btn: {
    borderWidth: 1,
    borderColor: "#2e7d32",
    height: 35,
    width: 35,
    borderRadius: 20,
    marginLeft: 5,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "#2e7d32",
  },
  btnText: {
    color: "#2e7d32",
    fontSize: 12,
    fontWeight: "bold",
  },
  categoryBtn: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 5,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
  },
});

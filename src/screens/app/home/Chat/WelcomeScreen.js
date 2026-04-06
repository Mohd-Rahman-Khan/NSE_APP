import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function WelcomeScreen({ onSelect }) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={{ color: "#fff", fontSize: 24 }}>🌱</Text>
      </View>

      <Text style={styles.title}>नमस्ते! मैं बीज वाणी हूँ 🌱</Text>

      <Text style={styles.subtitle}>
        NSC की AI सहायक। कृपया नीचे दिए गए विकल्पों में से एक विषय चुनें, फिर
        अपना सवाल पूछें।
      </Text>

      <View style={styles.row}>
        {["Production", "Finance", "Inventory", "Marketing"].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.button}
            onPress={() => onSelect(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef3e8",
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2e7d32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    color: "#555",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
    elevation: 2,
  },
});

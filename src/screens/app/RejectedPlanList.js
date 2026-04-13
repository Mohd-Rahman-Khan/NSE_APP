import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function RejectedPlanList({ data }) {
  return (
    <View style={{ margin: 10 }}>
      <Text style={styles.heading}>Rejected Plans</Text>

      {data?.length > 0 ? (
        data?.map((item) => (
          <View key={item.id} style={styles.planCard}>
            {/* 🔹 Title */}
            <Text style={styles.planTitle}>{item.name}</Text>

            {/* 🔹 Row 1 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>Programme</Text>
              <Text style={styles.value}>{item.programme}</Text>
            </View>

            {/* 🔹 Row 2 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>Area (Ha)</Text>
              <Text style={styles.value}>{item.area}</Text>
            </View>

            {/* 🔹 Row 3 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>Raw Seed</Text>
              <Text style={styles.value}>{item.rawSeed}</Text>
            </View>

            {/* 🔹 Row 4 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>Good Seed</Text>
              <Text style={styles.value}>{item.goodSeed}</Text>
            </View>

            {/* 🔹 Row 5 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>PM Required</Text>
              <Text style={styles.value}>{item.pm}</Text>
            </View>

            {/* 🔹 Status */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.heading, { textAlign: "center" }]}>
          List is empty.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },

  planTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  planRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  statusContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },

  statusText: {
    color: "#2e7d32",
    fontSize: 12,
    fontWeight: "600",
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

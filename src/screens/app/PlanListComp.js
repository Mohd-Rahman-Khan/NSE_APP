import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import Colors from "../../utils/Colors";

export default function PlanListComp({ data, viewMore = () => {} }) {
  return (
    <View style={{ margin: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.heading}>Plans Detail</Text>
        <TouchableOpacity onPress={viewMore}>
          <Text style={[styles.heading, { color: Colors.blueThemeColor }]}>
            View More
          </Text>
        </TouchableOpacity>
      </View>

      {data?.length > 0 ? (
        data?.map((item) => (
          <View key={item.id} style={styles.planCard}>
            {/* 🔹 Title */}
            <Text style={styles.planTitle}>{item.planId}</Text>

            {/* 🔹 Row 1 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>Programme</Text>
              <Text style={styles.value}>{item.programme}</Text>
            </View>

            {/* 🔹 Row 2 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>Area (Ha)</Text>
              <Text style={styles.value}>{item?.actual?.actualArea}</Text>
            </View>

            {/* 🔹 Row 3 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>Raw Seed</Text>
              <Text style={styles.value}>
                {item?.projected?.projectedRawSeed}
              </Text>
            </View>

            {/* 🔹 Row 4 */}
            <View style={styles.planRow}>
              <Text style={styles.label}>Good Seed</Text>
              <Text style={styles.value}>
                {item?.projected?.projectedGoodSeed}
              </Text>
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
    elevation: 1,
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

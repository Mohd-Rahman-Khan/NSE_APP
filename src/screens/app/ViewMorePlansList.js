import { View, Text, FlatList, StyleSheet } from "react-native";
import React from "react";
import WrapperContainer from "../../utils/WrapperContainer";
import InnerHeader from "../../components/InnerHeader";

export default function ViewMorePlansList({ route }) {
  const renderItem = ({ item }) => {
    return (
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
          <Text style={styles.value}>{item?.projected?.projectedRawSeed}</Text>
        </View>

        {/* 🔹 Row 4 */}
        <View style={styles.planRow}>
          <Text style={styles.label}>Good Seed</Text>
          <Text style={styles.value}>{item?.projected?.projectedGoodSeed}</Text>
        </View>
      </View>
    );
  };
  return (
    <WrapperContainer>
      <InnerHeader title={"Plan List"} />
      <FlatList
        data={route?.params?.planDetailsList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        style={{ marginBottom: 50 }}
      />
    </WrapperContainer>
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
});

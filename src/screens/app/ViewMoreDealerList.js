import { View, Text, FlatList, StyleSheet } from "react-native";
import React from "react";
import WrapperContainer from "../../utils/WrapperContainer";
import InnerHeader from "../../components/InnerHeader";

export default function ViewMoreDealerList({ route }) {
  return (
    <WrapperContainer>
      <InnerHeader title={"Dealer List"} />
      <FlatList
        data={route?.params?.dealerList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              elevation: 1,
              marginHorizontal: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Name: {item.dealerName}</Text>
            <Text>Region: {item.region}</Text>
            <Text>Sales: {item.totalSales}</Text>
            <Text>Qty: {item.totalQty}</Text>
          </View>
        )}
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

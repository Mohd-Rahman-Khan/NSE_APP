import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const SummaryCard = ({ icon, title, value, bg }) => (
  <View style={styles.card}>
    <View style={[styles.iconCircle, { backgroundColor: bg }]}>
      <Icon name={icon} size={26} color="#2196F3" />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>

    <Icon name="info-outline" size={22} color="green" />
  </View>
);

export default function InventoryDashboard({
  godownData,
  availableSeed,
  expireSeeds,
  condemnSeeds,
}) {
  const [expanded, setExpanded] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("GODOWN");

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderSeedRow = (item) => {
    const isExpanded = expanded[item.id];
    return (
      <View key={item.id}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={styles.nameColumn}>
            <Icon
              name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
              size={24}
            />

            <Text style={styles.rowText}>{item.name}</Text>
          </View>

          <View style={styles.countColumn}>
            <Text>{item.unitType}</Text>
          </View>
          <View style={styles.countColumn}>
            <Text>{item.totalAvailableQty}</Text>
          </View>
        </TouchableOpacity>

        {/* RO */}

        {item.unitType === "RO" &&
          isExpanded &&
          item.unitDetails?.map((ao) => (
            <View key={ao.id}>
              <TouchableOpacity
                style={styles.childRow}
                onPress={() => toggleExpand(`ao-${ao.id}`)}
              >
                <View style={styles.nameColumn}>
                  <Text style={styles.treeLine}>└──</Text>

                  {/* <Icon
                    name={
                      expanded[`ao-${ao.id}`]
                        ? "keyboard-arrow-down"
                        : "keyboard-arrow-right"
                    }
                    size={18}
                  /> */}

                  <Text style={styles.childText}>{ao.name}</Text>
                </View>
                <Text style={{ width: "28%" }}>{ao.unitType}</Text>

                <Text style={{ width: "28%" }}>{ao.totalAvailableQty}</Text>
              </TouchableOpacity>

              {/* {expanded[`ao-${ao.id}`] &&
                ao.itemDetails?.map((seed, index) => (
                  <View key={index} style={styles.grandChildRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.seedText}>{seed.cropName}</Text>

                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666",
                        }}
                      >
                        {seed.varietyName} | {seed.cropClass}
                      </Text>
                    </View>

                    <Text style={styles.seedQty}>
                      {seed.availableQty} {seed.uom}
                    </Text>
                  </View>
                ))} */}
            </View>
          ))}

        {/* FARM */}

        {item.unitType === "FARM" &&
          isExpanded &&
          item.itemDetails?.map((seed, index) => (
            <View key={index} style={styles.childRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.childText}>{seed.cropName}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  {seed.varietyName} | {seed.cropClass}
                </Text>
              </View>

              <Text>
                {seed.availableQty} {seed.uom}
              </Text>
            </View>
          ))}
      </View>
    );
  };

  const renderRow = (item) => {
    const isExpanded = expanded[item.id];

    return (
      <View key={item.id}>
        {/* Parent Row */}

        <TouchableOpacity
          style={[styles.row, selectedId === item.id && styles.selectedRow]}
          onPress={() => {
            setSelectedId(item.id);

            if (item.unitType === "RO" || item.unitType === "FARM") {
              toggleExpand(item.id);
            }
          }}
        >
          <View style={styles.nameColumn}>
            {item.unitType === "RO" || item.unitType === "FARM" ? (
              <Icon
                name={
                  isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"
                }
                size={24}
                color="#1B2430"
              />
            ) : (
              <View style={{ width: 24 }} />
            )}

            <Text style={styles.rowText}>{item.name || "Unnamed Farm"}</Text>
          </View>

          <View style={styles.typeColumn}>
            <Text>{item.unitType}</Text>
          </View>

          <View style={styles.countColumn}>
            <Text>{item.godownCount}</Text>
          </View>
        </TouchableOpacity>

        {/* RO → AO */}

        {item.unitType === "RO" &&
          isExpanded &&
          item.unitDetails?.map((ao) => {
            const aoExpanded = expanded[`ao-${ao.id}`];

            return (
              <View key={ao.id}>
                <TouchableOpacity
                  style={styles.childRow}
                  onPress={() => toggleExpand(`ao-${ao.id}`)}
                >
                  <View style={styles.nameColumn}>
                    <Text style={styles.treeLine}>└──</Text>

                    {/* <Icon
                      name={
                        aoExpanded
                          ? "keyboard-arrow-down"
                          : "keyboard-arrow-right"
                      }
                      size={18}
                      color="#666"
                    /> */}

                    <Text style={styles.childText}>{ao.name}</Text>
                  </View>

                  <View style={styles.typeColumn}>
                    <Text>{ao.unitType}</Text>
                  </View>

                  <View style={styles.countColumn}>
                    <Text>{ao.godownCount}</Text>
                  </View>
                </TouchableOpacity>

                {/* AO → GODOWNS */}

                {/* {aoExpanded &&
                  ao.godowns?.map((godown) => (
                    <View key={godown.godownId} style={styles.grandChildRow}>
                      <View style={styles.nameColumn}>
                        <Text style={styles.treeLine}>└──</Text>

                        <Text style={styles.godownText}>
                          {godown.godownName}
                        </Text>
                      </View>

                      <View style={styles.typeColumn}>
                        <Text>GODOWN</Text>
                      </View>

                      <View style={styles.countColumn}>
                        <Text>-</Text>
                      </View>
                    </View>
                  ))} */}
              </View>
            );
          })}

        {/* FARM → GODOWNS */}

        {item.unitType === "FARM" &&
          isExpanded &&
          item.godowns?.map((godown) => (
            <View key={godown.godownId} style={styles.childRow}>
              <View style={styles.nameColumn}>
                <Text style={styles.treeLine}>└</Text>

                <Text style={styles.childText}>{godown.godownName}</Text>
              </View>

              <View style={styles.typeColumn}>
                <Text>GODOWN</Text>
              </View>

              <View style={styles.countColumn}>
                <Text>-</Text>
              </View>
            </View>
          ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}

      <View style={styles.cardRow}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() => setSelectedTab("GODOWN")}
        >
          <SummaryCard
            icon="business"
            title="Total Godowns"
            value={godownData?.totalGodownCount}
            bg="#E3F2FD"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() => setSelectedTab("AVAILABLE_SEED")}
        >
          <SummaryCard
            icon="inventory"
            title="Available Seeds"
            value={availableSeed?.totalAvailableQty || 0}
            bg="#FCE4EC"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() => setSelectedTab("EXPIRY_SEED")}
        >
          <SummaryCard
            icon="groups"
            title="Seeds Near Expiry"
            value={expireSeeds?.totalQty || 0}
            bg="#E8F5E9"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() => setSelectedTab("CONDEMN_SEED")}
        >
          <SummaryCard
            icon="inventory-2"
            title="Condemn Seeds"
            value={condemnSeeds?.totalAvailableQty || 0}
            bg="#FFEBEE"
          />
        </TouchableOpacity>
      </View>

      {/* Table */}

      <View style={styles.tableContainer}>
        <Text style={styles.heading}>
          {selectedTab === "GODOWN"
            ? "Total Godowns"
            : selectedTab === "AVAILABLE_SEED"
            ? "Available Seeds"
            : selectedTab === "EXPIRY_SEED"
            ? "Seeds Near Expiry"
            : "Condemn Seeds"}
        </Text>

        {selectedTab === "GODOWN" ? (
          <FlatList
            data={godownData?.unitDetails || []}
            keyExtractor={(item, index) =>
              (item?.id || item?.godownId || index).toString()
            }
            renderItem={({ item }) => {
              // Direct Godown Response
              if (item?.godownId) {
                return (
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowText}>{item?.godownName}</Text>
                    </View>

                    <Text style={{ color: "#666" }}>GODOWN</Text>
                  </View>
                );
              }

              // RO/FARM Hierarchy Response
              return renderRow(item);
            }}
          />
        ) : selectedTab === "AVAILABLE_SEED" ? (
          <FlatList
            data={availableSeed?.unitDetails || []}
            renderItem={({ item }) => renderSeedRow(item)}
            keyExtractor={(item) => item?.id?.toString()}
          />
        ) : selectedTab === "EXPIRY_SEED" ? (
          <FlatList
            data={expireSeeds.unitDetails}
            renderItem={({ item }) => renderSeedRow(item)}
            keyExtractor={(item) => item?.id?.toString()}
          />
        ) : (
          <FlatList
            data={condemnSeeds.unitDetails}
            renderItem={({ item }) => renderSeedRow(item)}
            keyExtractor={(item) => item?.id?.toString()}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  cardRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginTop: 10,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B2430",
  },

  cardTitle: {
    fontSize: 13,
    color: "#666",
  },

  tableContainer: {
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    padding: 15,
    backgroundColor: "#EEF4EE",
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  headerText: {
    flex: 1,
    fontWeight: "700",
    color: "#1B2430",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  selectedRow: {
    borderWidth: 1,
    borderColor: "green",
  },

  childRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    justifyContent: "space-between",
  },

  nameColumn: {
    width: "40%",
    flexDirection: "row",
    alignItems: "center",
  },

  typeColumn: {
    flex: 1,
    justifyContent: "center",
  },

  countColumn: {
    flex: 1,
    justifyContent: "center",
  },

  rowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B2430",
  },

  childText: {
    fontSize: 15,
    color: "#666",
  },

  treeLine: {
    marginRight: 8,
    color: "#999",
  },
  grandChildRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    paddingLeft: 55,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  godownText: {
    fontSize: 14,
    color: "#444",
  },

  selectedRow: {
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
});

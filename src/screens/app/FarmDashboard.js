import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BarChart } from "react-native-gifted-charts";
const screenWidth = Dimensions.get("window").width;

const FarmDashboard = ({
  executiveData = {},
  activities = [],
  farmYieldData = [],
  productionSummary = {},
}) => {
  const summaryCards = [
    {
      title: "Total Area",
      value: executiveData?.totalCultivableArea ?? 0,
      subtitle: "Total Area",
      icon: "person",
      iconBg: "#E8F1FF",
      iconColor: "#1976D2",
    },
    {
      title: "Area Under Seeds",
      value: executiveData?.totalProductionTargetArea ?? 0,
      subtitle: "Area Under Seeds",
      icon: "groups",
      iconBg: "#F3E5F5",
      iconColor: "#7B1FA2",
    },
    {
      title: "No. of Blocks",
      value: executiveData?.noOfBlocks ?? 0,
      subtitle: "No. of Blocks",
      icon: "check-circle",
      iconBg: "#E8F5E9",
      iconColor: "#2E7D32",
    },
    {
      title: "No. of Chaks",
      value: executiveData?.noOfChaks ?? 0,
      subtitle: "No. of Chaks",
      icon: "trending-up",
      iconBg: "#FFF3E0",
      iconColor: "#FB8C00",
    },
    {
      title: "No. of Squares",
      value: executiveData?.noOfSquares ?? 0,
      subtitle: "No. of Squares",
      icon: "trending-up",
      iconBg: "#FFF3E0",
      iconColor: "#FB8C00",
    },
    {
      title: "Expected Yield",
      value: executiveData?.expectedYield ?? 0,
      subtitle: "Expected Yield",
      icon: "agriculture",
      iconBg: "#EFEBE9",
      iconColor: "#795548",
    },
    {
      title: "Actual Yield",
      value: executiveData?.actualYield ?? 0,
      subtitle: "Actual Yield",
      icon: "inventory",
      iconBg: "#E0F2F1",
      iconColor: "#00838F",
    },
    {
      title: "Yield Variance",
      value: executiveData?.yieldVariancePercentage ?? 0,
      subtitle: "Yield Variance",
      icon: "inventory",
      iconBg: "#E0F2F1",
      iconColor: "#00838F",
      suffix: "%",
    },
  ];

  const getYieldChartData = () => {
    if (!farmYieldData?.length) {
      return [];
    }

    return farmYieldData.flatMap((item) => [
      {
        value: Number(item?.expectedRawSeed || 0),
        label: item?.name || "-",
        frontColor: "#8EC5F5",
        spacing: 5,
        labelTextStyle: {
          fontSize: 10,
          color: "#555",
        },
        onPress: () => {
          //alert(`Month: ${item.month}\nQty: ${item.total} qtl`);
          console.log(`Expected Yield(%) ${item.expectedRawSeed}`);

          Alert.alert("Detail", `Expected Yield(%): ${item.expectedRawSeed}%`, [
            { text: "OK", onPress: () => console.log("OK Pressed") },
          ]);
        },
      },
      {
        value: Number(item?.actualRawSeed || 0),
        label: "",
        frontColor: "#2563EB",
        onPress: () => {
          //alert(`Month: ${item.month}\nQty: ${item.total} qtl`);
          console.log(`Expected Yield(%) ${item.actualRawSeed}`);

          Alert.alert("Detail", `Actual Yield(%): ${item.actualRawSeed}%`, [
            { text: "OK", onPress: () => console.log("OK Pressed") },
          ]);
        },
      },
    ]);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    return `${year}-${month}-${day}`;
  };

  const renderProductionRow = (title, data = {}) => {
    return (
      <View style={styles.productionRow}>
        <View style={[styles.productionCell, styles.productionActivityCell]}>
          <Text
            style={[
              styles.productionCellText,
              title === "Shortfall" && styles.shortfallText,
            ]}
          >
            {title}
          </Text>
        </View>

        <View style={styles.productionCell}>
          <Text
            style={[
              styles.productionCellText,
              title === "Shortfall" && styles.shortfallText,
            ]}
          >
            {data?.ownProduction ?? 0}
          </Text>
        </View>

        <View style={styles.productionCell}>
          <Text
            style={[
              styles.productionCellText,
              title === "Shortfall" && styles.shortfallText,
            ]}
          >
            {data?.shareBasis ?? 0}
          </Text>
        </View>

        <View style={styles.productionCell}>
          <Text
            style={[
              styles.productionCellText,
              title === "Shortfall" && styles.shortfallText,
            ]}
          >
            {data?.throughGrowers ?? 0}
          </Text>
        </View>

        <View style={styles.productionCell}>
          <Text
            style={[
              styles.productionCellText,
              title === "Shortfall" && styles.shortfallText,
            ]}
          >
            {data?.total ?? 0}
          </Text>
        </View>
      </View>
    );
  };
  const getProductionSummaryRowData = (type) => {
    return {
      ownProduction: productionSummary?.ownProduction?.[type] ?? 0,

      shareBasis: productionSummary?.shareBasis?.[type] ?? 0,

      throughGrowers: productionSummary?.throughGrowers?.[type] ?? 0,

      total: productionSummary?.total?.[type] ?? 0,
    };
  };

  const renderActivity = ({ item }) => {
    return (
      <View style={styles.activityRow}>
        <View style={[styles.cell, styles.activityCell]}>
          <Text style={styles.cellText}>{item?.activityName || "-"}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellText}>{item?.crop || "-"}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellText}>{item?.seedVariety || "-"}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellText}>{item?.farmBlockName || "-"}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellText}>{item?.chakName || "-"}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellText}>{formatDate(item?.planDate)}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellText}>{formatDate(item?.actualDate)}</Text>
        </View>

        <View style={styles.statusCell}>
          <Text style={styles.statusText}>{item?.activityStatus || "-"}</Text>

          <Icon name="check-circle" size={20} color="#16A34A" />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ================= SUMMARY ================= */}

      <View style={styles.cardGrid}>
        {summaryCards.map((item, index) => (
          <View key={index} style={styles.summaryCard}>
            <View
              style={[styles.iconContainer, { backgroundColor: item.iconBg }]}
            >
              <Icon name={item.icon} size={27} color={item.iconColor} />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardValue}>
                {item.value}
                {item.suffix || ""}
              </Text>

              <Text style={styles.cardTitle}>{item.subtitle}</Text>
            </View>

            <Icon name="info-outline" size={21} color="#198754" />
          </View>
        ))}
      </View>

      {/* ================= ACTIVITY STATUS ================= */}

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity Status</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            {/* HEADER */}

            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.activityCell]}>
                Activity
              </Text>

              <Text style={styles.headerCell}>Crop</Text>

              <Text style={styles.headerCell}>Seed Variety</Text>

              <Text style={styles.headerCell}>Block</Text>

              <Text style={styles.headerCell}>Chak</Text>

              <Text style={styles.headerCell}>Planned Date</Text>

              <Text style={styles.headerCell}>Actual Date</Text>

              <Text style={styles.headerCell}>Status</Text>
            </View>

            {activities?.length > 0 ? (
              <FlatList
                data={activities}
                renderItem={renderActivity}
                keyExtractor={(item, index) => `${item?.activityName}-${index}`}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No activity found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* ================= YIELD COMPARISON ================= */}

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Yield Comparison</Text>

        <View style={styles.chartWrapper}>
          <BarChart
            data={getYieldChartData()}
            height={280}
            width={screenWidth - 100}
            barWidth={40}
            spacing={60}
            initialSpacing={40}
            endSpacing={40}
            roundedTop
            noOfSections={5}
            maxValue={100}
            yAxisThickness={1}
            xAxisThickness={1}
            rulesColor="#E5E7EB"
            yAxisTextStyle={{
              fontSize: 11,
              color: "#777",
            }}
            xAxisLabelTextStyle={{
              fontSize: 11,
              color: "#777",
              width: 90,
              textAlign: "center",
            }}
            dashWidth={4}
            dashGap={6}
            //isAnimated
          />
        </View>

        {/* LEGEND */}

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#8EC5F5" }]} />

            <Text style={styles.legendText}>Expected Yield (%)</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#2563EB" }]} />

            <Text style={styles.legendText}>Actual Yield (%)</Text>
          </View>
        </View>
      </View>
      {/* ================= PRODUCTION SUMMARY ================= */}

      <View style={styles.productionCard}>
        <View style={styles.productionHeader}>
          <Text style={styles.sectionTitle}>Production Summary</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={styles.productionTable}>
            {/* HEADER */}

            <View style={styles.productionHeaderRow}>
              <View
                style={[
                  styles.productionHeaderCell,
                  styles.productionActivityCell,
                ]}
              >
                <Text style={styles.productionHeaderText}>Activity</Text>
              </View>

              <View style={styles.productionHeaderCell}>
                <Text style={styles.productionHeaderText}>Own Production</Text>
              </View>

              <View style={styles.productionHeaderCell}>
                <Text style={styles.productionHeaderText}>
                  Share Basis Production
                </Text>
              </View>

              <View style={styles.productionHeaderCell}>
                <Text style={styles.productionHeaderText}>
                  Through Grower's Production
                </Text>
              </View>

              <View style={styles.productionHeaderCell}>
                <Text style={styles.productionHeaderText}>Total</Text>
              </View>
            </View>

            {/* TARGET */}

            {renderProductionRow(
              "Target",
              getProductionSummaryRowData("all").target
                ? {
                    ownProduction:
                      productionSummary?.ownProduction?.all?.target,

                    shareBasis: productionSummary?.shareBasis?.all?.target,

                    throughGrowers:
                      productionSummary?.throughGrowers?.all?.target,

                    total: productionSummary?.total?.all?.target,
                  }
                : {},
            )}

            {/* ACHIEVEMENT */}

            {renderProductionRow("Achievement", {
              ownProduction: productionSummary?.ownProduction?.all?.achievement,

              shareBasis: productionSummary?.shareBasis?.all?.achievement,

              throughGrowers:
                productionSummary?.throughGrowers?.all?.achievement,

              total: productionSummary?.total?.all?.achievement,
            })}

            {/* SHORTFALL */}

            {renderProductionRow("Shortfall", {
              ownProduction: productionSummary?.ownProduction?.all?.shortfall,

              shareBasis: productionSummary?.shareBasis?.all?.shortfall,

              throughGrowers: productionSummary?.throughGrowers?.all?.shortfall,

              total: productionSummary?.total?.all?.shortfall,
            })}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default FarmDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 6,
    paddingTop: 8,
  },

  summaryCard: {
    width: "48%",
    minHeight: 65,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: "0.5%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  cardContent: {
    flex: 1,
  },

  cardValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },

  cardTitle: {
    fontSize: 11,
    color: "#7B8190",
    marginTop: 1,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },

  sectionHeader: {
    backgroundColor: "#EDF5EA",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#263238",
  },

  tableContainer: {
    minWidth: 1050,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 13,
  },

  activityRow: {
    flexDirection: "row",
    minHeight: 42,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },

  headerCell: {
    width: 150,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#273142",
  },

  cell: {
    width: 150,
    paddingHorizontal: 10,
  },

  activityCell: {
    width: 250,
  },

  cellText: {
    fontSize: 12,
    color: "#374151",
  },

  statusCell: {
    width: 150,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusText: {
    fontSize: 11,
    color: "#374151",
  },

  emptyContainer: {
    padding: 25,
    alignItems: "center",
  },

  emptyText: {
    color: "#777",
    fontSize: 13,
  },

  chartCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },

  chartWrapper: {
    marginTop: 15,
    alignItems: "center",
  },

  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
    gap: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginRight: 6,
  },

  legendText: {
    fontSize: 11,
    color: "#777",
  },
  productionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },

  productionHeader: {
    backgroundColor: "#EDF5EA",
    paddingVertical: 14,
    paddingHorizontal: 15,
  },

  productionTable: {
    minWidth: 1000,
    padding: 15,
  },

  productionHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  productionHeaderCell: {
    width: 245,
    minHeight: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#D9D9D9",
  },

  productionActivityCell: {
    width: 180,
    alignItems: "flex-start",
  },

  productionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },

  productionRow: {
    flexDirection: "row",
    minHeight: 64,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderLeftColor: "#D9D9D9",
    borderBottomColor: "#D9D9D9",
    borderRightWidth: 1,
    borderRightColor: "#D9D9D9",
  },

  productionCell: {
    width: 245,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRightWidth: 1,
    borderRightColor: "#D9D9D9",
  },

  productionCellText: {
    fontSize: 14,
    color: "#374151",
  },

  shortfallText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
});

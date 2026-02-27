import React, { useMemo } from "react";
import { StyleSheet, Text, View, FlatList, ScrollView } from "react-native";
import PropTypes from "prop-types";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../../../utils/responsiveSize";
import Colors from "../../../../utils/Colors";
import FontFamily from "../../../../utils/FontFamily";

const Badge = ({ label, type = "default" }) => {
  const { backgroundColor, textColor } = useMemo(() => {
    const colorMap = {
      success: { backgroundColor: "#E6F7EE", textColor: "#107C41" },
      warning: { backgroundColor: "#FFF7E6", textColor: "#B35C00" },
      danger: { backgroundColor: "#FEECEC", textColor: "#B42318" },
      info: { backgroundColor: "#E6F4FF", textColor: "#175CD3" },
      default: { backgroundColor: "#F2F4F7", textColor: "#344054" },
    };

    return colorMap[type] || colorMap.default;
  }, [type]);

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

Badge.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["default", "success", "warning", "danger", "info"]),
};

Badge.defaultProps = {
  type: "default",
};

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value ?? "-"}</Text>
  </View>
);

Row.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

const formatYMD = (ymd) => {
  if (!ymd) return "-";
  const d = new Date(ymd);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString();
};

const statusBadgeType = (status) => {
  if (!status) return "default";
  const s = status.toUpperCase();
  if (s.includes("SUBMIT")) return "success";
  if (s.includes("PENDING")) return "warning";
  if (s.includes("REJECT")) return "danger";
  return "info";
};

const TimelineItem = ({ item, index, isLast }) => {
  const {
    updatedOn,
    updatedDate,
    updatedBy,
    lastUpdatedByUnitType,
    fromStatus,
    toStatus,
    remarks,
    createdBy,
    createdOn,
  } = item || {};

  const leftTime =
    formatYMD(updatedDate) === "-"
      ? formatDate(updatedOn || createdOn)
      : formatYMD(updatedDate);
  const actor = lastUpdatedByUnitType || updatedBy || createdBy || "-";

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <Text style={styles.timeText}>{leftTime}</Text>
      </View>

      <View style={styles.timelineCenter}>
        <View style={styles.timelineDot} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      <View style={styles.timelineRight}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {fromStatus
                ? `${fromStatus} → ${toStatus ?? "-"}`
                : toStatus || "Status Update"}
            </Text>
            <Badge
              label={toStatus || "UPDATE"}
              type={statusBadgeType(toStatus)}
            />
          </View>

          {!!remarks && <Text style={styles.cardBody}>{remarks}</Text>}

          <View style={styles.cardFooter}>
            <Text style={styles.metaText}>By: {actor}</Text>
            <Text style={styles.metaText}>
              On: {formatDate(updatedOn || createdOn)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

TimelineItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    updatedOn: PropTypes.string,
    updatedDate: PropTypes.string,
    updatedBy: PropTypes.string,
    lastUpdatedByUnitType: PropTypes.string,
    fromStatus: PropTypes.string,
    toStatus: PropTypes.string,
    remarks: PropTypes.string,
    createdBy: PropTypes.string,
    createdOn: PropTypes.string,
  }),
  index: PropTypes.number.isRequired,
  isLast: PropTypes.bool.isRequired,
};

TimelineItem.defaultProps = {
  item: {},
};

const DPRRevision = ({ route }) => {
  const { data } = route.params;

  const workflows = useMemo(() => {
    const arr = Array.isArray(data?.workflows) ? data.workflows : [];
    // ensure chronological order (createdOn asc), if already ordered, this keeps it stable
    return [...arr].sort(
      (a, b) => new Date(a.createdOn) - new Date(b.createdOn)
    );
  }, [data]);

  return (
    <WrapperContainer>
      <InnerHeader title={"Activity Log"} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Crop</Text>
              <Text style={styles.summaryValue}>{data?.crop ?? "-"}</Text>
              <Text style={styles.summarySub}>
                Variety: {data?.seedVariety ?? "-"} | Class:{" "}
                {data?.fromSeedClass ?? "-"}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Operation</Text>
              <Text style={styles.summaryValue}>
                {data?.operationName ?? "-"}
              </Text>
              <Text style={styles.summarySub}>
                Work Type: {data?.workType ?? "-"}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Season & Year</Text>
              <Text style={styles.summaryValue}>{data?.season ?? "-"}</Text>
              <Text style={styles.summarySub}>{data?.finYear ?? "-"}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Location</Text>
              <Text style={styles.summaryValue}>{data?.squareName ?? "-"}</Text>
              <Text style={styles.summarySub}>
                Block: {data?.blockName ?? "-"}
              </Text>
            </View>
          </View>

          <View style={styles.kvSection}>
            <Row
              label="Report Date"
              value={data?.reportDate ? formatYMD(data.reportDate) : "-"}
            />
            <Row
              label="Required Output Area"
              value={`${data?.requiredOutputArea ?? "-"}`}
            />
            <Row label="Status" value={data?.dprStatus ?? "-"} />
            <Row
              label="Created By"
              value={`${data?.createdBy ?? "-"} on ${formatDate(
                data?.createdOn
              )}`}
            />
            <Row
              label="Updated By"
              value={`${data?.updatedBy ?? "-"} on ${formatDate(
                data?.updatedOn
              )}`}
            />
          </View>

          <View style={styles.statusRow}>
            <Badge
              label={data?.dprStatus || "UNKNOWN"}
              type={statusBadgeType(data?.dprStatus)}
            />
            <Badge
              label={data?.status || "ACTIVE"}
              type={statusBadgeType(data?.status)}
            />
            {data?.equipment ? (
              <Badge label="Equipment" type="info" />
            ) : (
              <Badge label="No Equipment" type="default" />
            )}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workflow Timeline</Text>
          <FlatList
            data={workflows}
            keyExtractor={(item, idx) => `${item?.id ?? idx}`}
            renderItem={({ item, index }) => (
              <TimelineItem
                item={item}
                index={index}
                isLast={index === workflows.length - 1}
              />
            )}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  No workflow updates available.
                </Text>
              </View>
            }
          />
        </View>

        {/* Optional: Labour/Agri/Mechanical sections preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Included Sections</Text>
          <View style={styles.pills}>
            <Badge
              label={`Agriculture: ${data?.dprAgricultures?.length ?? 0}`}
              type="info"
            />
            <Badge
              label={`Labour: ${data?.dprLabour?.length ?? 0}`}
              type="info"
            />
            <Badge
              label={`Mechanical: ${data?.dprMechanicals?.length ?? 0}`}
              type="info"
            />
          </View>
        </View>
      </ScrollView>
    </WrapperContainer>
  );
};

DPRRevision.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      data: PropTypes.shape({
        workflows: PropTypes.array,
        crop: PropTypes.string,
        seedVariety: PropTypes.string,
        fromSeedClass: PropTypes.string,
        operationName: PropTypes.string,
        workType: PropTypes.string,
        season: PropTypes.string,
        finYear: PropTypes.string,
        squareName: PropTypes.string,
        blockName: PropTypes.string,
        reportDate: PropTypes.string,
        requiredOutputArea: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        dprStatus: PropTypes.string,
        createdBy: PropTypes.string,
        createdOn: PropTypes.string,
        updatedBy: PropTypes.string,
        updatedOn: PropTypes.string,
        status: PropTypes.string,
        equipment: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
        dprAgricultures: PropTypes.array,
        dprLabour: PropTypes.array,
        dprMechanicals: PropTypes.array,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default DPRRevision;

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(16),
    paddingBottom: moderateScaleVertical(24),
    gap: moderateScale(16),
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    elevation: moderateScale(4),
    shadowColor: Colors.gray,
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(6),
  },
  sectionTitle: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(4),
    borderLeftWidth: moderateScale(2),
    padding: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    borderColor: Colors.primary,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(12),
    marginVertical: moderateScaleVertical(5),
  },
  summaryCard: {
    flexBasis: "48%",
    backgroundColor: Colors.lightBackground,
    borderWidth: moderateScale(1),
    borderColor: Colors.diabledColor,
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
    gap: moderateScale(5),
  },
  summaryTitle: {
    fontSize: textScale(12),
    color: Colors.textColor,
    fontFamily: FontFamily.PoppinsRegular,
    textTransform: "capitalize",
  },
  summaryValue: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.black,
    textTransform: "capitalize",
  },
  summarySub: {
    fontSize: textScale(10),
    color: Colors.textColor,
    textTransform: "capitalize",
    fontFamily: FontFamily.PoppinsRegular,
  },
  kvSection: {
    marginTop: moderateScaleVertical(12),
    borderTopWidth: moderateScale(1),
    borderTopColor: Colors.diabledColor,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: moderateScale(10),
    borderBottomWidth: moderateScale(0.5),
    borderBottomColor: Colors.veryLightGrey,
  },
  rowLabel: {
    fontSize: textScale(12),
    color: Colors.gray,
    fontFamily: FontFamily.PoppinsRegular,
  },
  rowValue: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    maxWidth: "60%",
    textAlign: "right",
  },
  statusRow: {
    flexDirection: "row",
    gap: moderateScale(8),
    marginTop: moderateScaleVertical(12),
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(5),
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: moderateScale(64),
    // borderWidth:2
  },
  timelineLeft: {
    width: moderateScale(75),
    paddingRight: moderateScale(8),
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: textScale(12),
    color: Colors.textColor,
    fontFamily: FontFamily.PoppinsRegular,
  },
  timelineCenter: {
    width: moderateScale(25),
    alignItems: "center",
  },
  timelineDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.greenColor,
    marginTop: moderateScale(2),
  },
  timelineLine: {
    flex: 1,
    width: moderateScale(2),
    backgroundColor: Colors.veryLightGrey,
    marginTop: moderateScaleVertical(2),
  },
  timelineRight: {
    flex: 1,
    paddingLeft: moderateScale(8),
    paddingBottom: moderateScale(8),
  },
  card: {
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(1),
    borderColor: Colors.lightBackground,
    padding: moderateScale(10),
    gap: moderateScale(5),
  },
  cardHeader: {
    flexDirection: "row",
    // justifyContent: "space-between",
    gap: moderateScale(8),
    alignItems: "center",
  },
  cardTitle: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    flex: 1,
  },
  cardBody: {
    fontSize: textScale(11),
    color: Colors.black,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: textScale(10),
    color: Colors.textColor,
  },
  pills: {
    flexDirection: "row",
    gap: moderateScale(5),
    flexWrap: "wrap",
    marginTop: moderateScale(5),
  },
  emptyWrap: {
    paddingVertical: moderateScaleVertical(12),
    alignItems: "center",
  },
  emptyText: {
    color: Colors.veryLightGrey,
    fontSize: textScale(11),
  },
});

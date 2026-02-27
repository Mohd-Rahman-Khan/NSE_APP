import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Animated,
} from "react-native";
import React, { useEffect, useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import { getUserData } from "../../../../utils/Storage";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../utils/HelperFunction";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../../utils/responsiveSize";
import FontFamily from "../../../../utils/FontFamily";
import Colors from "../../../../utils/Colors";
import CustomBottomSheet from "../../../../components/CustomBottomSheet";
import CustomButton from "../../../../components/CustomButton";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import en from "../../../../constants/en";

const AnimatedCard = ({
  item,
  index,
  handleCardPress,
  getStatusColor,
  formatDate,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    // Simple fade and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <TouchableOpacity onPress={() => handleCardPress(item)} style={styles.card}>
      {/* Header Row with Date and Status */}
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{formatDate(item.reportDate)}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.dprStatus) },
          ]}
        >
          <Text style={styles.statusText}>
            {(item.dprStatus === "SUBMITTED" && "Completed") ||
              (item.dprStatus === "PENDING_WITH_BLOCK_INCHARGE" &&
                "Pending at Block In") ||
              (item.dprStatus === "PENDING_WITH_MECHANICAL_INCHARGE" &&
                "Pending at Mech. In") ||
              (item.dprStatus === "PENDING_WITH_CHAK_INCHARGE" &&
                "In Progress") ||
              (item.dprStatus === "REJECTED" && "Rejected") ||
              (item.dprStatus === "PENDING" && "Pending") ||
              (item.dprStatus === "APPROVED" && "Approved") ||
              (item.dprStatus === "PENDING_WITH_CHAK_INCHARGE_FOR_CORRECTION" &&
                "Pending at Chak For Corr.") ||
              "N/A"}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View>
        {/* Square and Operation Row */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Square Name</Text>
            <Text style={styles.value}>{item.squareName || "N/A"}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Operation</Text>
            <Text style={styles.value}>{item.operationName || "N/A"}</Text>
          </View>
        </View>

        {/* Financial Year and Crop Row */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Financial Year</Text>
            <Text style={styles.value}>{item.finYear || "N/A"}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Crop</Text>
            <Text style={styles.value}>{item.crop || "N/A"}</Text>
          </View>
        </View>

        {/* Season and Class Row */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Season</Text>
            <Text style={styles.value}>{item.season || "N/A"}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Class</Text>
            <Text style={styles.value}>{item.fromSeedClass || "N/A"}</Text>
          </View>
        </View>

        {/* Required Output and Equipment Row */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Required Output (ha)</Text>
            <Text style={styles.value}>{item.requiredOutputArea || "N/A"}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Equipment</Text>
            <Text style={styles.value}>{item.equipment ? "Yes" : "No"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

AnimatedCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    reportDate: PropTypes.string,
    dprStatus: PropTypes.string,
    squareName: PropTypes.string,
    operationName: PropTypes.string,
    finYear: PropTypes.string,
    crop: PropTypes.string,
    season: PropTypes.string,
    fromSeedClass: PropTypes.string,
    requiredOutputArea: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    equipment: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleCardPress: PropTypes.func.isRequired,
  getStatusColor: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

const DailyProgressReportList = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState();
  const [dpReportList, setDpReportList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [isFocused]);

  const fetchUserData = async () => {
    setLoading(true);
    const userData = await getUserData();
    setUserData(userData);
    await fetchDPRList(userData);
  };

  const fetchDPRList = async (userData) => {
    setLoading(false);
    try {
      const payloadData = {
        blockId: userData?.unitType === "BLOCK" ? userData?.blockId : null,
        chakId: userData?.unitType === "CHAK" ? userData?.chakId : null,
        // equipment: userData?.subUnitType === "WORKSHOP" ? true : false,
        equipment: userData?.subUnitType === "WORKSHOP",
        page: 0,
        pageSize: 25,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.DP_REPORT,
        "post",
        encryptedPayload
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      if (
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        setDpReportList(parsedDecrypted?.data);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Not getting Data");
      }
    } catch (error) {
      console.log(error, "line error");
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (item) => {
    setSelectedItem(item);
    setBottomSheetVisible(true);
  };

  const handleBottomSheetAction = (action) => {
    setBottomSheetVisible(false);
    setTimeout(() => {
      switch (action) {
        case "Details":
          navigation.navigate("DPRDetails", { data: selectedItem });
          break;
        case "Edit":
          navigation.navigate("DPREdit", { data: selectedItem });
          break;
        case "Submit":
          navigation.navigate("DPRSubmit", { data: selectedItem });
          break;
        case "Activity Log":
          navigation.navigate("DPRRevision", { data: selectedItem });
          break;
        case "Approve":
          handleApproveMethod();
          break;
        case "Reject":
          handleRejectMethod();
          break;
        default:
          break;
      }
    }, 1000); // 1000ms = 1 second delay
  };

  const handleApproveMethod = async () => {
    try {
      setLoading(true);
      const payloadData = {
        dprStatus:
          selectedItem?.equipment === true
            ? "PENDING_WITH_MECHANICAL_INCHARGE"
            : "PENDING_WITH_CHAK_INCHARGE",
        id: selectedItem?.id,
        subUnitId: userData?.subUnitId,
        subUnitName: userData?.subUnitName,
        unitId: userData?.blockId,
        unitType: userData?.unitType,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.DP_REPORT_UPDATE,
        "POST",
        encryptedPayload
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      if (
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        showSuccessMessage(parsedDecrypted?.message || "success");
        await fetchDPRList(userData);
      } else {
        showErrorMessage(`${parsedDecrypted?.message}` || "Error");
      }
    } catch (error) {
      console.log(error, "Line error");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectMethod = async () => {
    try {
      setLoading(true);
      const payloadData = {
        dprStatus: "REJECTED",
        id: selectedItem?.id,
        subUnitId: userData?.subUnitId,
        subUnitName: userData?.subUnitName,
        unitId: userData?.blockId,
        unitType: userData?.unitType,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.DP_REPORT_UPDATE,
        "POST",
        encryptedPayload
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      if (
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        showSuccessMessage(parsedDecrypted?.message || "success");
        await fetchDPRList(userData);
      } else {
        showErrorMessage(`${parsedDecrypted?.message}` || "Error");
      }
    } catch (error) {
      console.log(error, "Line error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUBMITTED":
        return Colors.greenColor;
      case "PENDING_WITH_CHAK_INCHARGE":
        return Colors.orange;
      case "PENDING_WITH_BLOCK_INCHARGE":
        return Colors.blue;
      case "PENDING_WITH_MECHANICAL_INCHARGE":
        return Colors.purple;
      case "REJECTED":
        return Colors.redThemeColor;
      default:
        return Colors.gray;
    }
  };

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={en.DAILY_PROGRESS_REPORT.TITLE} />
      {/* Create Row */}
      {/* {dpReportList.length > 0 && ( */}
        <View style={styles.exportRow}>
          <Text style={styles.headerText}>
            {en.DAILY_PROGRESS_REPORT.HEADER}
          </Text>
          {userData?.unitType != "BLOCK" && (
            <CustomButton
              text={en.DAILY_PROGRESS_REPORT.CREATE_NEW}
              handleAction={() => navigation.navigate("CreateNewDPR")}
              buttonStyle={styles.exportBtn}
            />
          )}
        </View>
      {/* )} */}
      <FlatList
        data={dpReportList}
        renderItem={({ item, index }) => (
          <AnimatedCard
            item={item}
            index={index}
            handleCardPress={handleCardPress}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        )}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {en.DAILY_PROGRESS_REPORT.NO_DATA}
            </Text>
          </View>
        }
      />
      <CustomBottomSheet
        visible={bottomSheetVisible}
        onRequestClose={() => setBottomSheetVisible(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.headerText}>
            {en.DAILY_PROGRESS_REPORT.SELECT_ACTION}
          </Text>
          <CustomButton
            text={en.DAILY_PROGRESS_REPORT.VIEW_DETAILS}
            buttonStyle={[
              styles.bottomSheetButton,
              { backgroundColor: Colors.lightGray },
            ]}
            textStyle={styles.bottomSheetButtonText}
            handleAction={() => handleBottomSheetAction("Details")}
          />
          <CustomButton
            text={en.DAILY_PROGRESS_REPORT.ACTIVITY_LOG}
            buttonStyle={[
              styles.bottomSheetButton,
              { backgroundColor: Colors.gray },
            ]}
            textStyle={styles.bottomSheetButtonText}
            handleAction={() => handleBottomSheetAction("Activity Log")}
          />

          {(selectedItem?.dprStatus === "PENDING_WITH_BLOCK_INCHARGE" ||
            selectedItem?.dprStatus ===
              "PENDING_WITH_CHAK_INCHARGE_FOR_CORRECTION") &&
            userData?.unitType === "CHAK" && (
              <CustomButton
                text={"Edit"}
                buttonStyle={[
                  styles.bottomSheetButton,
                  { backgroundColor: Colors.primary },
                ]}
                textStyle={styles.bottomSheetButtonText}
                handleAction={() => handleBottomSheetAction("Edit")}
              />
            )}

          {userData?.subUnitType === "WORKSHOP" &&
            selectedItem?.dprStatus === "PENDING_WITH_MECHANICAL_INCHARGE" && (
              <CustomButton
                text={"Submit"}
                buttonStyle={[
                  styles.bottomSheetButton,
                  { backgroundColor: Colors.purple },
                ]}
                textStyle={styles.bottomSheetButtonText}
                handleAction={() => handleBottomSheetAction("Submit")}
              />
            )}

          {selectedItem?.dprStatus === "PENDING_WITH_BLOCK_INCHARGE" ||
            (selectedItem?.dprStatus === "PENDING_WITH_CHAK_INCHARGE" &&
              userData?.unitType === "CHAK" && (
                <CustomButton
                  text={"Submit"}
                  buttonStyle={styles.bottomSheetButton}
                  textStyle={styles.bottomSheetButtonText}
                  handleAction={() => handleBottomSheetAction("Submit")}
                />
              ))}

          {userData?.unitType === "BLOCK" &&
            selectedItem?.dprStatus === "PENDING_WITH_BLOCK_INCHARGE" &&
            userData?.subUnitType != "WORKSHOP" && (
              <CustomButton
                text={"Approve"}
                buttonStyle={styles.bottomSheetButton}
                textStyle={styles.bottomSheetButtonText}
                handleAction={() => handleBottomSheetAction("Approve")}
              />
            )}
          {userData?.unitType === "BLOCK" &&
            selectedItem?.dprStatus === "PENDING_WITH_BLOCK_INCHARGE" &&
            userData?.subUnitType != "WORKSHOP" && (
              <CustomButton
                text={"Reject"}
                buttonStyle={[
                  styles.bottomSheetButton,
                  { backgroundColor: Colors.red },
                ]}
                textStyle={styles.bottomSheetButtonText}
                handleAction={() => handleBottomSheetAction("Reject")}
              />
            )}
        </View>
      </CustomBottomSheet>
    </WrapperContainer>
  );
};

export default DailyProgressReportList;

const styles = StyleSheet.create({
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: moderateScale(15),
    margin: moderateScaleVertical(10),
  },
  headerText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(4),
    borderLeftWidth: moderateScale(2),
    padding: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    borderColor: Colors.primary,
  },
  exportBtn: {
    backgroundColor: Colors.greenColor,
    paddingHorizontal: moderateScale(15),
    padding: moderateScaleVertical(7),
    borderRadius: moderateScale(5),
    width: "45%",
  },
  exportBtnText: {
    color: Colors.white,
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(14),
    textAlign: "center",
  },
  listContainer: {
    padding: moderateScale(15),
    paddingBottom: moderateScaleVertical(20),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(16),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: moderateScale(5),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.diabledColor,
    paddingBottom: moderateScaleVertical(8),
  },
  dateText: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
  },
  statusBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(5),
  },
  statusText: {
    fontSize: textScale(11),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.white,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(12),
  },
  column: {
    flex: 1,
    marginRight: moderateScale(8),
  },
  label: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.gray,
    marginBottom: moderateScaleVertical(2),
    textTransform: "capitalize",
  },
  value: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    textTransform: "capitalize",
  },
  equipmentSection: {
    marginVertical: moderateScaleVertical(8),
    gap: moderateScale(5),
  },
  equipmentItem: {
    backgroundColor: Colors.background,
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
    marginBottom: moderateScaleVertical(5),
  },
  equipmentText: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    textTransform: "capitalize",
  },
  equipmentStatus: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.greenColor,
    textTransform: "capitalize",
    marginTop: moderateScaleVertical(4),
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: moderateScale(20),
  },
  emptyText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    letterSpacing: scale(0.2),
    textTransform: "capitalize",
  },
  bottomSheetContent: {
    gap: moderateScaleVertical(8),
  },
  bottomSheetButton: {
    backgroundColor: Colors.greenColor,
    padding: moderateScaleVertical(12),
    borderRadius: moderateScale(8),
    alignItems: "center",
  },
  bottomSheetButtonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
  },
  notificationHolder: {
    borderWidth: 2,
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: Colors.bg3,
    borderColor: Colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
});

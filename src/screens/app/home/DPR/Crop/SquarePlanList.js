import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Animated,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getUserData } from "../../../../../utils/Storage";
import {
  decryptAES,
  encryptWholeObject,
} from "../../../../../utils/decryptData";
import { apiRequest } from "../../../../../services/APIRequest";
import { API_ROUTES } from "../../../../../services/APIRoutes";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../../utils/HelperFunction";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../../../utils/responsiveSize";
import FontFamily from "../../../../../utils/FontFamily";
import Colors from "../../../../../utils/Colors";
import CustomBottomSheet from "../../../../../components/CustomBottomSheet";
import CustomButton from "../../../../../components/CustomButton";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import en from "../../../../../constants/en";
import WrapperContainer from "../../../../../utils/WrapperContainer";
import InnerHeader from "../../../../../components/InnerHeader";
import DropDown from "../../../../../components/DropDown";
import { getCurrentFinancialYearObj } from "../../../../../utils/getCurrentFinancialYearObj";

const AnimatedCard = ({ item, index, getStatusColor, formatDate, onPress }) => {
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
    <View style={styles.card}>
      <View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Square Name</Text>
            <Text style={styles.value}>{item?.squareName || "N/A"}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Plan</Text>
            <Text style={styles.value}>{item?.planCode}</Text>
          </View>
        </View>

        <CustomButton
          onPress={onPress}
          text={en.DAILY_PROGRESS_REPORT.ADD}
          buttonStyle={{
            backgroundColor: Colors.greenColor,
          }}
        />
      </View>
    </View>
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
  getStatusColor: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

const SquarePlanList = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState();
  const [dpReportList, setDpReportList] = useState([]);
  const [showFilter, setshowFilter] = useState(false);
  const [financialYear, setfinancialYear] = useState([]);
  const [selectedFinancialYear, setselectedFinancialYear] = useState([]);
  const [operationList, setoperationList] = useState([]);
  const [selectedActivity, setselectedActivity] = useState("");
  const [selectedStatus, setselectedStatus] = useState({
    id: 1,
    name: "All",
    value: null,
  });
  const [squareList, setsquareList] = useState([]);
  const [selectedSquare, setselectedSquare] = useState("");
  const [planList, setPlanList] = useState([]);
  const [selectedPlan, setselectedPlan] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    const userData = await getUserData();
    setUserData(userData);
  };

  useEffect(() => {
    if (userData) {
      getFinacialYears();
      getActivityList();
      getSquareList();
    }
  }, [userData]);

  useEffect(() => {
    if (financialYear?.length > 0 && userData) {
      fetchDPRList();
    }
  }, [financialYear, userData]);

  const getFinacialYears = async () => {
    try {
      const payloadData = {};
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.FINANCIAL_YEAR,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getFinacialYears", parsedDecrypted);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setfinancialYear(parsedDecrypted?.data);
        let finnYr = getCurrentFinancialYearObj(parsedDecrypted?.data);
        setselectedFinancialYear(finnYr);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getSquareList = async () => {
    try {
      const payloadData = { chakId: userData?.chakId };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.SQUARE_MASTER_DD,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getFinacialYears", parsedDecrypted);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setsquareList(parsedDecrypted?.data);
      } else {
        setsquareList([]);
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getActivityList = async () => {
    setLoading(true);
    try {
      const operationPayloadData = {};
      const encryptedOperationPayload =
        encryptWholeObject(operationPayloadData);
      const operationListResponse = await apiRequest(
        API_ROUTES.OPERATION_MASTER_DD,
        "POST",
        encryptedOperationPayload,
      );
      const decryptedOperationListData = decryptAES(operationListResponse);
      const parsedDecryptedOperationListData = JSON.parse(
        decryptedOperationListData,
      );
      if (
        parsedDecryptedOperationListData?.status === "SUCCESS" &&
        parsedDecryptedOperationListData?.statusCode === "200"
      ) {
        setoperationList(parsedDecryptedOperationListData?.data || []);
      } else {
        showErrorMessage("Unable to get the Operation List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDPRList = async (filter = null) => {
    // console.log("userData___", userData);
    // console.log("userData___", financialYear);
    const currentFY = getCurrentFinancialYearObj(financialYear);
    setLoading(false);
    try {
      const payloadData = {
        chakId: userData?.chakId,
        farmBlockId: userData?.farmBlockId,
        squareId: "",
        planId: "",
        activityId: "",
        dprStatus: null,
        farmId: userData?.farmId,
        finYearId: currentFY?.id,
        lastActivityName: "",
        lastActivityStatus: "",
        ...filter,
      };

      console.log("parsedDecrypted", payloadData);
      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.SQUARE_LIST,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("parsedDecrypted", parsedDecrypted);
      if (
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        setDpReportList(parsedDecrypted?.data);
        setselectedActivity("");
        setselectedSquare("");
        setselectedPlan("");
      } else {
        showErrorMessage(parsedDecrypted?.message || "Not getting Data");
      }
    } catch (error) {
      console.log("parsedDecrypted", error);
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
      case "APPROVED":
        return Colors.orange;
      case "PENDING":
        return Colors.blue;
      case "DONE":
        return Colors.greenThemeColor;
      case "REJECTED":
        return Colors.redThemeColor;
      default:
        return Colors.gray;
    }
  };
  const getPlanList = async (selectedSquare) => {
    setLoading(true);

    try {
      const payloadData = {
        squareId: selectedSquare?.id,
      };
      console.log("parsed", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.PLAN_LIST,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setPlanList(newData);
      } else {
        setPlanList([]);
        showErrorMessage(parsed?.message || "Invalid response");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader
        title={"Crop Process Allocation"}
        rightIcon={
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.notificationHolder}
            onPress={() => setshowFilter(!showFilter)}
          >
            <Ionicons
              name="filter"
              size={moderateScale(25)}
              color={Colors.white}
            />
          </TouchableOpacity>
        }
      />
      {showFilter && (
        <View style={styles.filterCard}>
          <DropDown
            label="Financial Year"
            data={financialYear}
            value={selectedFinancialYear?.finYearShortName}
            selectItem={(item) => setselectedFinancialYear(item)}
          />
          <DropDown
            fieldName={"squareName"}
            label="Square"
            data={squareList}
            value={selectedSquare?.squareName}
            selectItem={(item) => {
              setselectedSquare(item);
              getPlanList(item);
              setselectedPlan("");
            }}
          />
          <DropDown
            fieldName="planId"
            label="Plan"
            data={planList}
            value={selectedPlan?.planId}
            selectItem={(item) => {
              setselectedPlan(item);
            }}
          />
          <DropDown
            label="Activity"
            data={operationList}
            value={selectedActivity?.operationName || ""}
            selectItem={(item) => {
              setselectedActivity(item);
            }}
          />
          <DropDown
            label="Status"
            data={[
              { id: 1, name: "All", value: null },
              { id: 2, name: "Pending", value: "PENDING" },
              { id: 3, name: "Approved", value: "APPROVED" },
              { id: 4, name: "Rejected", value: "REJECTED" },
              { id: 5, name: "Done", value: "DONE" },
            ]}
            value={selectedStatus?.name || ""}
            selectItem={(item) => {
              setselectedStatus(item);
            }}
          />
          <View style={styles.filterBtns}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                const data = {
                  squareId: selectedSquare?.id,
                  planId: selectedPlan?.id,
                  activityId: selectedActivity?.id,
                  dprStatus: selectedStatus?.value,
                  finYearId: selectedFinancialYear?.id,
                };
                fetchDPRList(data);
                setshowFilter(false);
              }}
            >
              <Text style={styles.primaryBtnText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setselectedActivity("");
                setselectedSquare("");
                setselectedPlan("");
                fetchDPRList();
                setshowFilter(false);
              }}
            >
              <Text style={styles.secondaryBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <FlatList
        data={dpReportList}
        renderItem={({ item, index }) => (
          <AnimatedCard
            item={item}
            index={index}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            onPress={() => {
              navigation.navigate("DprProcessAllocation", {
                landData: item,
              });
            }}
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
    </WrapperContainer>
  );
};

export default SquarePlanList;

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
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCard: {
    backgroundColor: Colors.white,
    marginHorizontal: moderateScale(15),
    margin: moderateScaleVertical(10),
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
    elevation: moderateScale(5),
    shadowColor: Colors.greenColor,
    shadowOpacity: scale(0.08),
    shadowRadius: moderateScale(5),
    shadowOffset: { width: 0, height: 2 },
  },

  filterBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: moderateScale(10),
    marginTop: moderateScale(8),
  },
  primaryBtn: {
    backgroundColor: Colors.greenColor,
    height: moderateScale(40),
    width: moderateScale(75),
    borderRadius: moderateScale(6),
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: Colors.white,
    fontFamily: FontFamily.PoppinsMedium,
    fontSize: textScale(12),
  },
  secondaryBtn: {
    backgroundColor: Colors.white,
    height: moderateScale(40),
    width: moderateScale(75),
    borderRadius: moderateScale(6),
    borderWidth: moderateScale(1.3),
    borderColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: Colors.greenColor,
    fontFamily: FontFamily.PoppinsMedium,
    fontSize: textScale(12),
  },
});

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import WrapperContainer from "../../../../../utils/WrapperContainer";
import InnerHeader from "../../../../../components/InnerHeader";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../../../../utils/responsiveSize";
import FontFamily from "../../../../../utils/FontFamily";
import Colors from "../../../../../utils/Colors";
import CustomButton from "../../../../../components/CustomButton";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { apiRequest } from "../../../../../services/APIRequest";
import { API_ROUTES } from "../../../../../services/APIRoutes";
import { getUserData } from "../../../../../utils/Storage";
import {
  decryptAES,
  encryptWholeObject,
} from "../../../../../utils/decryptData";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../../utils/HelperFunction";
import en from "../../../../../constants/en";
import CustomBottomSheet from "../../../../../components/CustomBottomSheet";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import DropDown from "../../../../../components/DropDown";

export default function DprProcessAllocation({ route }) {
  const navigation = useNavigation();

  // ------------------- STATES -------------------
  const [loading, setLoading] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [userData, setUserData] = useState([]);
  const [showAddNewButton, setShowAddNewButton] = useState(true);

  // Pagination States
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [show, setShow] = useState(false);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [activeDateField, setActiveDateField] = useState(null); // 'FROM' | 'TO'
  const [selectedPlan, setSelectedPlan] = useState(null);

  const isFocused = useIsFocused();
  const landData = route?.params?.landData;

  const NONE_PLAN_OPTION = {
    id: null,
    planCode: "None",
    planName: "None",
  };

  // ------------------- INITIAL FETCH -------------------
  useEffect(() => {
    if (isFocused) {
      resetPaginationAndFetch();
    }
  }, [isFocused, fromDate, toDate, selectedPlan]);

  const resetPaginationAndFetch = async () => {
    setPage(0);
    setHasMore(true);
    setActivityList([]);
    await fetchUserData(0, false);
  };

  const fetchUserData = async (currentPage = 0, isLoadMore = false) => {
    const data = await getUserData();
    setUserData(data);
    fetchActivityList(data, currentPage, isLoadMore);
  };

  // ------------------- API: FETCH ACTIVITY LIST -------------------
  const fetchActivityList = async (uData, currentPage, isLoadMore) => {
    if (isLoadMore) setIsFetchingMore(true);
    else setLoading(true);
    let payloadData = {
      epoId: null,
      chakId: uData?.chakId || null,
      farmBlockId: uData?.farmBlockId || null,
      pageSize: 100,
      pageNumber: 0,
      dprType: "CROP",
      // farmPlanId: selectedPlan?.planId || null,
      farmPlanId: null,
      // fromDate: "2026-01-28",
      // toDate: "2026-01-28",
      fromDate: fromDate.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
    };

    try {
      if (selectedPlan) {
        payloadData = {
          epoId: null,
          chakId: uData?.chakId || null,
          farmBlockId: uData?.farmBlockId || null,
          pageSize: 100,
          pageNumber: 0,
          dprType: "CROP",
          farmPlanId: selectedPlan?.planId || null,
          fromDate: fromDate.toISOString().split("T")[0],
          toDate: toDate.toISOString().split("T")[0],
        };
      }

      console.log("payloadData", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.GET_DPR_HISTORY,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data || [];

        setActivityList(newData);
      } else {
        showErrorMessage(parsed?.message || "Data not available.");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  // ------------------- STATUS COLOR -------------------
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

  // ------------------- DATE FORMAT -------------------
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  // ------------------- CARD PRESS -------------------
  const handleCardPress = (item) => {
    setSelectedItem(item);
    //setBottomSheetVisible(true);
    navigation.navigate("ViewDprDetail", { item: item, userData: userData });
  };

  // ------------------- BOTTOM SHEET ACTION -------------------
  const handleBottomSheetAction = (type) => {
    if (type === "Details") {
      setBottomSheetVisible(false);
      navigation.navigate("ViewDprDetail", { selectedItem });
    }
  };

  // ------------------- APPROVE / REJECT -------------------
  const approveOrRejectRequest = async (status) => {
    try {
      setLoading(true);

      const payload = [
        {
          ...selectedItem,
          currentDprStatus: status,
          equipment: status === "APPROVED" ? true : null,
          unitType: userData?.unitType,
        },
      ];

      const encrypted = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.UPDATE_DPR,
        "POST",
        encrypted,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        showSuccessMessage(parsed?.message || "Success");
        setBottomSheetVisible(false);
        resetPaginationAndFetch();
      } else {
        showErrorMessage(parsed?.message || "Error");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- CARD RENDER -------------------
  const RenderCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCardPress(item)}
      style={styles.itemCard}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{formatDate(item?.actualDate)}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.currentDprStatus) },
          ]}
        >
          <Text style={styles.statusText}>{item.currentDprStatus}</Text>
        </View>
      </View>

      <View>
        {/* <View style={styles.itemRow}>
          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>Plan Id</Text>
            <Text style={styles.itemValue}>{item?.planId || "N/A"}</Text>
          </View>
        </View> */}

        <View style={styles.itemRow}>
          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>Square Name</Text>
            <Text style={styles.itemValue}>{item?.squareName || "N/A"}</Text>
          </View>

          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>No. Of Operations</Text>
            <Text style={styles.itemValue}>{item?.activities?.length}</Text>
          </View>
        </View>

        {/* <View style={styles.itemRow}>
          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>Activity/Oper.</Text>
            <Text style={styles.itemValue}>{item?.activityName || "N/A"}</Text>
          </View>
        </View> */}
      </View>
    </TouchableOpacity>
  );

  const onChangeDate = (event, selectedDate) => {
    setShow(false);
    if (!selectedDate) return;

    if (activeDateField === "FROM") {
      setFromDate(selectedDate);
      setToDate(selectedDate);
    } else if (activeDateField === "TO") {
      setToDate(selectedDate);
    }

    setActiveDateField(null);
  };

  // ------------------- UI -------------------
  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader
        title={"Process Allocation"}
        rightIcon={
          showAddNewButton && (
            <TouchableOpacity
              onPress={() => navigation.navigate("AddNewDpr", { landData })}
              style={styles.notificationHolder}
            >
              <Icon name="add" size={25} color={Colors.white} />
            </TouchableOpacity>
          )
        }
      />
      {Platform.OS === "android" && show && (
        <DateTimePicker
          value={activeDateField === "FROM" ? fromDate : toDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {Platform.OS === "ios" && show && (
        <Modal transparent animationType="slide">
          <View style={styles.iosModalOverlay}>
            <View style={styles.iosModalContainer}>
              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={activeDateField === "FROM" ? fromDate : toDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    activeDateField === "FROM"
                      ? setFromDate(selectedDate)
                      : setToDate(selectedDate);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      <View style={styles.filterRow}>
        {/* FROM DATE */}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => {
            setActiveDateField("FROM");
            setShow(true);
          }}
        >
          <Text style={styles.label}>From Date</Text>
          <View style={styles.input}>
            <Text>{fromDate.toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>

        {/* TO DATE */}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => {
            setActiveDateField("TO");
            setShow(true);
          }}
        >
          <Text style={styles.label}>To Date</Text>
          <View style={styles.input}>
            <Text>{toDate.toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ marginHorizontal: 15, marginBottom: 10 }}>
        <DropDown
          label="Plan"
          data={[NONE_PLAN_OPTION, ...(landData?.plans || [])]}
          value={selectedPlan?.planCode || null}
          selectItem={(item) => {
            if (item.id === null) {
              // NONE selected
              setSelectedPlan(null);
            } else {
              setSelectedPlan(item);
            }
          }}
        />
      </View>

      <FlatList
        data={activityList}
        renderItem={({ item }) => <RenderCard item={item} />}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Sheet */}
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

          {userData?.unitType === "FARM_BLOCK" &&
            selectedItem?.currentDprStatus === "PENDING" &&
            userData?.subUnitType !== "WORKSHOP" && (
              <>
                <CustomButton
                  text={"Approve"}
                  buttonStyle={styles.bottomSheetButton}
                  textStyle={styles.bottomSheetButtonText}
                  handleAction={() => approveOrRejectRequest("APPROVED")}
                />
                <CustomButton
                  text={"Reject"}
                  buttonStyle={[
                    styles.bottomSheetButton,
                    { backgroundColor: Colors.red },
                  ]}
                  textStyle={styles.bottomSheetButtonText}
                  handleAction={() => approveOrRejectRequest("REJECTED")}
                />
              </>
            )}
        </View>
      </CustomBottomSheet>
    </WrapperContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: moderateScale(15),
    paddingBottom: moderateScaleVertical(20),
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(16),
    shadowColor: Colors.black,
    elevation: 5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(12),
  },
  itemColumn: {
    flex: 1,
    marginRight: moderateScale(8),
  },
  itemLabel: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.gray,
  },
  itemValue: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusText: {
    color: Colors.white,
    fontSize: 11,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.diabledColor,
    paddingBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textColor,
  },
  bottomSheetContent: {
    gap: 10,
  },
  bottomSheetButton: {
    backgroundColor: Colors.greenColor,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bottomSheetButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  notificationHolder: {
    borderWidth: 2,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    //flex: 1,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 4,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    borderRadius: 6,
    padding: 8,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
  },

  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },

  iosModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  iosModalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  doneText: {
    fontSize: 16,
    color: "blue",
    marginBottom: 10,
  },
});

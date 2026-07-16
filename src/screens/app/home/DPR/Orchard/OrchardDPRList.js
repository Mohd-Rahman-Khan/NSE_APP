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
import { ROLES } from "../../../../../constants/userRole";

export default function OrchardDPRList({ route }) {
  const navigation = useNavigation();

  // ------------------- STATES -------------------
  const [loading, setLoading] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [allActivityList, setAllActivityList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [userData, setUserData] = useState([]);
  const [showAddNewButton, setShowAddNewButton] = useState(true);

  const [show, setShow] = useState(false);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [activeDateField, setActiveDateField] = useState(null); // 'FROM' | 'TO'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dprType, setdprType] = useState({
    id: 1,
    name: "Indent Request",
  });

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
      fetchUserData();
    }
  }, [isFocused, fromDate, toDate, selectedPlan]);

  const fetchUserData = async () => {
    const data = await getUserData();
    setUserData(data);
    fetchActivityList(data);
  };

  const hasActualHours = (hours) => {
    return (
      hours !== null &&
      hours !== undefined &&
      String(hours).trim() !== "" &&
      Number(hours) > 0
    );
  };

  // ------------------- API: FETCH ACTIVITY LIST -------------------
  const fetchActivityList = async (uData) => {
    setLoading(true);
    let payloadData = {
      epoId: uData?.epoId,
      chakId: uData?.chakId || null,
      farmBlockId: uData?.farmBlockId || null,
      pageSize: 100,
      pageNumber: 0,
      dprType: "ORCHARD",
      // farmPlanId: selectedPlan?.planId || null,
      farmPlanId: landData?.planId,
      // fromDate: "2026-01-28",
      // toDate: "2026-01-28",
      fromDate: fromDate.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
    };

    try {
      console.log("payloadData", payloadData);
      //console.log("payloadData", landData);

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
        setAllActivityList(newData);

        // const indentData = newData.filter(
        //   (item) =>
        //     !item?.dprMechanicals?.some(
        //       (m) => m?.actualHours > 0 && m?.actualHours > 0?.trim() !== "",
        //     ),
        // );
        const indentData = newData.filter(
          (item) =>
            !item?.dprMechanicals?.some((m) => hasActualHours(m?.actualHours)),
        );

        setActivityList(indentData);
      } else {
        setActivityList([]);
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
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
    console.log("userData____", userData);
    const findEpoEmployeeRole = userData?.roleName?.includes(
      ROLES.EPO_EMPLOYEE,
    );
    if (
      (item?.currentDprStatus == "DRAFT" ||
        item?.currentDprStatus == "PENDING") &&
      findEpoEmployeeRole
    ) {
      navigation.navigate("AddOrchardDpr", {
        draftData: item,
        userData: userData,
        landData,
      });
    } else {
      setSelectedItem(item);
      //setBottomSheetVisible(true);
      navigation.navigate("ViewOrchardDprDetail", {
        item: item,
        userData: userData,
        landData,
      });
    }
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
        fetchUserData();
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
        <Text style={styles.dateText}>{formatDate(item?.planDate)}</Text>
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
            <Text style={styles.itemLabel}>Plot Name</Text>
            <Text style={styles.itemValue}>{item?.plotName || "N/A"}</Text>
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
        title={`Plot: ${landData?.plotName}`}
        // rightIcon={
        //   showAddNewButton && (
        //     <TouchableOpacity
        //       onPress={() => navigation.navigate("AddNewDpr", { landData })}
        //       style={styles.notificationHolder}
        //     >
        //       <Icon name="add" size={25} color={Colors.white} />
        //     </TouchableOpacity>
        //   )
        // }

        rightIcon={
          showAddNewButton && (
            <TouchableOpacity
              onPress={() => navigation.navigate("AddOrchardDpr", { landData })}
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
            {/* <Text>{fromDate.toLocaleDateString()}</Text> */}
            <Text>{formatDate(fromDate)}</Text>
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
            <Text>{formatDate(toDate)}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* <View style={{ marginHorizontal: 15, marginBottom: 10 }}>
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
      </View> */}
      <View style={{ marginHorizontal: 15, marginBottom: 10 }}>
        <DropDown
          label="Select Type"
          data={[
            { id: 1, name: "Indent Request" },
            { id: 2, name: "DPR" },
          ]}
          value={dprType?.name || ""}
          // selectItem={(item) => {
          //   setdprType(item);
          // }}

          // selectItem={(item) => {
          //   setdprType(item);

          //   //     const indentData = newData.filter(
          //   //   (item) =>
          //   //     !item?.dprMechanicals?.some(
          //   //       (m) => m?.actualHours > 0 && m?.actualHours > 0?.trim() !== "",
          //   //     ),
          //   // );

          //   if (item.name === "Indent Request") {
          //     const indentData = allActivityList.filter(
          //       (row) =>
          //         !row?.dprMechanicals?.some(
          //           (m) =>
          //             m?.actualHours ||
          //             (0 > 0 && m?.actualHours) ||
          //             0 > 0?.trim() !== "",
          //         ),
          //     );

          //     setActivityList(indentData);
          //   } else {
          //     const dprData = allActivityList?.filter((row) =>
          //       row?.dprMechanicals?.some(
          //         (m) =>
          //           m?.actualHours ||
          //           (0 > 0 && m?.actualHours) ||
          //           0 > 0?.trim() !== "",
          //       ),
          //     );

          //     setActivityList(dprData);
          //   }
          // }}

          selectItem={(item) => {
            setdprType(item);

            if (item?.name === "Indent Request") {
              const indentData = allActivityList.filter(
                (row) =>
                  !row?.dprMechanicals?.some((m) =>
                    hasActualHours(m?.actualHours),
                  ),
              );

              setActivityList(indentData);
            } else {
              const dprData = allActivityList.filter((row) =>
                row?.dprMechanicals?.some((m) =>
                  hasActualHours(m?.actualHours),
                ),
              );

              setActivityList(dprData);
            }
          }}
        />
      </View>

      {activityList?.length > 0 ? (
        <FlatList
          data={activityList}
          renderItem={({ item }) => <RenderCard item={item} />}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: "black", fontWeight: "700", fontSize: 16 }}>
            List is empty.
          </Text>
        </View>
      )}

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

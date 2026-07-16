import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
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
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { apiRequest } from "../../../../../services/APIRequest";
import { API_ROUTES } from "../../../../../services/APIRoutes";
import { getUserData } from "../../../../../utils/Storage";
import Feather from "react-native-vector-icons/Feather";
import {
  decryptAES,
  encryptWholeObject,
} from "../../../../../utils/decryptData";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../../utils/HelperFunction";
import OrchardMachanicalFilterComp from "../../../OrchardMachanicalFilterComp";
import CustomBottomSheet from "../../../../../components/CustomBottomSheet";

export default function OrchardMechanicalProcessList({ route }) {
  const navigation = useNavigation();

  // ------------------- STATES -------------------
  const [loading, setLoading] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [userData, setUserData] = useState([]);
  const [showFilterSheet, setshowFilterSheet] = useState(false);
  const [chukList, setchukList] = useState([]);
  const [operationActivityList, setoperationActivityList] = useState([]);

  const isFocused = useIsFocused();

  // ------------------- INITIAL FETCH -------------------
  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (userData) {
      getChukList();
      getOperationsActivityList();
    }
  }, [userData]);

  const fetchUserData = async () => {
    const data = await getUserData();
    setUserData(data);
    fetchDprAllocationList(data);
  };

  const getChukList = async () => {
    setLoading(true);

    try {
      const payloadData = {
        farmBlockId: userData?.farmBlockId,
      };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.CHUK_LIST,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setchukList(newData);
      } else {
        showErrorMessage(parsed?.message || "Invalid response");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };
  const getOperationsActivityList = async () => {
    setLoading(true);

    try {
      const payloadData = {};

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.OPERATION_MASTER_DD,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setoperationActivityList(newData);
      } else {
        setoperationActivityList([]);
        showErrorMessage(parsed?.message || "Something went wrong");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- API: FETCH fetchDprAllocationList LIST -------------------
  const fetchDprAllocationList = async (uData, filter = null) => {
    setLoading(true);

    try {
      const payloadData = {
        dprStatus: "APPROVED",
        dprType: "NURSERY",
        engineeringId: uData?.epoId,
        isMechanical: true,
        page: 0,
        pageNumber: 0,
        pageSize: 100,
        ...filter,
      };
      console.log("payloadData____", payloadData);

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
        const newData = parsed?.data;

        setActivityList(newData);
      } else {
        setActivityList([]);
        // showErrorMessage(
        //   parsed?.message || parsed?.status || "Something went wrong.",
        // );
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
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  // ------------------- CARD RENDER -------------------
  const RenderCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("OrchardMechanicalIssueDetails", { item });
      }}
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
            <Text style={styles.itemLabel}>Square Name</Text>
            <Text style={styles.itemValue}>{item?.squareName || "N/A"}</Text>
          </View>

          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>DPR Type</Text>
            <Text style={styles.itemValue}>{item?.dprType || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.itemRow}>
          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>Chak Name</Text>
            <Text style={styles.itemValue}>{item?.chakName || "N/A"}</Text>
          </View>

          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>DPR Code</Text>
            <Text style={styles.itemValue}>{item?.dprCode || "N/A"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ------------------- UI -------------------
  return (
    <WrapperContainer isLoading={loading}>
      {showFilterSheet && (
        <CustomBottomSheet
          visible={showFilterSheet}
          onRequestClose={() => setshowFilterSheet(false)}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.sheetContainer}
          >
            <OrchardMachanicalFilterComp
              operationActivityList={operationActivityList}
              onCLose={() => {
                setshowFilterSheet(false);
              }}
              userData={userData}
              applyFilter={(data) => {
                let payloadData = {
                  engineeringId: userData?.epoId,
                  dprType: data?.selectedDprType?.value,
                  isMechanical: true,
                  planDate: data?.planDate,
                  actualDate: data?.actualDate,
                  activityId: data?.selectedActivity?.id || null,
                  nurseryId: data?.selectedNursery?.id,
                  planId: data?.selectedPlan,
                  dprStatus:
                    data?.selectedStatus?.value == "ALL"
                      ? null
                      : data?.selectedStatus?.value,
                  pageSize: 20,
                  page: 0,
                  orchardId: data?.selectedOrchard?.id,
                  plotId: data?.selectedPlot?.id,
                };
                fetchDprAllocationList(userData, payloadData);
                setshowFilterSheet(false);
                console.log(payloadData, "filterData");
                // console.log(userData, "filterData");
              }}
            />
          </ScrollView>
        </CustomBottomSheet>
      )}

      <InnerHeader
        title={"Mechanical DPR Allocation"}
        rightIcon={
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.notificationHolder}
            onPress={() => {
              setshowFilterSheet(true);
            }}
          >
            <Feather
              name="filter"
              size={moderateScale(25)}
              color={Colors.black}
            />
          </TouchableOpacity>
        }
      />

      {activityList?.length > 0 ? (
        <FlatList
          data={activityList}
          renderItem={({ item }) => <RenderCard item={item} />}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={{ alignItems: "center", flex: 1, marginTop: 20 }}>
          <Text style={{ color: "black", fontSize: 15, fontWeight: "700" }}>
            List is empty.
          </Text>
        </View>
      )}
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
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: Colors.bg3,
    borderColor: Colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContainer: {
    padding: 15,
  },
});

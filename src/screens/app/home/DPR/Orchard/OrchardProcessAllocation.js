import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
  Modal,
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
import { ROLES } from "../../../../../constants/userRole";
import FilterComp from "./FilterComp";
import CustomBottomSheet from "../../../../../components/CustomBottomSheet";

export default function OrchardProcessAllocation({ route }) {
  const navigation = useNavigation();

  // ------------------- STATES -------------------
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);

  const [plotList, setPlotList] = useState([]);
  const [showFilterComp, setshowFilterComp] = useState(false);
  const [operationActivityList, setoperationActivityList] = useState([]);

  const isFocused = useIsFocused();
  // ------------------- INITIAL FETCH -------------------
  useEffect(() => {
    if (isFocused) {
      fetchPlotList();
      getOperationsActivityList();
    }
  }, [isFocused]);

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

  const fetchPlotList = async (filter = {}) => {
    try {
      setLoading(true);

      const userData = await getUserData();
      setUserData(userData);
      let payload;

      const findEpoEmployeeRole = userData?.roleName?.includes(
        ROLES.EPO_EMPLOYEE,
      );

      if (findEpoEmployeeRole) {
        payload = {
          epoId: String(userData?.epoId),
          orchardId: userData?.subUnitId,
          ...filter,
        };
      } else {
        payload = {
          epoId: String(userData?.epoId),
          //orchardId: "7",
          ...filter,
        };
      }

      console.log("📤 PLOT API PAYLOAD", userData);

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.FIND_PLOT_BY_EPOID,
        "POST",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("📥 PLOT API RESPONSE", parsed);

      if (parsed?.status === "SUCCESS") {
        setPlotList(parsed?.data || []);
      } else {
        showErrorMessage(parsed?.message || "Plot data not available");
      }
    } catch (error) {
      console.log("❌ fetchPlotList error", error);
      showErrorMessage("Something went wrong");
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

  const RenderPlotCard = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() =>
        navigation.navigate("OrchardDPRList", {
          landData: item,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.itemValue}>{item?.plotName || "N/A"}</Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("OrchardDPRList", {
              landData: item,
            })
          }
        >
          <Icon name="add-circle-outline" size={24} color={Colors.greenColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemRow}>
        {/* <View style={styles.itemColumn}>
          <Text style={styles.itemLabel}>Plot Name</Text>
          <Text style={styles.itemValue}>{item?.plotName || "-"}</Text>
        </View> */}

        {/* <View style={styles.itemColumn}>
          <Text style={styles.itemLabel}>Total Area (ha)</Text>
          <Text style={styles.itemValue}>{item?.totalArea || "-"}</Text>
        </View> */}
      </View>

      <View style={styles.itemRow}>
        <View style={styles.itemColumn}>
          <Text style={styles.itemLabel}>Last Operation</Text>
          <Text style={styles.itemValue}>{item?.operationName || "-"}</Text>
        </View>

        <View style={styles.itemColumn}>
          <Text style={styles.itemLabel}>Status</Text>
          <Text
            style={[
              styles.itemValue,
              { color: getStatusColor(item?.lastOperationStatus) },
            ]}
          >
            {item?.currentDprStatus || "-"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ------------------- UI -------------------
  return (
    <WrapperContainer isLoading={loading}>
      {showFilterComp && (
        <CustomBottomSheet
          visible={showFilterComp}
          onRequestClose={() => setshowFilterComp(false)}
        >
          <ScrollView>
            <FilterComp
              operationActivityList={operationActivityList}
              userData={userData}
              applyFilter={(data) => {
                let filterData = {
                  activityId: data?.selectedActivity?.id || null,
                  plotId: data?.selectedPlot?.id,
                  dprStatus:
                    data?.selectedStatus?.value == "ALL"
                      ? null
                      : data?.selectedStatus?.value,
                  orchardId: data?.selectedOrchard?.id,
                };
                fetchPlotList(filterData);
                setshowFilterComp(false);
              }}
              onCLose={() => {
                setshowFilterComp(false);
              }}
            />
          </ScrollView>
        </CustomBottomSheet>
      )}
      <InnerHeader
        title={"Orchard Process Allocation"}
        rightIcon={
          <TouchableOpacity
            onPress={() => {
              setshowFilterComp(true);
            }}
            style={styles.filterBtn}
          >
            <Icon name="filter-list" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={plotList}
        renderItem={({ item }) => <RenderPlotCard item={item} />}
        keyExtractor={(item, index) => String(item?.plotId || index)}
        contentContainerStyle={styles.listContainer}
      />
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
    borderColor: Colors.border,
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
  filterBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: Colors.greenColor,
    justifyContent: "center",
    alignItems: "center",
  },
});

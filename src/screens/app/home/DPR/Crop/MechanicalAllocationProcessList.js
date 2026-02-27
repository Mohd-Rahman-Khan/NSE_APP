import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
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
import {
  decryptAES,
  encryptWholeObject,
} from "../../../../../utils/decryptData";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../../utils/HelperFunction";

export default function MechanicalAllocationProcessList({ route }) {
  const navigation = useNavigation();

  // ------------------- STATES -------------------
  const [loading, setLoading] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [userData, setUserData] = useState([]);

  const isFocused = useIsFocused();

  // ------------------- INITIAL FETCH -------------------
  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  const fetchUserData = async () => {
    const data = await getUserData();
    setUserData(data);
    fetchDprAllocationList(data);
  };

  // ------------------- API: FETCH fetchDprAllocationList LIST -------------------
  const fetchDprAllocationList = async (uData) => {
    setLoading(true);

    try {
      const payloadData = {
        epoId: null,
        farmBlockId: "2",
        dprType: null,
        pageSize: 20,
        pageNumber: 0,
      };

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
        showErrorMessage(parsed?.message || "Invalid response");
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

  // ------------------- CARD RENDER -------------------
  const RenderCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("MechanicalIssueDetails", { item });
      }}
      style={styles.itemCard}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{item?.planDate}</Text>
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
            <Text style={styles.itemLabel}>Operation Name</Text>
            <Text style={styles.itemValue}>{item?.operationName || "N/A"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ------------------- UI -------------------
  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={"Mechanical DPR Allocation"} />

      <FlatList
        data={activityList}
        renderItem={({ item }) => <RenderCard item={item} />}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
});

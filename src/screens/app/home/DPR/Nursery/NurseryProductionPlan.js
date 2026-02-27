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

export default function NurseryProductionPlan({ route }) {
  const navigation = useNavigation();

  // ------------------- STATES -------------------
  const [loading, setLoading] = useState(false);
  const [planList, setPlanList] = useState([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchNurseryPlans();
    }
  }, [isFocused]);

  const fetchNurseryPlans = async () => {
    try {
      setLoading(true);

      const userData = await getUserData();

      if (!userData?.epoId) {
        showErrorMessage("EPO ID not found");
        return;
      }

      const payload = {
        epoId: String(userData.epoId), // 🔥 IMPORTANT
        dprType: "NURSERY",
      };

      console.log("📤 NURSERY PLAN PAYLOAD", payload);

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        "prod_farm/dpr/find-plans-by-epoId",
        "POST",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("📥 NURSERY PLAN RESPONSE", parsed);

      if (parsed?.status === "SUCCESS") {
        setPlanList(parsed?.data || []);
      } else {
        showErrorMessage(parsed?.message || "No nursery plans found");
      }
    } catch (error) {
      console.log("❌ fetchNurseryPlans error", error);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const RenderPlanCard = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.planTitle} numberOfLines={2}>
            {item?.planCode || "N/A"}
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("NurseryDPRList", {
                landData: item,
              })
            }
          >
            <Icon name="add-circle" size={26} color={Colors.greenColor} />
          </TouchableOpacity>
        </View>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* DETAILS */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Last Operation</Text>
            <Text style={styles.value}>{item?.lastActivity || "-"}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item?.lastActivityStatus === "SUBMITTED"
                      ? "#E3F2FD"
                      : "#FFF3E0",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item?.lastActivityStatus === "SUBMITTED"
                        ? "#1565C0"
                        : "#EF6C00",
                  },
                ]}
              >
                {item?.lastActivityStatus || "-"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ------------------- UI -------------------
  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={"Nursery Production Plan"} />
      <FlatList
        data={planList}
        renderItem={({ item }) => <RenderPlanCard item={item} />}
        keyExtractor={(item, index) => String(item?.planId || index)}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No Nursery Plans Found</Text>
        }
      />
    </WrapperContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: moderateScale(14),
    paddingBottom: moderateScaleVertical(30),
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  planTitle: {
    flex: 1,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.textColor,
    marginRight: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  col: {
    flex: 1,
  },

  label: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.gray,
    marginBottom: 4,
  },

  value: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsMedium,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: Colors.gray,
    fontSize: textScale(14),
  },
});

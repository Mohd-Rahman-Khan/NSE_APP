import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../../utils/responsiveSize";
import Colors from "../../../../utils/Colors";
import FontFamily from "../../../../utils/FontFamily";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import { showErrorMessage } from "../../../../utils/HelperFunction";
import { Dropdown } from "react-native-element-dropdown";
import CustomButton from "../../../../components/CustomButton";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
const Crop = () => {
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const isFocused = useIsFocused();
  const [seedCropName, setSeedCropName] = useState("");
  const [status, setStatus] = useState("");
  const [cropListData, setCropListData] = useState();
  console.log(cropListData, "line 33");
  const navigation = useNavigation();
  const statusData = [
    {
      id: 1,
      name: "All",
      value: "All",
    },
    {
      id: 2,
      name: "Active",
      value: "Active",
    },
    {
      id: 3,
      name: "Inactive",
      value: "Inactive",
    },
  ];

  useEffect(() => {
    fetchCropList();
  }, [isFocused]);

  const fetchCropList = async (filters = {}) => {
    try {
      setLoading(true);
      const payloadData = {
        page: 0,
        pageSize: 25,
        seedCropName: filters.seedCropName ?? "",
        status:
          filters.status && filters.status !== "All" ? filters.status : "",
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.CROP_LIST,
        "post",
        encryptedPayload
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log(parsedDecrypted, "line 69");
      if (
        parsedDecrypted &&
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        setCropListData(parsedDecrypted?.data);
      } else if (
        parsedDecrypted &&
        parsedDecrypted?.status === "FAILED" &&
        parsedDecrypted?.statusCode === "300"
      ) {
        setCropListData(parsedDecrypted?.data);
      } else {
        showErrorMessage("Error");
        console.log("Error ");
      }
    } catch (error) {
      console.log(error, "line 83");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 -> 12

    return `${day}-${month}-${year} ${String(hours).padStart(
      2,
      "0"
    )}:${minutes} ${ampm}`;
  };

  const renderCropList = ({ item, index }) => {
    return (
      <View key={index} style={styles.programmeCard}>
        <Text style={styles.programmeId}>{item?.seedCropName}</Text>
        <View style={styles.separator} />
        <View style={styles.cardRow}>
          <Text style={styles.label}>Crop Group</Text>
          <Text style={styles.valueText}>{item.cropGroupName}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Adv. Payable Flag</Text>
          <Text style={styles.valueText}>{item.advancePayableFlag}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Trans. Rebate Flag</Text>
          <Text style={styles.valueText}>{item.transRebateFlag}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Guarantee Required</Text>
          <Text style={styles.valueText}>{item.guaranteeRequired}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Adv Tag Required</Text>
          <Text style={styles.valueText}>{item.advTagRequired}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Min Sample Qty</Text>
          <Text style={styles.valueText}>{item.minSampleQty}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Testing Charge</Text>
          <Text style={styles.valueText}>{item.testingCharge}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>GoT Charge</Text>
          <Text style={styles.valueText}>{item.gotCharge}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Field Process</Text>
          <Text style={styles.valueText}>{item.fieldProcess}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>UOM Short Name</Text>
          <Text style={styles.valueText}>{item.uomShortName}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Crop FIR Type</Text>
          <Text style={styles.valueText}>
            {item.cropFirType?.cropFirTypeName}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Inspection CheckList</Text>
          <Text style={styles.valueText}>{item.inspectionCheckList}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Created On</Text>
          <Text style={styles.valueText}>{formatDate(item.createdOn)}</Text>
        </View>

        <View style={styles.cardRow}>
          <CustomButton
            text={"View Details"}
            buttonStyle={[
              styles.exportBtn,
              { width: "48%", height: moderateScaleVertical(45) },
            ]}
            handleAction={() =>
              navigation.navigate("CropDetails", { item: item })
            }
          />
          <CustomButton
            text={"Edit Details"}
            buttonStyle={[
              styles.exportBtn,
              {
                width: "48%",
                height: moderateScaleVertical(45),
                backgroundColor: Colors.white,
                borderColor: Colors.greenColor,
                borderWidth: moderateScale(2),
              },
            ]}
            textStyle={{ color: Colors.greenColor }}
            handleAction={() =>
              navigation.navigate("EditCropDetails", { item: item })
            }
          />
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text style={{ fontSize: textScale(14), color: Colors.textColor }}>
          No results found.
        </Text>
      </View>
    );
  };
  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader
        title={"Crop"}
        rightIcon={
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.notificationHolder}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Ionicons
              name="filter"
              size={moderateScale(25)}
              color={Colors.white}
            />
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={moderateScaleVertical(10)}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: moderateScaleVertical(40) }}
          keyboardShouldPersistTaps="handled"
        >
          {/* FILTERS */}
          {showFilter && (
            <View style={styles.filterCard}>
              <TextInput
                style={styles.input}
                value={seedCropName}
                onChangeText={(text) => setSeedCropName(text)}
                placeholder="Seed Crop Name"
                placeholderTextColor={Colors.textColor}
              />
              <View style={{ marginVertical: moderateScale(8) }}>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  data={statusData}
                  labelField="name"
                  valueField="value"
                  placeholder="Select Status"
                  value={status}
                  onChange={(item) => {
                    setStatus(item.value);
                  }}
                />
              </View>

              <View style={styles.filterBtns}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    fetchCropList({ seedCropName, status });
                  }}
                >
                  <Text style={styles.primaryBtnText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setSeedCropName("");
                    setStatus("");
                    fetchCropList();
                  }}
                >
                  <Text style={styles.secondaryBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.exportRow}>
            <Text style={styles.headerText}>Crop List</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: moderateScale(20),
              }}
            >
              <TouchableOpacity
                style={styles.exportBtn}
                onPress={() =>
                  navigation.navigate("EditCropDetails", { item: null })
                }
              >
                <Text style={styles.exportBtnText}>Add New</Text>
              </TouchableOpacity>
              {cropListData && (
                <TouchableOpacity style={styles.exportBtn}>
                  <Text style={styles.exportBtnText}>Export</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Crop List */}
          <FlatList
            data={cropListData}
            keyExtractor={(item) => item.id}
            renderItem={renderCropList}
            scrollEnabled={false}
            ListEmptyComponent={renderEmpty}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

export default Crop;

const styles = StyleSheet.create({
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
  input: {
    borderWidth: moderateScale(1),
    borderColor: Colors.lightBackground,
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
    marginVertical: moderateScale(8),
    fontSize: textScale(13),
    color: Colors.black,
    fontFamily: FontFamily.PoppinsRegular,
  },
  filterBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: moderateScale(10),
    marginTop: moderateScale(8),
  },
  primaryBtn: {
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
    height: moderateScale(40),
    width: moderateScale(75),
    borderRadius: moderateScale(6),
  },
  primaryBtnText: {
    color: Colors.white,
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(13),
  },
  secondaryBtn: {
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    height: moderateScale(40),
    width: moderateScale(75),
    borderRadius: moderateScale(6),
    borderWidth: moderateScale(1.3),
    borderColor: Colors.greenColor,
  },
  secondaryBtnText: {
    color: Colors.greenColor,
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(13),
  },
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: moderateScale(15),
    margin: moderateScaleVertical(10),
  },
  headerText: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(4),
    borderLeftWidth: moderateScale(2),
    padding: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    borderColor: Colors.primary,
  },
  exportBtn: {
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
    height: moderateScale(40),
    width: moderateScale(100),
    borderRadius: moderateScale(5),
  },
  exportBtnText: {
    color: Colors.white,
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(13),
    textAlign: "center",
  },
  programmeCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    marginHorizontal: moderateScale(15),
    marginBottom: moderateScaleVertical(10),
    padding: moderateScale(10),
    elevation: moderateScale(5),
    shadowColor: Colors.greenColor,
    shadowOpacity: scale(0.09),
    shadowRadius: moderateScale(5),
    shadowOffset: { width: 0, height: 3 },
  },
  programmeId: {
    fontFamily: FontFamily.RubikRegular,
    fontSize: textScale(14),
    marginBottom: moderateScaleVertical(5),
    color: Colors.greenThemeColor,
    textTransform: "capitalize",
  },
  separator: {
    borderBottomColor: Colors.diabledColor,
    borderBottomWidth: moderateScale(1),
    marginBottom: moderateScaleVertical(10),
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(5),
  },
  label: {
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    fontSize: textScale(12),
    textAlign: "left",
  },
  valueText: {
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(13),
    color: Colors.textColor,
    textAlign: "right",
  },
  dropdown: {
    borderWidth: moderateScale(1),
    borderColor: Colors.lightBackground,
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    height: moderateScale(45),
  },
  placeholderStyle: {
    fontSize: textScale(13),
    color: Colors.textColor,
    fontFamily: FontFamily.PoppinsRegular,
  },
  selectedTextStyle: {
    fontSize: textScale(13),
    color: Colors.black,
    fontFamily: FontFamily.PoppinsRegular,
  },
  inputSearchStyle: {
    height: moderateScale(40),
    fontSize: textScale(13),
    color: Colors.black,
  },
  notificationHolder: {
    borderWidth: 2,
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(25),
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
});

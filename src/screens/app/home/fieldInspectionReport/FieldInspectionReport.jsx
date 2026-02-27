import React, { useState, useRef, useEffect } from "react";
import { Buffer } from "buffer";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  PermissionsAndroid,
} from "react-native";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import Colors from "../../../../utils/Colors";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../../utils/responsiveSize";
import FontFamily from "../../../../utils/FontFamily";
import { useNavigation } from "@react-navigation/native";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import { getUserData } from "../../../../utils/Storage";
import CustomBottomSheet from "../../../../components/CustomBottomSheet";
import RNFS from "react-native-fs";
import CustomButton from "../../../../components/CustomButton";
import { showSuccessMessage } from "../../../../utils/HelperFunction";
import FileViewer from "react-native-file-viewer";
import Ionicons from "react-native-vector-icons/Ionicons";

// Mock data from screenshot
const PROGRAMMES = [
  {
    id: "1",
    programmeId: "3030-3031 | Rabi | Sunflower | HD-4545 | BS | GC55",
    growerName: "Grower",
    rawSeed: "250",
    gradedSeed: "100",
    status: "INSPECTED",
  },
  {
    id: "2",
    programmeId: "3030-3031 | Rabi | Sunflower | HD-4545 | BS | GRW-DEMO",
    growerName: "Grower",
    rawSeed: "4000",
    gradedSeed: "3500",
    status: "ISSUED",
  },
  {
    id: "3",
    programmeId: "2016-2017 | Rabi | Sunflower | HD-4545 | BS | 454",
    growerName: "Grower",
    rawSeed: "2000",
    gradedSeed: "2000",
    status: "PLANNED",
  },
  {
    id: "4",
    programmeId: "2021-2022 | Zaid | Lentil | Black Lentil | BS | Dev_test",
    growerName: "Grower",
    rawSeed: "101",
    gradedSeed: "101",
    status: "PLANNED",
  },
  {
    id: "5",
    programmeId: "2022-2023 | Zaid | Lentil | HD-2967ddd | BS | Dev_test",
    growerName: "Grower",
    rawSeed: "80",
    gradedSeed: "80",
    status: "PLANNED",
  },
  {
    id: "6",
    programmeId: "2020-2021 | Zaid | Corn | Pop Corn | BS | 454",
    growerName: "Grower",
    rawSeed: "1000",
    gradedSeed: "999",
    status: "RECEIVED",
  },
  {
    id: "7",
    programmeId: "2022-2023 | Zaid | Corn | Pop Corn | BS | 454",
    growerName: "Grower",
    rawSeed: "1000",
    gradedSeed: "800",
    status: "RECEIVED",
  },
];

const FieldInspectionReport = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [growerName, setGrowerName] = useState("");
  const [planId, setPlanId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [programmingList, setProgrammingList] = useState();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selctedData, setSelctedData] = useState();
  const [userDataVariable, setUserDataVariable] = useState();
  const [PlanIdList, setPlanIdList] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [showPlanIdDropdown, setShowPlanIdDropdown] = useState(false);
  const [showOpenShowPreviewModal, setShowOpenShowPreviewModal] =
    useState(false);
  const animationRefs = useRef(
    PROGRAMMES.map(() => new Animated.Value(0))
  ).current;

  const [fileUri, setFileUri] = useState(null);
  useEffect(() => {
    // Animate each card in sequence
    Animated.stagger(
      120,
      animationRefs.map((ref) =>
        Animated.spring(ref, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        })
      )
    ).start();
  }, [animationRefs]);

  useEffect(() => {
    fetchProgrammeList();
    fetchPlanIdList();
  }, []);

  const fetchPlanIdList = async () => {
    try {
      const userData = await getUserData();
      const payloadData = {
        aoId: userData?.aoId,
        roId: userData?.roId,
      };

      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.PLAN_ID_LIST,
        "post",
        encryptedPayload
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log(parsedDecrypted, "line 134");
      if (
        parsedDecrypted &&
        parsedDecrypted?.status === "FAILED" &&
        parsedDecrypted?.statusCode === "300"
      ) {
        showErrorMessage(parsedDecrypted?.message || "Failed to fetch Plan Id");
      }
      if (
        parsedDecrypted &&
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        setPlanIdList(parsedDecrypted?.data);
      }
    } catch (error) {
      console.error(error?.messages, "Error in Error Bloack");
      showErrorMessage(error?.messages || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (growerName === "" && planId === "" && mobileNo === "") {
      fetchProgrammeList();
    }
  }, [growerName, planId, mobileNo]);

  const fetchProgrammeList = async () => {
    try {
      setLoading(true);
      const userData = await getUserData();
      setUserDataVariable(userData);
      const payloadData = {
        aoId: userData?.aoId,
        growerMobileNo: mobileNo,
        growerName: growerName,
        page: 0,
        pageSize: 25,
        pcId: userData?.pcId,
        planId: planId,
        roId: userData?.roId,
      };
      console.log(payloadData, "payloadData");
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.PROGRAMME_LIST,
        "post",
        encryptedPayload
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log(parsedDecrypted, "line 134");
      if (
        parsedDecrypted &&
        parsedDecrypted?.status === "FAILED" &&
        parsedDecrypted?.statusCode === "300"
      ) {
        setProgrammingList(parsedDecrypted?.data);
      }
      if (
        parsedDecrypted &&
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        setProgrammingList(parsedDecrypted?.data);
      }
    } catch (error) {
      console.error(error?.messages, "Error in Error Bloack");
    } finally {
      setLoading(false);
    }
  };

  const renderProgramme = ({ item, index }) => {
    const animatedValue = animationRefs[index];


    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate("FiledInspectionReportDetails", { item: item });
          // setSelctedData(item);
          // setShowBottomSheet(true);
        }}
      >
        <Animated.View
          style={[
            styles.programmeCard,
            {
              opacity: animatedValue || 1,
              transform: [
                {
                  translateY: animatedValue
                    ? animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      })
                    : 0,
                },
              ],
            },
          ]}
        >
          <Text style={styles.programmeId}>{item.programmeId}</Text>
          <View style={styles.separator} />
          <View style={styles.cardRow}>
            <Text style={styles.label}>Grower</Text>
            <Text style={styles.valueText}>{item.growerName}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Raw Seed</Text>
            <Text style={styles.valueText}>{item.estimatedRawSeed} Kg</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Graded Seed</Text>
            <Text style={styles.valueText}>{item.estimatedGoodSeed} Kg</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.status}>{item.productionStatus}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const downloadExcelFile = async () => {
    try {
      setLoading(true);
      const payloadData = {
        aoId: userDataVariable?.aoId,
        growerMobileNo: mobileNo,
        growerName: growerName,
        page: 0,
        pageSize: 25,
        pcId: "",
        planId: planId,
        roId: userDataVariable?.roId,
      };
      const encryptedPayload = encryptWholeObject(payloadData);

      // Request binary (Excel) data
      const response = await apiRequest(
        API_ROUTES.DOWNLOAD_PROGRAM_EXCEL_LIST,
        "post",
        encryptedPayload,
        null,
        { responseType: "arraybuffer" }
      );
      // console.log(response,"line 281")
      const base64Data = Buffer.from(response, "binary").toString("base64");
      const fileName = `Programme_List_${Date.now()}.xlsx`;
      const dirPath =
        Platform.OS === "ios"
          ? RNFS.DocumentDirectoryPath
          : RNFS.DownloadDirectoryPath;

      if (Platform.OS === "android") {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
        } catch (error) {
          console.log("Permission error", error);
        }
      }

      const filePath = `${dirPath}/${fileName}`;
      await RNFS.writeFile(filePath, base64Data, "base64");
      showSuccessMessage(`Download Complete,Saved to: ${filePath}`);
      setShowOpenShowPreviewModal(true);
      setFileUri(filePath);
    } catch (error) {
      console.log(error, "downloadExcelFile error");
      Alert.alert("Failed", "Unable to download file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!fileUri) {
      Alert.alert("Error", "No file path provided");
      return;
    }
    try {
      setLoading(true);
      setShowOpenShowPreviewModal(false);
      setTimeout(async () => {
        await FileViewer.open(fileUri);
      }, 1000);
    } catch (err) {
      Alert.alert("Error", "Failed to open file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader
        title={"Field Inspection Report"}
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
                value={growerName}
                onChangeText={setGrowerName}
                placeholder="Grower Name"
                placeholderTextColor={Colors.textColor}
              />
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowPlanIdDropdown(true)}
              >
                <Text
                  style={{
                    color: selectedPlanId ? Colors.black : Colors.textColor,
                  }}
                >
                  {selectedPlanId
                    ? PlanIdList.find((p) => p.planId === selectedPlanId)
                        ?.planId
                    : "Select Plan Id"}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={mobileNo}
                onChangeText={setMobileNo}
                placeholder="Mobile No"
                placeholderTextColor={Colors.textColor}
                keyboardType="phone-pad"
              />
              <View style={styles.filterBtns}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => fetchProgrammeList()}
                >
                  <Text style={styles.primaryBtnText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setGrowerName("");
                    setPlanId("");
                    setMobileNo("");
                    setSelectedPlanId("");
                  }}
                >
                  <Text style={styles.secondaryBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.exportRow}>
            <Text style={styles.headerText}>Programme List</Text>
            {programmingList && (
              <TouchableOpacity
                style={styles.exportBtn}
                onPress={() => downloadExcelFile()}
              >
                <Text style={styles.exportBtnText}>Export</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* PROGRAMME LIST WITH ANIMATION */}
          <FlatList
            data={programmingList}
            keyExtractor={(item) => item.id}
            renderItem={renderProgramme}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text
                  style={{ fontSize: textScale(14), color: Colors.textColor }}
                >
                  No results found.
                </Text>
              </View>
            )}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomBottomSheet
        visible={showBottomSheet}
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <Text style={styles.headerText}>Select the Action</Text>
        <CustomButton
          text={"View Inspection"}
          buttonStyle={styles.inspectionButtonView}
          textStyle={styles.buttonText2}
          handleAction={() => {
            navigation.navigate("FiledInspectionReportDetails", {
              item: selctedData,
            });
            setShowBottomSheet(false);
          }}
        />
        <CustomButton
          text={"Seed Intake History"}
          buttonStyle={styles.intakeHistoryButtonView}
          textStyle={styles.buttonText}
          handleAction={() => {
            navigation.navigate("SeedsIntakeHistory", { item: selctedData });
            setShowBottomSheet(false);
          }}
        />
      </CustomBottomSheet>
      <CustomBottomSheet
        visible={showOpenShowPreviewModal}
        onRequestClose={() => setShowOpenShowPreviewModal(false)}
      >
        <Text style={styles.headerText}>
          Do you want to view the Export file
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: moderateScale(10),
          }}
        >
          <CustomButton
            text={"Preview"}
            buttonStyle={styles.openButton}
            handleAction={() => handlePreview()}
          />
          <CustomButton
            text={"Close"}
            buttonStyle={styles.closeButton}
            handleAction={() => setShowOpenShowPreviewModal(false)}
          />
        </View>
      </CustomBottomSheet>
      <CustomBottomSheet
        visible={showPlanIdDropdown}
        onRequestClose={() => setShowPlanIdDropdown(false)}
      >
        <Text style={styles.headerText}>Select Plan Id</Text>
        <ScrollView
          style={{
            maxHeight: moderateScaleVertical(300),
            width: "100%",
          }}
        >
          {PlanIdList.map((item) => (
            <TouchableOpacity
              key={item.planId}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightBackground,
              }}
              onPress={() => {
                console.log(item, "selected plan id");
                setSelectedPlanId(item.planId);
                setShowPlanIdDropdown(false);
                setPlanId(item.id);
              }}
            >
              <Text style={{ color: Colors.black }}>{item.planId}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </CustomBottomSheet>
    </WrapperContainer>
  );
};

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
  },
  exportBtnText: {
    color: Colors.white,
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(12),
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
    fontSize: textScale(13),
    marginBottom: moderateScaleVertical(5),
    color: Colors.greenColor,
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
    color: Colors.gray,
    fontSize: textScale(12),
    textAlign: "left",
  },
  valueText: {
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(13),
    color: Colors.black,
    textAlign: "right",
  },
  status: {
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(13),
    color: Colors.black,
    paddingLeft: moderateScale(5),
  },
  actionButton: {
    alignSelf: "flex-end",
    width: "45%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.diabledColor,
    borderRadius: moderateScale(5),
    padding: moderateScale(5),
    borderColor: Colors.diabledColor,
    borderWidth: 1,
  },
  actionText: {
    fontSize: textScale(14),
    color: Colors.greenColor,
    textAlign: "center",
    fontFamily: FontFamily.PoppinsMedium,
  },
  emptyContainer: {
    padding: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: textScale(14),
    color: Colors.textColor,
  },
  inspectionButtonView: {
    backgroundColor: Colors.greenColor,
  },
  intakeHistoryButtonView: {
    backgroundColor: Colors.fourthColor,
    borderColor: Colors.fourthColor,
    borderWidth: moderateScale(2),
  },
  buttonText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.greenColor,
    fontSize: textScale(14),
    textTransform: "capitalize",
  },
  buttonText2: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.white,
    fontSize: textScale(14),
    textTransform: "capitalize",
  },
  openButton: {
    width: "48%",
    backgroundColor: Colors.greenColor,
  },
  closeButton: {
    width: "48%",
    backgroundColor: Colors.redThemeColor,
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

export default FieldInspectionReport;

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import WrapperContainer from "../../../utils/WrapperContainer";
import InnerHeader from "../../../components/InnerHeader";
import { getUserData } from "../../../utils/Storage";
import Feather from "react-native-vector-icons/Feather";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../utils/responsiveSize";
import Colors from "../../../utils/Colors";
import FontFamily from "../../../utils/FontFamily";
import { apiRequest } from "../../../services/APIRequest";
import { API_ROUTES } from "../../../services/APIRoutes";
import { decryptAES, encryptWholeObject } from "../../../utils/decryptData";
import { showErrorMessage } from "../../../utils/HelperFunction";
import CustomBottomSheet from "../../../components/CustomBottomSheet";
import CustomButton from "../../../components/CustomButton";
import { useNavigation } from "@react-navigation/native";

const DailyProgressReport = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [financialYear, setfinancialYear] = useState();
  const [financialYearId, setFinancialYearId] = useState();
  const [season, setSeason] = useState();
  const [seasonId, setSeasonId] = useState();
  const [crop, setCrop] = useState();
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropId, setCropId] = useState(null);
  const [seedVariety, setSeedVariety] = useState();
  const [financialYearData, setFinancialYearData] = useState([]);
  const [seasonListData, setSeasonListData] = useState([]);
  const [cropListData, setCropListData] = useState([]);
  const [isFyOpen, setIsFyOpen] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [isSeedVarietyOpen, setIsSeedVarietyOpen] = useState(false);
  const [seedVarietyList, setSeedVarietyList] = useState([]);
  const [isSeedClassOpen, setIsSeedClassOpen] = useState(false);
  const [seedClass, setSeedClass] = useState("");
  const [planList, setPlanList] = useState([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedData, setSelectedData] = useState();
  const animationRefs = useRef(
    planList.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    fetchDropDownData();
  }, []);

  const SEED_CLASSES = ["NS", "BS", "FS", "CS", "TL"];

  const fetchCropsBySeason = async (selectedSeasonId) => {
    try {
      setLoading(true);
      const payloadDataForCropListMaster = {
        seasons: [selectedSeasonId],
      };
      const encryptedPayload = encryptWholeObject(payloadDataForCropListMaster);
      const cropListResp = await apiRequest(
        API_ROUTES.CROP_MASTER_DD,
        "POST",
        encryptedPayload
      );
      const decryptedCropListData = decryptAES(cropListResp);
      const parsedDecryptedCropListData = JSON.parse(decryptedCropListData);
      if (
        parsedDecryptedCropListData?.status === "SUCCESS" &&
        parsedDecryptedCropListData?.statusCode === "200"
      ) {
        setCropListData(parsedDecryptedCropListData?.data || []);
      } else {
        showErrorMessage("Unable to get the crop List Data");
        setCropListData([]);
      }
    } catch (error) {
      showErrorMessage(`Error fetching crops ${error}`);
      setCropListData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeedVarietiesByCrop = async (selectedCropId) => {
    try {
      setLoading(true);
      const payload = { cropId: selectedCropId };
      const encrypted = encryptWholeObject(payload);
      const resp = await apiRequest(
        API_ROUTES.SEED_VARIETY_MASTER,
        "POST",
        encrypted
      );
      const decrypted = decryptAES(resp);
      const parsed = JSON.parse(decrypted);
      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        setSeedVarietyList(parsed?.data || []);
      } else {
        showErrorMessage("Unable to get the Seed Variety list");
        setSeedVarietyList([]);
      }
    } catch (error) {
      showErrorMessage(`Error fetching Seed Variety ${error}`);
      setSeedVarietyList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropDownData = async () => {
    setLoading(true);
    const userdata = await getUserData();
    setUserData(userdata);
    await fetchPlanList(userdata);
    const fetchFinancialListData = await apiRequest(
      API_ROUTES.FINANCIAL_MASTER_DD,
      "POST"
    );
    const decrypted = decryptAES(fetchFinancialListData);
    const parsedDecrypted = JSON.parse(decrypted);
    if (
      parsedDecrypted?.status === "SUCCESS" &&
      parsedDecrypted?.statusCode === "200"
    ) {
      setFinancialYearData(parsedDecrypted?.data);
      const seasonListData = await apiRequest(
        API_ROUTES.SEASON_MASTER_DD,
        "POST"
      );
      const decryptedSeasonListData = decryptAES(seasonListData);
      const parsedDecryptedSeasonList = JSON.parse(decryptedSeasonListData);
      if (
        parsedDecryptedSeasonList?.status === "SUCCESS" &&
        parsedDecryptedSeasonList?.statusCode === "200"
      ) {
        setSeasonListData(parsedDecryptedSeasonList?.data);
      } else {
        showErrorMessage("Unable to fetch the Season List Data");
      }
    } else {
      showErrorMessage("Unable to fetch the Financila Year Data");
    }
  };

  const fetchPlanList = async (userData) => {
    setLoading(true);
    try {
      const payload = {
        aoId: userData?.aoId || null,
        blockId: userData?.blockId || null,
        chakId: userData?.chakId || null,
        cropId: cropId || null,
        farmId: userData?.farmId || null,
        finYear: financialYear || null,
        finYearId: financialYearId || null,
        page: 0,
        pageSize: 25,
        pcId: "",
        planType: userData?.unitType || null,
        roId: userData?.roId || null,
        seasonId: seasonId || null,
        toSeedClass: seedClass || null,
        toSeedStage: "",
      };
      const payloadData = encryptWholeObject(payload);
      const planListData = await apiRequest(
        API_ROUTES.PRODUCTION_PLAN,
        "POST",
        payloadData
      );
      const decryptedCropListData = decryptAES(planListData);
      const parsedDecryptedCropListData = JSON.parse(decryptedCropListData);
      if (
        parsedDecryptedCropListData?.status === "SUCCESS" &&
        parsedDecryptedCropListData?.statusCode === "200"
      ) {
        setPlanList(parsedDecryptedCropListData?.data);
      } else {
        showErrorMessage("Unable to fetch the Plan List Data");
      }
    } catch (error) {
      console.log("error", error);
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
          setSelectedData(item);
          setShowBottomSheet(true);
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
          <Text style={styles.programmeId}>{item.planId}</Text>
          <View style={styles.separator} />
          <View style={styles.cardRow}>
            <Text style={styles.label}>Programme</Text>
            <Text style={styles.valueText}>{item.programme}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Area (Hectare)</Text>
            <Text style={styles.valueText}>{item.area}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Raw Seed (In Kg.)</Text>
            <Text style={styles.valueText}>{item.rowSeed}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Good Seed (In Kg.)</Text>
            <Text style={styles.valueText}>{item.goodSeed}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.label}>Planting Material Required (Kg)</Text>
            <Text style={styles.valueText}>{item.requiredPlanting}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
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
        title={"Daily Progress Report"}
        rightIcon={
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.notificationHolder}
            onPress={() => setSearchActive(!searchActive)}
          >
            <Feather
              name="search"
              size={moderateScale(25)}
              color={Colors.black}
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
          {searchActive && (
            <View style={styles.filterCard}>
              {/* Financial Year Dropdown */}
              <View style={{ marginBottom: moderateScaleVertical(8) }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.input, styles.dropdownInput]}
                  onPress={() => setIsFyOpen(!isFyOpen)}
                >
                  <Text style={styles.dropdownText}>
                    {financialYear || "Financial Year"}
                  </Text>
                </TouchableOpacity>
                {isFyOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: moderateScale(200) }}>
                      {financialYearData.map((fy) => (
                        <TouchableOpacity
                          key={fy?.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setfinancialYear(fy?.finYearShortName);
                            setFinancialYearId(fy?.id);
                            setIsFyOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>
                            {fy?.finYearShortName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Season Dropdown */}
              <View style={{ marginBottom: moderateScaleVertical(8) }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.input, styles.dropdownInput]}
                  onPress={() => setIsSeasonOpen(!isSeasonOpen)}
                >
                  <Text style={styles.dropdownText}>{season || "Season"}</Text>
                </TouchableOpacity>
                {isSeasonOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: moderateScale(200) }}>
                      {seasonListData.map((s) => (
                        <TouchableOpacity
                          key={s?.id}
                          style={styles.dropdownItem}
                          // onPress={() => {
                          //   setSeason(s?.seasonType || s?.seasonShortName);
                          //   setSeasonId(s?.id);
                          //   setIsSeasonOpen(false);
                          // }}
                          onPress={async () => {
                            const label = s?.seasonType || s?.seasonShortName;
                            setSeason(label);
                            setSeasonId(s?.id);
                            setIsSeasonOpen(false);
                            setCrop(null);
                            setCropId(null);
                            setIsCropOpen(false);
                            if (s?.id) {
                              await fetchCropsBySeason(s?.id);
                            }
                          }}
                        >
                          <Text style={styles.dropdownItemText}>
                            {s?.seasonType || s?.seasonShortName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Crop Dropdown (dependent on Season) */}
              <View style={{ marginBottom: moderateScaleVertical(8) }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.input, styles.dropdownInput]}
                  onPress={() => {
                    if (cropListData?.length > 0) setIsCropOpen(!isCropOpen);
                    else showErrorMessage("Select a Season first");
                  }}
                >
                  <Text style={styles.dropdownText}>{crop || "Crop"}</Text>
                </TouchableOpacity>
                {isCropOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: moderateScale(200) }}>
                      {cropListData.map((c) => (
                        <TouchableOpacity
                          key={c?.id}
                          style={styles.dropdownItem}
                          onPress={async () => {
                            const label = c?.seedCropName;
                            setCrop(label);
                            setCropId(c?.id);
                            setIsCropOpen(false);
                            setSeedVariety("");
                            setIsSeedVarietyOpen(false);
                            await fetchSeedVarietiesByCrop(c?.id);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>
                            {c?.seedCropName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Seed Variety Dropdown (dependent on Crop) */}
              <View style={{ marginBottom: moderateScaleVertical(8) }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.input, styles.dropdownInput]}
                  onPress={() => {
                    if (seedVarietyList?.length > 0)
                      setIsSeedVarietyOpen(!isSeedVarietyOpen);
                    else showErrorMessage("Select a Crop first");
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {seedVariety || "Seed Variety"}
                  </Text>
                </TouchableOpacity>
                {isSeedVarietyOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: moderateScale(200) }}>
                      {seedVarietyList.map((sv) => (
                        <TouchableOpacity
                          key={sv?.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            const label = sv?.seedVarietyName;
                            setSeedVariety(label);
                            setIsSeedVarietyOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>
                            {sv?.seedVarietyName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Seed Class Dropdown (static) */}
              <View style={{ marginBottom: moderateScaleVertical(8) }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.input, styles.dropdownInput]}
                  onPress={() => setIsSeedClassOpen(!isSeedClassOpen)}
                >
                  <Text style={styles.dropdownText}>
                    {seedClass || "Seed Class"}
                  </Text>
                </TouchableOpacity>
                {isSeedClassOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: moderateScale(200) }}>
                      {SEED_CLASSES.map((cls) => (
                        <TouchableOpacity
                          key={cls}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSeedClass(cls);
                            setIsSeedClassOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cls}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.filterBtns}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => fetchPlanList(userData)}
                >
                  <Text style={styles.primaryBtnText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setfinancialYear(null);
                    setFinancialYearId(null);
                    setSeason(null);
                    setSeasonId(null);
                    setCrop(null);
                    setCropId(null);
                    setSeedVariety("");
                    setIsFyOpen(false);
                    setIsSeasonOpen(false);
                    setIsCropOpen(false);
                    setIsSeedVarietyOpen(false);
                    setCropListData([]);
                    setSeedVarietyList([]);
                    setSeedClass("");
                    setIsSeedClassOpen(false);
                    fetchPlanList(userData);
                  }}
                >
                  <Text style={styles.secondaryBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.exportRow}>
            <Text style={styles.headerText}>Production Plan</Text>
            {planList && (
              <TouchableOpacity
                style={styles.exportBtn}
                // onPress={() => downloadExcelFile()}
              >
                <Text style={styles.exportBtnText}>Export</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={planList}
            keyExtractor={(item) => item.id}
            renderItem={renderProgramme}
            scrollEnabled={false}
            ListEmptyComponent={renderEmpty}
          />
        </ScrollView>
        <CustomBottomSheet
          visible={showBottomSheet}
          onRequestClose={() => setShowBottomSheet(false)}
        >
          <Text style={styles.headerText}>Select the Action</Text>
          <CustomButton
            text={"Modify Request"}
            buttonStyle={styles.inspectionButtonView}
            textStyle={styles.buttonText2}
            handleAction={() => {
              navigation.navigate("ModifyPlan", {
                item: selectedData,
              });
              setShowBottomSheet(false);
            }}
          />
          <CustomButton
            text={"Assign to Block's"}
            buttonStyle={styles.intakeHistoryButtonView}
            textStyle={styles.buttonText}
            handleAction={() => {
              navigation.navigate("AssignPlan", { item: selectedData });
              setShowBottomSheet(false);
            }}
          />
        </CustomBottomSheet>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

export default DailyProgressReport;

const styles = StyleSheet.create({
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
  dropdownInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: Colors.black,
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsRegular,
  },
  dropdownList: {
    borderWidth: moderateScale(1),
    borderColor: Colors.lightBackground,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(5),
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: moderateScaleVertical(10),
    paddingHorizontal: moderateScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.lightBackground,
  },
  dropdownItemText: {
    color: Colors.textColor,
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsRegular,
    textTransform: "capitalize",
  },
  filterBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: moderateScale(10),
    marginTop: moderateScale(8),
  },
  primaryBtn: {
    backgroundColor: Colors.greenColor,
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(6),
  },
  primaryBtnText: {
    color: Colors.white,
    fontFamily: FontFamily.PoppinsMedium,
    fontSize: textScale(14),
  },
  secondaryBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(6),
    borderWidth: moderateScale(1.3),
    borderColor: Colors.greenColor,
  },
  secondaryBtnText: {
    color: Colors.greenColor,
    fontFamily: FontFamily.PoppinsMedium,
    fontSize: textScale(14),
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
    fontSize: textScale(14),
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
    fontFamily: FontFamily.RubikMedium,
    fontSize: textScale(14),
    marginBottom: moderateScaleVertical(5),
    color: Colors.greenThemeColor,
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
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    fontSize: textScale(14),
    textAlign: "left",
  },
  valueText: {
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(14),
    color: Colors.black,
    textAlign: "right",
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
});

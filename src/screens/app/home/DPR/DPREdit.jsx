import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import Colors from "../../../../utils/Colors";
import {
  moderateScale,
  textScale,
  moderateScaleVertical,
} from "../../../../utils/responsiveSize";
import FontFamily from "../../../../utils/FontFamily";
import CustomButton from "../../../../components/CustomButton";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { getUserData } from "../../../../utils/Storage";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../utils/HelperFunction";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";

const DPREdit = ({ route }) => {
  const { data } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [squareList, setSquareList] = useState([]);
  const [operationList, setOperationList] = useState([]);
  const [financialYearList, setFinancialYearList] = useState([]);
  const [seasonList, setSeasonList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [varietyList, setVarietyList] = useState([]);
  const [userData, setUserData] = useState([]);
  const [equipmentListData, setEquipmentListData] = useState([]);
  // Dropdown states
  const [showSquareDropdown, setShowSquareDropdown] = useState(false);
  const [showOperationDropdown, setShowOperationDropdown] = useState(false);
  const [showFinancialYearDropdown, setShowFinancialYearDropdown] =
    useState(false);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  const [showVarietyDropdown, setShowVarietyDropdown] = useState(false);
  const [showWorkTypeDropdown, setShowWorkTypeDropdown] = useState(false);
  const [showSeedClassDropdown, setShowSeedClassDropdown] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  const SEED_CLASSES = ["NS", "BS", "FS", "CS", "TL"];
  const WorkType = ["Contract", "Self"];

  useEffect(() => {
    fetchDropDownData();
  }, []);

  const fetchDropDownData = async () => {
    setLoading(true);
    try {
      const userData = await getUserData();
      setUserData(userData);

      await fetchAllDropdownData(userData, data);
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDropdownData = async (userData, formData) => {
    await fetchSquareList(userData);
    await fetchOperationList();
    await fetchFinancialYearList();
    await fetchSeasonList(formData);
    await fetchEquipmentList();
  };

  const fetchSquareList = async (userData) => {
    const payload = { chakId: userData?.chakId };
    const encryptedPayload = encryptWholeObject(payload);
    const response = await apiRequest(
      API_ROUTES.SQUARE_MASTER_DD,
      "POST",
      encryptedPayload
    );
    const decryptedData = decryptAES(response);
    const parsedData = JSON.parse(decryptedData);

    if (isSuccessResponse(parsedData)) {
      setSquareList(parsedData?.data || []);
    } else {
      showErrorMessage("Unable to get the Square List Data");
      throw new Error("Square list fetch failed");
    }
  };

  const fetchOperationList = async () => {
    const payload = {};
    const encryptedPayload = encryptWholeObject(payload);
    const response = await apiRequest(
      API_ROUTES.OPERATION_MASTER_DD,
      "POST",
      encryptedPayload
    );
    const decryptedData = decryptAES(response);
    const parsedData = JSON.parse(decryptedData);

    if (isSuccessResponse(parsedData)) {
      setOperationList(parsedData?.data || []);
    } else {
      showErrorMessage("Unable to get the Operation List Data");
      throw new Error("Operation list fetch failed");
    }
  };

  const fetchFinancialYearList = async () => {
    const response = await apiRequest(API_ROUTES.FINANCIAL_MASTER_DD, "POST");
    const decryptedData = decryptAES(response);
    const parsedData = JSON.parse(decryptedData);

    if (isSuccessResponse(parsedData)) {
      setFinancialYearList(parsedData?.data || []);
    } else {
      showErrorMessage("Unable to find the Financial Year List Data");
      throw new Error("Financial year list fetch failed");
    }
  };

  const fetchSeasonList = async (formData) => {
    const response = await apiRequest(API_ROUTES.SEASON_MASTER_DD, "POST");
    const decryptedData = decryptAES(response);
    const parsedData = JSON.parse(decryptedData);

    if (isSuccessResponse(parsedData)) {
      setSeasonList(parsedData?.data || []);

      // Fetch dependent data
      if (formData.seasonId) {
        await fetchCropsBySeason(formData.seasonId);
      }
      if (formData.cropId) {
        await fetchSeedVarietiesByCrop(formData.cropId);
      }
    } else {
      showErrorMessage("Unable to fetch the Season List Data");
      throw new Error("Season list fetch failed");
    }
  };

  const fetchEquipmentList = async () => {
    const payload = {};
    const encryptedPayload = encryptWholeObject(payload);
    const response = await apiRequest(
      API_ROUTES.MACHINE_MASTER_DD,
      "POST",
      encryptedPayload
    );
    const decryptedData = decryptAES(response);
    const parsedData = JSON.parse(decryptedData);

    if (isSuccessResponse(parsedData)) {
      setEquipmentListData(parsedData?.data || []);
    } else {
      showErrorMessage("Unable to get the Equipment Data List");
      setEquipmentListData([]);
    }
  };

  const isSuccessResponse = (response) => {
    return response?.status === "SUCCESS" && response?.statusCode === "200";
  };

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
        setCropList(parsedDecryptedCropListData?.data || []);
      } else {
        showErrorMessage("Unable to get the crop List Data");
      }
    } catch (error) {
      showErrorMessage(`Error fetching crops ${error?.message}`);
      setCropList([]);
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
        setVarietyList(parsed?.data || []);
      } else {
        showErrorMessage("Unable to get the Seed Variety list");
        setVarietyList([]);
      }
    } catch (error) {
      showErrorMessage(`Error fetching Seed Variety ${error?.message}`);
      setVarietyList([]);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    workType: data.workType || "",
    seedClass: data.fromSeedClass || "",
    square: data.squareName || "",
    squareId: data.squareId || "",
    operation: data.operationName || "",
    operationId: data.operationId || "",
    financialYear: data.finYear || "",
    financialYearId: data.finYearId || "",
    season: data.season || "",
    seasonId: data.seasonId || "",
    crop: data.crop || "",
    cropId: data.cropId || "",
    variety: data.seedVariety || "",
    varietyId: data.seedVarietyId || "",
    requiredOutput: data.requiredOutputArea?.toString() || "",
    requiredDate: data.reportDate || "",
    equipment: data.equipment || false,
    equipmentList: data.dprMechanicals || [],
  });

  const [newEquipment, setNewEquipment] = useState({
    equipment: "",
    equipmentId: "",
    estimatedHours: "",
    operatorRequired: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEquipmentChange = (field, value) => {
    setNewEquipment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDropdownSelect = (type, item) => {
    switch (type) {
      case "workType":
        handleInputChange("workType", item);
        setShowWorkTypeDropdown(false);
        break;
      case "seedClass":
        handleInputChange("seedClass", item);
        setShowSeedClassDropdown(false);
        break;
      case "square":
        handleInputChange("square", item.squareName);
        handleInputChange("squareId", item.id);
        setShowSquareDropdown(false);
        break;
      case "operation":
        handleInputChange("operation", item.operationName);
        handleInputChange("operationId", item.id);
        setShowOperationDropdown(false);
        break;
      case "financialYear":
        handleInputChange("financialYear", item.finYearShortName);
        handleInputChange("financialYearId", item.id);
        setShowFinancialYearDropdown(false);
        break;
      case "season":
        handleInputChange("season", item.seasonType);
        handleInputChange("seasonId", item.id);
        setShowSeasonDropdown(false);
        fetchCropsBySeason(item.id);
        break;
      case "crop":
        handleInputChange("crop", item.seedCropName);
        handleInputChange("cropId", item.id);
        setShowCropDropdown(false);
        fetchSeedVarietiesByCrop(item.id);
        break;
      case "variety":
        handleInputChange("variety", item.seedVarietyName);
        handleInputChange("varietyId", item.id);
        setShowVarietyDropdown(false);
        break;
      case "equipment":
        handleEquipmentChange("equipment", item.macName);
        handleEquipmentChange("equipmentId", item.id);
        setShowEquipmentDropdown(false);
        break;
    }
  };

  const addEquipment = () => {
    if (newEquipment.equipment && newEquipment.estimatedHours) {
      setFormData((prev) => ({
        ...prev,
        equipmentList: [
          ...prev.equipmentList,
          {
            id: Date.now(),
            equipmentName: newEquipment.equipment,
            equipmentId: newEquipment.equipmentId,
            estimatedHours: Number.parseInt(newEquipment.estimatedHours),
            operator: newEquipment.operatorRequired,
            operatorName: "",
          },
        ],
      }));
      setNewEquipment({
        equipment: "",
        equipmentId: "",
        estimatedHours: "",
        operatorRequired: false,
      });
    } else {
      Alert.alert("Error", "Please fill all equipment fields");
    }
  };

  const removeEquipment = (id) => {
    setFormData((prev) => ({
      ...prev,
      equipmentList: prev.equipmentList.filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payloadData = {
        blockId: data?.blockId,
        blockName: data?.blockName,
        createdBy: data?.createdBy,
        createdOn: data?.createdOn,
        crop: formData?.crop,
        cropId: formData?.cropId,
        date: data?.reportDate,
        dprAgricultures: data?.dprAgricultures,
        dprLabour: data?.dprLabour,
        dprStatus: data?.dprStatus,
        equipment: data?.equipment,
        dprMechanicals: formData?.equipmentList,
        finYear: formData?.financialYear,
        finYearId: formData?.financialYearId,
        fromSeedClass: formData?.seedClass,
        fromSeedStage: data?.fromSeedStage,
        id: data?.id,
        operationId: data?.operationId,
        operationName: data?.operationName,
        planId: data?.planId,
        reportDate: data?.reportDate,
        requiredOutputArea: formData?.requiredOutput,
        season: formData?.season,
        seasonId: formData?.seasonId,
        seedVariety: formData?.variety,
        seedVarietyId: formData?.varietyId,
        squareId: formData?.squareId,
        squareName: formData?.square,
        status: formData?.status,
        subUnitId: data?.subUnitId,
        subUnitName: data?.subUnitName,
        toSeedClass: data?.toSeedClass,
        toSeedStage: data?.toSeedStage,
        unitId:
          userData?.unitType === "CHAK" ? userData?.chakId : userData?.blockId,
        unitType: userData?.unitType,
        workType: formData?.workType,
        workflows: data?.workflows,
        workingHours: data?.workingHours,
      };
      const encrypted = encryptWholeObject(payloadData);
      const resp = await apiRequest(
        API_ROUTES.DP_REPORT_UPDATE,
        "POST",
        encrypted
      );
      const decrypted = decryptAES(resp);
      const parsed = JSON.parse(decrypted);
      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        showSuccessMessage(parsed?.message);
        navigation.goBack();
      }
    } catch (error) {
      console.log(error?.message, "Error in catch Block");
      showErrorMessage(error?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getDisplayTextByType = (item, type) => {
    if (!item || !type) return item || "";

    const propertyMap = {
      square: "squareName",
      operation: "operationName",
      financialYear: "finYearShortName",
      season: "seasonType",
      crop: "seedCropName",
      variety: "seedVarietyName",
      equipment: "macName",
    };

    const property = propertyMap[type];
    return property ? item[property] : item;
  };

  const renderDropdownItem = ({ item, type }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleDropdownSelect(type, item)}
    >
      <Text style={styles.dropdownItemText}>
        {getDisplayTextByType(item, type)}
      </Text>
    </TouchableOpacity>
  );

  const renderDropdown = (
    type,
    data,
    isVisible,
    setVisible,
    placeholder,
    value
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{placeholder}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(!isVisible)}
      >
        <Text
          style={
            value ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder
          }
        >
          {value || `Select ${placeholder}`}
        </Text>
        <Icon name="arrow-drop-down" size={24} color={Colors.grey} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => renderDropdownItem({ item, type })}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={"Edit DPR Details"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={moderateScaleVertical(
          Platform.OS === "ios" ? 90 : 10
        )}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.row}>
              {renderDropdown(
                "workType",
                WorkType,
                showWorkTypeDropdown,
                setShowWorkTypeDropdown,
                "Work Type",
                formData.workType
              )}

              {renderDropdown(
                "seedClass",
                SEED_CLASSES,
                showSeedClassDropdown,
                setShowSeedClassDropdown,
                "Seed Class",
                formData.seedClass
              )}
            </View>

            <View style={styles.row}>
              {renderDropdown(
                "square",
                squareList,
                showSquareDropdown,
                setShowSquareDropdown,
                "Square",
                formData.square
              )}

              {renderDropdown(
                "operation",
                operationList,
                showOperationDropdown,
                setShowOperationDropdown,
                "Operation",
                formData.operation
              )}
            </View>

            <View style={styles.row}>
              {renderDropdown(
                "financialYear",
                financialYearList,
                showFinancialYearDropdown,
                setShowFinancialYearDropdown,
                "Financial Year",
                formData.financialYear
              )}

              {renderDropdown(
                "season",
                seasonList,
                showSeasonDropdown,
                setShowSeasonDropdown,
                "Season",
                formData.season
              )}
            </View>

            <View style={styles.row}>
              {renderDropdown(
                "crop",
                cropList,
                showCropDropdown,
                setShowCropDropdown,
                "Crop",
                formData.crop
              )}

              {renderDropdown(
                "variety",
                varietyList,
                showVarietyDropdown,
                setShowVarietyDropdown,
                "Seed Variety",
                formData.variety
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.fullWidth]}>
                <Text style={styles.label}>Required Output (ha)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.requiredOutput}
                  onChangeText={(text) =>
                    handleInputChange("requiredOutput", text)
                  }
                  keyboardType="numeric"
                  placeholder="Enter required output"
                  placeholderTextColor={Colors.grey}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.fullWidth]}>
                <Text style={styles.label}>Required Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.requiredDate}
                  onChangeText={(text) =>
                    handleInputChange("requiredDate", text)
                  }
                  placeholder="dd/mm/yyyy"
                  placeholderTextColor={Colors.grey}
                />
              </View>
            </View>
          </View>

          {/* Equipment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Equipment</Text>

            <View style={styles.equipmentToggle}>
              <Text style={styles.label}>Equipment Required</Text>
              <Switch
                value={formData.equipment}
                onValueChange={(value) => handleInputChange("equipment", value)}
                trackColor={{ false: Colors.grey, true: Colors.greenColor }}
                thumbColor={Colors.white}
              />
            </View>

            {formData.equipment && (
              <>
                {/* Add New Equipment Form */}
                <View style={styles.addEquipmentCard}>
                  <Text style={styles.subSectionTitle}>Add Equipment</Text>

                  {/* Equipment Dropdown */}
                  {renderDropdown(
                    "equipment",
                    equipmentListData,
                    showEquipmentDropdown,
                    setShowEquipmentDropdown,
                    "Equipment",
                    newEquipment.equipment
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Estimated Hours</Text>
                    <TextInput
                      style={styles.input}
                      value={newEquipment.estimatedHours}
                      onChangeText={(text) =>
                        handleEquipmentChange("estimatedHours", text)
                      }
                      keyboardType="numeric"
                      placeholder="Enter estimated hours"
                      placeholderTextColor={Colors.grey}
                    />
                  </View>

                  <View style={styles.operatorToggle}>
                    <Text style={styles.label}>Operator Required</Text>
                    <Switch
                      value={newEquipment.operatorRequired}
                      onValueChange={(value) =>
                        handleEquipmentChange("operatorRequired", value)
                      }
                      trackColor={{
                        false: Colors.grey,
                        true: Colors.greenColor,
                      }}
                      thumbColor={Colors.white}
                    />
                  </View>

                  <CustomButton
                    text={"Add Equipment"}
                    buttonStyle={styles.addButton}
                    handleAction={addEquipment}
                    textStyle={styles.addButtonText}
                  />
                </View>

                {/* Equipment List */}
                {formData.equipmentList.length > 0 && (
                  <View style={styles.equipmentList}>
                    <Text style={styles.subSectionTitle}>Added Equipment</Text>
                    {formData.equipmentList.map((item, index) => (
                      <View key={item.id || index} style={styles.equipmentItem}>
                        <View style={styles.equipmentInfo}>
                          <Text style={styles.equipmentName}>
                            {item.equipmentName}
                          </Text>
                          <Text style={styles.equipmentHours}>
                            {item.estimatedHours} hours
                          </Text>
                          <Text style={styles.operatorText}>
                            Operator:{" "}
                            {item.operator ? "Required" : "Not Required"}
                          </Text>
                          {item.operatorName && (
                            <Text style={styles.operatorName}>
                              Operator: {item.operatorName}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeEquipment(item.id)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <CustomButton
              text={"Cancel"}
              buttonStyle={styles.cancelButton}
              textStyle={styles.cancelButtonText}
              handleAction={handleCancel}
            />
            <CustomButton
              text={"Save"}
              buttonStyle={styles.saveButton}
              textStyle={styles.saveButtonText}
              handleAction={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

DPREdit.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      data: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

export default DPREdit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: moderateScale(20),
  },
  section: {
    marginBottom: moderateScaleVertical(24),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: textScale(16),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(16),
    borderLeftWidth: moderateScale(3),
    paddingLeft: moderateScale(10),
    borderColor: Colors.primary,
  },
  subSectionTitle: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    marginBottom: moderateScaleVertical(12),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(12),
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: moderateScale(4),
    gap: moderateScaleVertical(5),
    marginBottom: moderateScale(10),
  },
  fullWidth: {
    flex: 1,
    marginHorizontal: 0,
  },
  label: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    marginBottom: moderateScaleVertical(4),
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    fontSize: textScale(14),
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    backgroundColor: Colors.white,
  },
  dropdownButtonText: {
    fontSize: textScale(14),
    color: Colors.black,
  },
  dropdownButtonPlaceholder: {
    fontSize: textScale(14),
    color: Colors.grey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
  },
  dropdownList: {
    maxHeight: moderateScaleVertical(300),
  },
  dropdownItem: {
    padding: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  dropdownItemText: {
    fontSize: textScale(14),
    color: Colors.black,
    fontFamily: FontFamily.PoppinsRegular,
  },
  equipmentToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(12),
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(6),
    marginBottom: moderateScaleVertical(16),
  },
  operatorToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(12),
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(6),
    marginBottom: moderateScaleVertical(16),
  },
  addEquipmentCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(16),
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  addButton: {
    backgroundColor: Colors.greenColor,
    padding: moderateScale(12),
    borderRadius: moderateScale(6),
    alignItems: "center",
  },
  addButtonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsRegular,
  },
  equipmentList: {
    marginBottom: moderateScaleVertical(16),
  },
  equipmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(8),
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.black,
    marginBottom: moderateScaleVertical(4),
  },
  equipmentHours: {
    fontSize: textScale(12),
    color: Colors.textColor,
    fontFamily: FontFamily.PoppinsRegular,
    marginBottom: moderateScaleVertical(2),
  },
  operatorText: {
    fontSize: textScale(12),
    color: Colors.textColor,
    fontFamily: FontFamily.PoppinsRegular,
  },
  operatorName: {
    fontSize: textScale(12),
    color: Colors.primary,
    fontFamily: FontFamily.PoppinsRegular,
    marginTop: moderateScaleVertical(4),
  },
  removeButton: {
    padding: moderateScale(8),
  },
  removeButtonText: {
    fontSize: textScale(20),
    color: Colors.error,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: moderateScaleVertical(16),
  },
  cancelButton: {
    backgroundColor: Colors.white,
    width: "48%",
    borderRadius: moderateScale(8),
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray,
    padding: moderateScale(12),
  },
  cancelButtonText: {
    color: Colors.textColor,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
  },
  saveButton: {
    backgroundColor: Colors.greenColor,
    width: "48%",
    borderRadius: moderateScale(8),
    alignItems: "center",
    padding: moderateScale(12),
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
  },
  buttonStyle: {
    backgroundColor: Colors.greenColor,
    height: moderateScale(50),
    width: "95%",
    alignSelf: "center",
    marginTop: moderateScaleVertical(16),
  },
});

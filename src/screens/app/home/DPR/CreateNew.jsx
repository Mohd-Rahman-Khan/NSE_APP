import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  FlatList,
  Switch,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../../utils/responsiveSize";
import FontFamily from "../../../../utils/FontFamily";
import Colors from "../../../../utils/Colors";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import CustomButton from "../../../../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { getUserData } from "../../../../utils/Storage";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../utils/HelperFunction";

const CreateNew = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [step, setStep] = useState(0);
  const [iosVisible, setIosVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Dropdown states
  const [squareList, setSquareList] = useState([]);
  const [operationList, setOperationList] = useState([]);
  const [financialYearList, setFinancialYearList] = useState([]);
  const [seasonList, setSeasonList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [varietyList, setVarietyList] = useState([]);
  const [userData, setUserData] = useState([]);
  const [equipmentListData, setEquipmentListData] = useState([]);

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
  const [parentEntries, setParentEntries] = useState([
    {
      id: 1,
      isExpanded: true,
      formData: {
        workType: "",
        seedClass: "",
        square: "",
        squareId: "",
        operation: "",
        operationId: "",
        financialYear: "",
        financialYearId: "",
        season: "",
        seasonId: "",
        crop: "",
        cropId: "",
        variety: "",
        varietyId: "",
        requiredOutput: "",
        requiredDate: "",
        equipment: false,
        equipmentList: [],
      },
      newEquipment: {
        equipment: "",
        equipmentId: "",
        estimatedHours: "",
        operatorRequired: false,
      },
    },
  ]);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openCalendar = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: tempDate,
        mode: "date",
        onChange: (_e, d) => {
          if (d) {
            setTempDate(d);
            setSelectedDate(formatDate(d));
          }
        },
        is24Hour: true,
      });
    } else {
      setIosVisible(true);
    }
  };

  useEffect(() => {
    if (step === 1) {
      // Set the selected date from step 0 to all parent entries
      setParentEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          formData: {
            ...entry.formData,
            requiredDate: selectedDate,
          },
        }))
      );
      fetchDropDownData();
    }
  }, [step]);

  const fetchDropDownData = async () => {
    setLoading(true);
    try {
      const userData = await getUserData();
      setUserData(userData);
      const payload = {
        chakId: userData?.chakId,
      };
      const encryptedPayload = encryptWholeObject(payload);
      const squareListResp = await apiRequest(
        API_ROUTES.SQUARE_MASTER_DD,
        "POST",
        encryptedPayload
      );
      const decryptedSquareListData = decryptAES(squareListResp);
      const parsedDecryptedSquareListData = JSON.parse(decryptedSquareListData);
      if (
        parsedDecryptedSquareListData?.status === "SUCCESS" &&
        parsedDecryptedSquareListData?.statusCode === "200"
      ) {
        setSquareList(parsedDecryptedSquareListData?.data || []);

        const operationPayloadData = {};
        const encryptedOperationPayload =
          encryptWholeObject(operationPayloadData);
        const operationListResponse = await apiRequest(
          API_ROUTES.OPERATION_MASTER_DD,
          "POST",
          encryptedOperationPayload
        );
        const decryptedOperationListData = decryptAES(operationListResponse);
        const parsedDecryptedOperationListData = JSON.parse(
          decryptedOperationListData
        );
        if (
          parsedDecryptedOperationListData?.status === "SUCCESS" &&
          parsedDecryptedOperationListData?.statusCode === "200"
        ) {
          setOperationList(parsedDecryptedOperationListData?.data || []);

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
            setFinancialYearList(parsedDecrypted?.data || []);

            const seasonListData = await apiRequest(
              API_ROUTES.SEASON_MASTER_DD,
              "POST"
            );
            const decryptedSeasonListData = decryptAES(seasonListData);
            const parsedDecryptedSeasonList = JSON.parse(
              decryptedSeasonListData
            );
            if (
              parsedDecryptedSeasonList?.status === "SUCCESS" &&
              parsedDecryptedSeasonList?.statusCode === "200"
            ) {
              setSeasonList(parsedDecryptedSeasonList?.data || []);

              const payloadForMachineList = {};
              const encryptedPayloadForEquipmentList = encryptWholeObject(
                payloadForMachineList
              );
              const equipmentListData = await apiRequest(
                API_ROUTES.MACHINE_MASTER_DD,
                "POST",
                encryptedPayloadForEquipmentList
              );
              const decryptedEquipmentListData = decryptAES(equipmentListData);
              const parsedDecryptedEquipmentListData = JSON.parse(
                decryptedEquipmentListData
              );
              if (
                parsedDecryptedEquipmentListData?.status === "SUCCESS" &&
                parsedDecryptedEquipmentListData?.statusCode === "200"
              ) {
                setEquipmentListData(parsedDecryptedEquipmentListData?.data);
              } else {
                showErrorMessage("Unable to get the Equipment Data List");
                setEquipmentListData([]);
              }
            } else {
              showErrorMessage("Unable to fetch the Season List Data");
            }
          } else {
            showErrorMessage("Unable to find the Financial Year List Data");
          }
        } else {
          showErrorMessage("Unable to get the Operation List Data");
        }
      } else {
        showErrorMessage("Unable to get the Square List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
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
      showErrorMessage(`Error fetching crops ${error.message}`);
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

  const handleInputChange = (parentId, field, value) => {
    setParentEntries((prev) =>
      prev.map((entry) =>
        entry.id === parentId
          ? {
              ...entry,
              formData: {
                ...entry.formData,
                [field]: value,
              },
            }
          : entry
      )
    );
  };

  const handleEquipmentChange = (parentId, field, value) => {
    setParentEntries((prev) =>
      prev.map((entry) =>
        entry.id === parentId
          ? {
              ...entry,
              newEquipment: {
                ...entry.newEquipment,
                [field]: value,
              },
            }
          : entry
      )
    );
  };

  const handleDropdownSelect = (parentId, type, item) => {
    switch (type) {
      case "workType":
        handleInputChange(parentId, "workType", item);
        setShowWorkTypeDropdown(false);
        break;
      case "seedClass":
        handleInputChange(parentId, "seedClass", item);
        setShowSeedClassDropdown(false);
        break;
      case "square":
        handleInputChange(parentId, "square", item.squareName);
        handleInputChange(parentId, "squareId", item.id);
        setShowSquareDropdown(false);
        break;
      case "operation":
        handleInputChange(parentId, "operation", item.operationName);
        handleInputChange(parentId, "operationId", item.id);
        setShowOperationDropdown(false);
        break;
      case "financialYear":
        handleInputChange(parentId, "financialYear", item.finYearShortName);
        handleInputChange(parentId, "financialYearId", item.id);
        setShowFinancialYearDropdown(false);
        break;
      case "season":
        handleInputChange(parentId, "season", item.seasonType);
        handleInputChange(parentId, "seasonId", item.id);
        setShowSeasonDropdown(false);
        fetchCropsBySeason(item.id);
        break;
      case "crop":
        handleInputChange(parentId, "crop", item.seedCropName);
        handleInputChange(parentId, "cropId", item.id);
        setShowCropDropdown(false);
        fetchSeedVarietiesByCrop(item.id);
        break;
      case "variety":
        handleInputChange(parentId, "variety", item.seedVarietyName);
        handleInputChange(parentId, "varietyId", item.id);
        setShowVarietyDropdown(false);
        break;
      case "equipment":
        handleEquipmentChange(parentId, "equipment", item.macName);
        handleEquipmentChange(parentId, "equipmentId", item.id);
        setShowEquipmentDropdown(false);
        break;
    }
  };

  const addEquipment = (parentId) => {
    setParentEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === parentId) {
          const { newEquipment: currentEquipment, formData } = entry;
          if (currentEquipment.equipment && currentEquipment.estimatedHours) {
            return {
              ...entry,
              formData: {
                ...formData,
                equipmentList: [
                  ...formData.equipmentList,
                  {
                    id: Date.now(),
                    equipmentName: currentEquipment.equipment,
                    equipmentId: currentEquipment.equipmentId,
                    estimatedHours: Number.parseInt(
                      currentEquipment.estimatedHours
                    ),
                    operator: currentEquipment.operatorRequired,
                    operatorName: "",
                  },
                ],
              },
              newEquipment: {
                equipment: "",
                equipmentId: "",
                estimatedHours: "",
                operatorRequired: false,
              },
            };
          } else {
            Alert.alert("Error", "Please fill all equipment fields");
            return entry;
          }
        }
        return entry;
      })
    );
  };

  const removeEquipment = (parentId, equipmentId) => {
    setParentEntries((prev) =>
      prev.map((entry) =>
        entry.id === parentId
          ? {
              ...entry,
              formData: {
                ...entry.formData,
                equipmentList: entry.formData.equipmentList.filter(
                  (item) => item.id !== equipmentId
                ),
              },
            }
          : entry
      )
    );
  };

  const addNewParent = () => {
    const newId = Math.max(...parentEntries.map((entry) => entry.id), 0) + 1;
    setParentEntries((prev) => [
      ...prev.map((entry) => ({ ...entry, isExpanded: false })),
      {
        id: newId,
        isExpanded: true,
        formData: {
          workType: "",
          seedClass: "",
          square: "",
          squareId: "",
          operation: "",
          operationId: "",
          financialYear: "",
          financialYearId: "",
          season: "",
          seasonId: "",
          crop: "",
          cropId: "",
          variety: "",
          varietyId: "",
          requiredOutput: "",
          requiredDate: selectedDate,
          equipment: false,
          equipmentList: [],
        },
        newEquipment: {
          equipment: "",
          equipmentId: "",
          estimatedHours: "",
          operatorRequired: false,
        },
      },
    ]);
  };

  const toggleParent = (parentId) => {
    setParentEntries((prev) =>
      prev.map((entry) =>
        entry.id === parentId
          ? { ...entry, isExpanded: !entry.isExpanded }
          : entry
      )
    );
  };

  const removeParent = (parentId) => {
    if (parentEntries.length === 1) {
      Alert.alert("Cannot Remove", "At least one entry is required");
      return;
    }
    setParentEntries((prev) => prev.filter((entry) => entry.id !== parentId));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!validateAllEntries()) {
        return;
      }

      const payloads = preparePayloads();
      await submitDPRData(payloads);
    } catch (error) {
      console.error("Error creating DPR:", error);
      showErrorMessage("Error creating DPR. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateAllEntries = () => {
    const validations = [
      {
        field: "requiredDate",
        message: "Please select a date for all entries",
      },
      { field: "workType", message: "Please select work type for all entries" },
      {
        field: "seedClass",
        message: "Please select seed class for all entries",
      },
      { field: "squareId", message: "Please select square for all entries" },
      {
        field: "operationId",
        message: "Please select operation for all entries",
      },
      {
        field: "financialYearId",
        message: "Please select financial year for all entries",
      },
      { field: "seasonId", message: "Please select season for all entries" },
      { field: "cropId", message: "Please select crop for all entries" },
      {
        field: "varietyId",
        message: "Please select seed variety for all entries",
      },
      {
        field: "requiredOutput",
        message: "Please enter required output for all entries",
      },
    ];

    for (const entry of parentEntries) {
      const { formData } = entry;

      for (const validation of validations) {
        if (!formData[validation.field]) {
          showErrorMessage(validation.message);
          return false;
        }
      }
    }

    return true;
  };

  // Payload preparation
  const preparePayloads = () => {
    return parentEntries.map((entry) => {
      const { formData } = entry;
      return {
        blockId: userData?.blockId || "",
        blockName: userData?.blockName || "",
        class: formData.seedClass,
        crop: formData.crop,
        cropId: formData.cropId,
        date: formatDateForAPI(formData.requiredDate),
        dprMechanicals: formData.equipmentList.map(prepareEquipmentData),
        equipment: formData.equipment ? 1 : 0,
        finYear: formData.financialYear,
        finYearId: formData.financialYearId,
        financialYear: formData.financialYear,
        fromSeedClass: formData.seedClass,
        operation: formData.operation,
        operationId: formData.operationId,
        operationName: formData.operation,
        output: formData.requiredOutput,
        reportDate: formatDateForAPI(formData.requiredDate),
        requiredOutputArea: formData.requiredOutput,
        season: formData.season,
        seasonId: formData.seasonId,
        seedVariety: formData.variety,
        seedVarietyId: formData.varietyId,
        square: formData.square,
        squareId: formData.squareId,
        squareName: formData.square,
        stage: "",
        unitId: getUserUnitId(),
        unitType: userData?.unitType,
        workType: formData.workType.toLowerCase(),
      };
    });
  };

  const prepareEquipmentData = (item) => ({
    equipmentId: item.equipmentId,
    equipmentName: item.equipmentName,
    estimatedHours: item.estimatedHours,
    operator: item.operator,
    operatorName: item.operatorName || "",
  });

  const getUserUnitId = () => {
    return userData?.unitType === "CHAK" ? userData?.chakId : userData?.blockId;
  };

  // API submission
  const submitDPRData = async (payloads) => {
    const encryptedPayload = encryptWholeObject(payloads);
    const response = await apiRequest(
      API_ROUTES.DP_REPORT_SAVE,
      "POST",
      encryptedPayload
    );

    const decryptedResponse = decryptAES(response);
    const parsedResponse = JSON.parse(decryptedResponse);

    handleApiResponse(parsedResponse);
  };

  const handleApiResponse = (response) => {
    if (response?.status === "SUCCESS" && response?.statusCode === "200") {
      showSuccessMessage(`${response?.message} `);
      navigation.goBack();
    } else if (
      response?.status === "FAILED" &&
      response?.statusCode === "300"
    ) {
      showErrorMessage(`${response?.message} `);
    } else {
      showErrorMessage("Error in filling form");
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    try {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getDropdownItemText = (item, type) => {
    const textMap = {
      square: item.squareName,
      operation: item.operationName,
      financialYear: item.finYearShortName,
      season: item.seasonType,
      crop: item.seedCropName,
      variety: item.seedVarietyName,
      equipment: item.macName,
    };

    return textMap[type] || item;
  };

  const renderDropdownItem = ({ item, type, parentId }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleDropdownSelect(parentId, type, item)}
    >
      <Text style={styles.dropdownItemText}>
        {getDropdownItemText(item, type)}
      </Text>
    </TouchableOpacity>
  );

  const renderDropdown = (
    parentId,
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
          style={[
            styles.dropdownButtonText,
            !value && styles.dropdownButtonPlaceholder,
            { flex: 1, marginRight: 8 },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
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
              renderItem={({ item }) =>
                renderDropdownItem({ item, type, parentId })
              }
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  const renderParentEntry = (entry) => (
    <View key={entry.id} style={styles.parentContainer}>
      <TouchableOpacity
        style={styles.parentHeader}
        onPress={() => toggleParent(entry.id)}
      >
        <Text style={styles.parentTitle}>
          Entry #{parentEntries.findIndex((e) => e.id === entry.id) + 1}
        </Text>
        <View style={styles.headerActions}>
          {parentEntries.length > 1 && (
            <TouchableOpacity
              onPress={() => removeParent(entry.id)}
              style={styles.removeParentButton}
            >
              <Icon name="delete" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
          <Icon
            name={
              entry.isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"
            }
            size={24}
            color={Colors.grey}
          />
        </View>
      </TouchableOpacity>

      {entry.isExpanded && (
        <View style={styles.parentContent}>
          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.row}>
              {renderDropdown(
                entry.id,
                "workType",
                WorkType,
                showWorkTypeDropdown,
                setShowWorkTypeDropdown,
                "Work Type",
                entry.formData.workType
              )}

              {renderDropdown(
                entry.id,
                "seedClass",
                SEED_CLASSES,
                showSeedClassDropdown,
                setShowSeedClassDropdown,
                "Seed Class",
                entry.formData.seedClass
              )}
            </View>

            <View style={styles.row}>
              {renderDropdown(
                entry.id,
                "square",
                squareList,
                showSquareDropdown,
                setShowSquareDropdown,
                "Square",
                entry.formData.square
              )}

              {renderDropdown(
                entry.id,
                "operation",
                operationList,
                showOperationDropdown,
                setShowOperationDropdown,
                "Operation",
                entry.formData.operation
              )}
            </View>

            <View style={styles.row}>
              {renderDropdown(
                entry.id,
                "financialYear",
                financialYearList,
                showFinancialYearDropdown,
                setShowFinancialYearDropdown,
                "Financial Year",
                entry.formData.financialYear
              )}

              {renderDropdown(
                entry.id,
                "season",
                seasonList,
                showSeasonDropdown,
                setShowSeasonDropdown,
                "Season",
                entry.formData.season
              )}
            </View>

            <View style={styles.row}>
              {renderDropdown(
                entry.id,
                "crop",
                cropList,
                showCropDropdown,
                setShowCropDropdown,
                "Crop",
                entry.formData.crop
              )}

              {renderDropdown(
                entry.id,
                "variety",
                varietyList,
                showVarietyDropdown,
                setShowVarietyDropdown,
                "Seed Variety",
                entry.formData.variety
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Required Output (ha)</Text>
                <TextInput
                  style={styles.input}
                  value={entry.formData.requiredOutput}
                  onChangeText={(text) =>
                    handleInputChange(entry.id, "requiredOutput", text)
                  }
                  keyboardType="numeric"
                  placeholder="Enter required output"
                  placeholderTextColor={Colors.grey}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Required Date</Text>
                <TextInput
                  style={styles.input}
                  value={entry.formData.requiredDate}
                  editable={false}
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
                value={entry.formData.equipment}
                onValueChange={(value) =>
                  handleInputChange(entry.id, "equipment", value)
                }
                trackColor={{ false: Colors.grey, true: Colors.greenColor }}
                thumbColor={Colors.white}
              />
            </View>

            {entry.formData.equipment && (
              <>
                {/* Add New Equipment Form */}
                <View style={styles.addEquipmentCard}>
                  <Text style={styles.subSectionTitle}>Add Equipment</Text>

                  {/* Equipment Dropdown */}
                  {renderDropdown(
                    entry.id,
                    "equipment",
                    equipmentListData,
                    showEquipmentDropdown,
                    setShowEquipmentDropdown,
                    "Equipment",
                    entry.newEquipment.equipment
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Estimated Hours</Text>
                    <TextInput
                      style={styles.input}
                      value={entry.newEquipment.estimatedHours}
                      onChangeText={(text) =>
                        handleEquipmentChange(entry.id, "estimatedHours", text)
                      }
                      keyboardType="numeric"
                      placeholder="Enter estimated hours"
                      placeholderTextColor={Colors.grey}
                    />
                  </View>

                  <View style={styles.operatorToggle}>
                    <Text style={styles.label}>Operator Required</Text>
                    <Switch
                      value={entry.newEquipment.operatorRequired}
                      onValueChange={(value) =>
                        handleEquipmentChange(
                          entry.id,
                          "operatorRequired",
                          value
                        )
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
                    handleAction={() => addEquipment(entry.id)}
                    textStyle={styles.addButtonText}
                  />
                </View>

                {/* Equipment List */}
                {entry.formData.equipmentList.length > 0 && (
                  <View style={styles.equipmentList}>
                    <Text style={styles.subSectionTitle}>Added Equipment</Text>
                    {entry.formData.equipmentList.map((item, index) => (
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
                          onPress={() => removeEquipment(entry.id, item.id)}
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
        </View>
      )}
    </View>
  );

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={"Create New"} />
      <View style={{ margin: moderateScale(10), flex: 1 }}>
        {step === 0 && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Date</Text>
              <View style={styles.dateViewHolder}>
                <TextInput
                  style={[styles.input, { width: "80%" }]}
                  placeholder="dd/mm/yyyy"
                  value={selectedDate ?? ""}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarView}
                  onPress={openCalendar}
                >
                  <FontAwesome
                    name="calendar"
                    size={moderateScale(25)}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Two Button  */}
            <View style={styles.buttonHolder}>
              <CustomButton
                text={"Cancel"}
                buttonStyle={styles.buttonStyle}
                textStyle={styles.textStyle}
                handleAction={() => navigation.goBack()}
              />
              <CustomButton
                text={"Proceed"}
                buttonStyle={[
                  styles.buttonStyle,
                  { backgroundColor: Colors.greenColor },
                ]}
                disabled={selectedDate === null}
                textStyle={[styles.textStyle, { color: Colors.white }]}
                handleAction={() => setStep(1)}
              />
            </View>
          </>
        )}
        {step === 1 && (
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
              {/* Add Parent Button */}
              <TouchableOpacity
                style={styles.addParentButton}
                onPress={addNewParent}
              >
                <Icon
                  name="add"
                  size={moderateScale(25)}
                  color={Colors.white}
                />
                <Text style={styles.addParentButtonText}>Add New Entry</Text>
              </TouchableOpacity>

              {/* Render all parent entries */}
              {parentEntries.map(renderParentEntry)}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <CustomButton
                  text={"Cancel"}
                  buttonStyle={styles.cancelButton}
                  textStyle={styles.cancelButtonText}
                  handleAction={handleCancel}
                />
                <CustomButton
                  text={"Save All"}
                  buttonStyle={styles.saveButton}
                  textStyle={styles.saveButtonText}
                  handleAction={handleSubmit}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>

      {/* iOS full calendar as a modal */}
      {Platform.OS === "ios" && (
        <Modal
          visible={iosVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIosVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              padding: 16,
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          >
            <View
              style={{
                borderRadius: 12,
                backgroundColor: "white",
                padding: 12,
              }}
            >
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline"
                onChange={(_e, d) => {
                  if (d) {
                    setTempDate(d);
                    setSelectedDate(formatDate(d));
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => setIosVisible(false)}
                style={[
                  styles.buttonStyle,
                  {
                    width: "90%",
                    alignSelf: "center",
                    backgroundColor: Colors.greenColor,
                    borderRadius: moderateScale(10),
                  },
                ]}
              >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </WrapperContainer>
  );
};

export default CreateNew;

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: moderateScaleVertical(20),
    gap: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(10),
  },
  label: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    textTransform: "capitalize",
    letterSpacing: scale(0.2),
  },
  input: {
    borderWidth: moderateScale(1),
    borderColor: Colors.lightGray,
    borderRadius: moderateScale(5),
    padding: moderateScale(12),
    fontSize: textScale(14),
    color: Colors.black,
  },
  dateViewHolder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarView: {
    borderWidth: 2,
    width: moderateScale(50),
    padding: moderateScale(10),
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonStyle: {
    width: "45%",
    borderColor: Colors.diabledColor,
    backgroundColor: Colors.diabledColor,
  },
  textStyle: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.black,
    fontSize: textScale(14),
    letterSpacing: scale(0.3),
    textTransform: "capitalize",
  },
  buttonHolder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(8),
    paddingBottom: moderateScale(20),
  },
  section: {
    marginBottom: moderateScaleVertical(24),
    backgroundColor: Colors.white,
    // borderRadius: moderateScale(8),
    // padding: moderateScale(16),
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
    marginVertical: moderateScaleVertical(16),
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
    // flexDirection: "row",
    // justifyContent: "space-between",
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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    backgroundColor: Colors.white,
    minHeight: moderateScale(48),
  },
  dropdownButtonText: {
    fontSize: textScale(14),
    color: Colors.black,
  },
  dropdownButtonPlaceholder: {
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
    // marginTop: moderateScaleVertical(16),
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
  parentContainer: {
    marginBottom: moderateScaleVertical(16),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    overflow: "hidden",
    // borderWidth:2,
  },
  parentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(16),
    backgroundColor: Colors.lightBackground,
  },
  parentTitle: {
    fontSize: textScale(16),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeParentButton: {
    marginRight: moderateScale(10),
    padding: moderateScale(5),
  },
  parentContent: {
    // padding: moderateScale(16),
  },
  addParentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.greenColor,
    padding: moderateScale(12),
    borderRadius: moderateScale(5),
    marginBottom: moderateScaleVertical(16),
  },
  addParentButtonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    marginLeft: moderateScale(8),
  },
  doneText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.white,
    fontSize: textScale(14),
    padding: moderateScale(8),
    textAlign: "center",
  },
});

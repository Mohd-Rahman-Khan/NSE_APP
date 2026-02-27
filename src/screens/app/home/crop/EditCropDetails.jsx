import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import React, { useState, useEffect } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import { Dropdown } from "react-native-element-dropdown";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../../utils/responsiveSize";
import FontFamily from "../../../../utils/FontFamily";
import Colors from "../../../../utils/Colors";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../utils/HelperFunction";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import CustomBottomSheet from "../../../../components/CustomBottomSheet";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";

const EditCropDetails = ({ route }) => {
  const { item } = route.params;
  console.log(item,"line 38")
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [cropGroupMasterDataList, setCropGroupMasterDataList] = useState([]);
  const [seasonMasterDataList, setSeasonMasterDataList] = useState([]);
  const [cropFirTypeMasterDataList, setCropFirTypeMasterDataList] = useState([]);
  const [seedCropName, setSeedCropName] = useState("");
  const [advancePayableFlag, setAdvancePayableFlag] = useState(null);
  const [gunnyBagRebateRate, setGunnyBagRebateRate] = useState("");
  const [transRebateFlag, setTransRebateFlag] = useState(null);
  const [fieldProcess, setFieldProcess] = useState(null);
  const [minSampleQty, setMinSampleQty] = useState("");
  const [gotCharge, setGotCharge] = useState("");
  const [mulRatio, setMulRatio] = useState("");
  const [seasons, setSeasons] = useState([]);
  const [cropFirType, setCropFirType] = useState(null);
  const [hsnShortName, setHsnShortName] = useState("");
  const [cropGroup, setCropGroup] = useState(null);
  const [cropGroupName, setCropGroupName] = useState("");
  const [gunnyBagsRebateFlag, setGunnyBagsRebateFlag] = useState(null);
  const [lotSize, setLotSize] = useState("");
  const [guaranteeRequired, setGuaranteeRequired] = useState(null);
  const [advTagRequired, setAdvTagRequired] = useState(null);
  const [testingCharge, setTestingCharge] = useState("");
  const [uomShortName, setUomShortName] = useState("");
  const [wheatBasis, setWheatBasis] = useState("");
  const [inspectionChecklist, setInspectionChecklist] = useState(null);
  const [checkingRecurrenceDuration, setCheckingRecurrenceDuration] =
    useState("");
  const [notionValue, setNotionValue] = useState("");
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);
  const [errors, setErrors] = useState({});

  // Yes/No dropdown options
  const yesNoItems = [
    { label: "Yes", value: "Y" },
    { label: "No", value: "N" },
  ];

  // UOM dropdown options
  const uomItems = [
    { label: "Tray", value: "TRAY" },
    { label: "Kg", value: "KG" },
    { label: "Bag", value: "BAG" },
  ];

  useEffect(() => {
    if (item) {
      // Prefill form with existing data for edit mode
      setSeedCropName(item.seedCropName || "");
      setAdvancePayableFlag(item.advancePayableFlag === "Y" ? "Y" : "N");
      setGunnyBagRebateRate(item.gunnyBagRebateRate?.toString() || "");
      setTransRebateFlag(item.transRebateFlag === "Y" ? "Y" : "N");
      setFieldProcess(item.fieldProcess === "Y" ? "Y" : "N");
      setMinSampleQty(item.minSampleQty?.toString() || "");
      setGotCharge(item.gotCharge?.toString() || "");
      setMulRatio(item.mulRatio?.toString() || "");

      // Handle multiple seasons
      const selectedSeasons = item.seasons?.map((season) => season.id) || [];
      setSeasons(selectedSeasons);

      setCropFirType(item.cropFirType?.cropFirTypeId || null);
      setHsnShortName(item.hsnShortName || "");
      setCropGroup(item.cropGroupId || null);
      setCropGroupName(item.cropGroupName || "");
      setGunnyBagsRebateFlag(item.gunnyBagsRebateFlag === "Y" ? "Y" : "N");
      setLotSize(item.lotSize?.toString() || "");
      setGuaranteeRequired(item.guaranteeRequired === "Y" ? "Y" : "N");
      setAdvTagRequired(item.advTagRequired === "Y" ? "Y" : "N");
      setTestingCharge(item.testingCharge?.toString() || "");
      setUomShortName(item.uomShortName || "");
      setWheatBasis(item.wheatBasis?.toString() || "");
      setInspectionChecklist(item.inspectionCheckList === "Y" ? "Y" : "N");
      setCheckingRecurrenceDuration(item.recurrenceOfCheck?.toString() || "");
      setNotionValue(item.notionValue?.toString() || "");
    }
  }, [item]);

  useEffect(() => {
    fetchDropDownData();
  }, []);

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "seedCropName":
        if (!value || value.trim() === "") error = "Crop Name is required";
        break;
      case "cropGroup":
        if (!value) error = "Crop Group is required";
        break;
      case "testingCharge":
        if (!value || value.trim() === "") error = "Testing Charge is required";
        else if (Number.isNaN(value) || Number.parseFloat(value) < 0)
          error = "Testing Charge must be a valid number";
        break;
      case "minSampleQty":
        if (!value || value.trim() === "") error = "Min Sample Qty is required";
        else if (Number.isNaN(value) || Number.parseFloat(value) < 0)
          error = "Min Sample Qty must be a valid number";
        break;
      case "gotCharge":
        if (!value || value.trim() === "") error = "GoT Charge is required";
        else if (Number.isNaN(value) || Number.parseFloat(value) < 0)
          error = "GoT Charge must be a valid number";
        break;
      case "mulRatio":
        if (!value || value.trim() === "") error = "MUL Ratio is required";
        else if (Number.isNaN(value) || Number.parseFloat(value) < 0)
          error = "MUL Ratio must be a valid number";
        break;
      case "hsnShortName":
        if (!value || value.trim() === "") error = "HSN Short Name is required";
        break;
      case "wheatBasis":
        if (!value || value.trim() === "") error = "Wheat Basis is required";
        else if (Number.isNaN(value) || Number.parseFloat(value) < 0)
          error = "Wheat Basis must be a valid number";
        break;
      case "advancePayableFlag":
        if (!value) error = "Adv. Payable Flag is required";
        break;
      case "gunnyBagRebateRate":
        if (!value || value.trim() === "")
          error = "Gunny Bag Rebate Rate is required";
        else if (Number.isNaN(value) || Number.parseFloat(value) < 0)
          error = "Gunny Bag Rebate Rate must be a valid number";
        break;
      case "transRebateFlag":
        if (!value) error = "Trans. Rebate Flag is required";
        break;
      case "fieldProcess":
        if (!value) error = "Field Process is required";
        break;
      case "seasons":
        if (!value || value.length === 0)
          error = "At least one Season is required";
        break;
      case "gunnyBagsRebateFlag":
        if (!value) error = "Gunny Bags Rebate Flag is required";
        break;
      case "lotSize":
        if (!value || value.trim() === "") error = "Lot Size is required";
        else if (Number.isNaN(value) || Number.parseFloat(value) < 0)
          error = "Lot Size must be a valid number";
        break;
      case "guaranteeRequired":
        if (!value) error = "Guarantee Required is required";
        break;
      case "advTagRequired":
        if (!value) error = "Adv Tag Required is required";
        break;
      case "uomShortName":
        if (!value) error = "UOM Short Name is required";
        break;
      case "inspectionChecklist":
        if (!value) error = "Inspection Checklist is required";
        break;
      case "checkingRecurrenceDuration":
        if (inspectionChecklist === "Y" && (!value || value.trim() === "")) {
          error =
            "Checking Recurrence Duration is required when Inspection Checklist is Yes";
        } else if (value && (Number.isNaN(value) || Number.parseFloat(value) < 0)) {
          error = "Checking Recurrence Duration must be a valid number";
        }
        break;
      case "cropFirType":
        if (inspectionChecklist === "Y" && !value) {
          error = "Crop FIR Type is required when Inspection Checklist is Yes";
        }
        break;
      case "notionValue":
        if (!value || value.trim() === "") error = "Notion Value is required";
        else if (Number.isNaN(value) || Number.parseFloat(value) < 0)
          error = "Notion Value must be a valid number";
        break;
      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    newErrors.seedCropName = validateField("seedCropName", seedCropName);
    newErrors.cropGroup = validateField("cropGroup", cropGroup);
    newErrors.testingCharge = validateField("testingCharge", testingCharge);
    newErrors.minSampleQty = validateField("minSampleQty", minSampleQty);
    newErrors.gotCharge = validateField("gotCharge", gotCharge);
    newErrors.mulRatio = validateField("mulRatio", mulRatio);
    newErrors.hsnShortName = validateField("hsnShortName", hsnShortName);
    newErrors.wheatBasis = validateField("wheatBasis", wheatBasis);
    newErrors.advancePayableFlag = validateField(
      "advancePayableFlag",
      advancePayableFlag
    );
    newErrors.gunnyBagRebateRate = validateField(
      "gunnyBagRebateRate",
      gunnyBagRebateRate
    );
    newErrors.transRebateFlag = validateField(
      "transRebateFlag",
      transRebateFlag
    );
    newErrors.fieldProcess = validateField("fieldProcess", fieldProcess);
    newErrors.seasons = validateField("seasons", seasons);
    newErrors.gunnyBagsRebateFlag = validateField(
      "gunnyBagsRebateFlag",
      gunnyBagsRebateFlag
    );
    newErrors.lotSize = validateField("lotSize", lotSize);
    newErrors.guaranteeRequired = validateField(
      "guaranteeRequired",
      guaranteeRequired
    );
    newErrors.advTagRequired = validateField("advTagRequired", advTagRequired);
    newErrors.uomShortName = validateField("uomShortName", uomShortName);
    newErrors.inspectionChecklist = validateField(
      "inspectionChecklist",
      inspectionChecklist
    );
    newErrors.checkingRecurrenceDuration = validateField(
      "checkingRecurrenceDuration",
      checkingRecurrenceDuration
    );
    newErrors.cropFirType = validateField("cropFirType", cropFirType);
    newErrors.notionValue = validateField("notionValue", notionValue);

    setErrors(newErrors);

    // Check if there are any errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleFieldChange = (fieldName, value, setter) => {
    setter(value);

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleCropGroupChange = (selectedValue) => {
    setCropGroup(selectedValue);

    // Find the selected crop group and set its name
    const selectedCropGroup = cropGroupMasterDataList.find(
      (item) => item.value === selectedValue
    );
    if (selectedCropGroup) {
      setCropGroupName(selectedCropGroup.label);
    }

    // Clear error when user selects something
    if (errors.cropGroup) {
      setErrors((prev) => ({
        ...prev,
        cropGroup: "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Prepare data for API call
      const formData = {
        seedCropName,
        cropGroupId: cropGroup,
        cropGroupName: cropGroupName,
        advancePayableFlag,
        gunnyBagsRebateFlag,
        gunnyBagRebateRate: gunnyBagRebateRate || 0,
        transRebateFlag,
        guaranteeRequired,
        advTagRequired,
        minSampleQty: minSampleQty || 0,
        testingCharge: testingCharge || 0,
        gotCharge: gotCharge || 0,
        fieldProcess,
        cropFirType: cropFirType || null,
        uomShortName,
        mulRatio: mulRatio || 0,
        wheatBasis: wheatBasis || 0,
        recurrenceOfCheck: checkingRecurrenceDuration || 0,
        hsnShortName,
        inspectionCheckList: inspectionChecklist,
        lotSize: lotSize || 0,
        seasons: seasons,
        notionValue: notionValue || 0,
        oldHsnShortName: "",
      };
      if(item){
        formData.id=item?.id
      }
      console.log(formData, "line 310");
      try {
        setLoading(true);
        console.log("Form Data:", formData);
        const encryptedPayload = encryptWholeObject(formData);
        const cropGroupResponse = await apiRequest(
          item ? API_ROUTES.UPDATE_CROP : API_ROUTES.ADD_CROP,
          "post",
          encryptedPayload
        );
        const decrypted = decryptAES(cropGroupResponse);
        const parsedDecrypted = JSON.parse(decrypted);
        console.log(parsedDecrypted, "line 320");
        if (
          parsedDecrypted?.status === "SUCCESS" &&
          parsedDecrypted?.statusCode === "200"
        ) {
          showSuccessMessage(`Crop ${item?"Updated":"Added"} successfully!`);
          setSeedCropName("");
          setAdvancePayableFlag(null);
          setGunnyBagRebateRate("");
          setTransRebateFlag(null);
          setFieldProcess(null);
          setMinSampleQty("");
          setGotCharge("");
          setMulRatio("");
          setSeasons([]);
          setCropFirType(null);
          setHsnShortName("");
          setCropGroup(null);
          setCropGroupName("");
          setGunnyBagsRebateFlag(null);
          setLotSize("");
          setGuaranteeRequired(null);
          setAdvTagRequired(null);
          setTestingCharge("");
          setUomShortName("");
          setWheatBasis("");
          setInspectionChecklist(null);
          setCheckingRecurrenceDuration("");
          setNotionValue("");
          navigation.goBack();
        } else {
          showErrorMessage("Something went wrong please try!");
        }
        // Here you would make your API call to save/update the crop details
      } catch (error) {
        console.log(error, "line in Error BLock");
      } finally {
        setLoading(false);
      }
    } else {
      showErrorMessage("Please fill all required fields correctly");
    }
  };

  const fetchDropDownData = async () => {
    try {
      setLoading(true);
      const payloadData = {};
      const encryptedPayload = encryptWholeObject(payloadData);
      const cropGroupResponse = await apiRequest(
        API_ROUTES.CROP_GROUP_MASTER,
        "post",
        encryptedPayload
      );
      const decrypted = decryptAES(cropGroupResponse);
      const parsedDecrypted = JSON.parse(decrypted);
      if (
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        // Format crop group data for dropdown
        const formattedCropGroups = parsedDecrypted?.data?.map((item) => ({
          label: item.cropGroupName,
          value: item.id,
        }));
        setCropGroupMasterDataList(formattedCropGroups || []);

        try {
          const payloadDataForSeason = {
            pageSize: 25,
          };
          const encryptedPayloadForSeason =
            encryptWholeObject(payloadDataForSeason);
          const seasonResponse = await apiRequest(
            API_ROUTES.SESSION_MASTER,
            "post",
            encryptedPayloadForSeason
          );
          const decryptedForSeason = decryptAES(seasonResponse);
          const parsedDecryptedForSeason = JSON.parse(decryptedForSeason);
          if (
            parsedDecryptedForSeason?.status === "SUCCESS" &&
            parsedDecryptedForSeason?.statusCode === "200"
          ) {
            // Format season data for dropdown
            const formattedSeasons = parsedDecryptedForSeason?.data?.map(
              (item) => ({
                label: item.seasonType,
                value: item.id,
              })
            );
            setSeasonMasterDataList(formattedSeasons || []);

            try {
              const payloadDataForCropFirType = {
                pageSize: 25,
                page: 0,
              };
              const encryptedPayloadForCropFIR = encryptWholeObject(
                payloadDataForCropFirType
              );
              const cropFIRMasterResponse = await apiRequest(
                API_ROUTES.CROP_FIR_MASTER,
                "post",
                encryptedPayloadForCropFIR
              );
              const decryptedForCropFIRMaster = decryptAES(
                cropFIRMasterResponse
              );
              const parsedDecryptedForCropFIRMaster = JSON.parse(
                decryptedForCropFIRMaster
              );

              if (
                parsedDecryptedForCropFIRMaster?.status === "SUCCESS" &&
                parsedDecryptedForCropFIRMaster?.statusCode === "200"
              ) {
                // Format crop FIR type data for dropdown
                const formattedCropFirTypes =
                  parsedDecryptedForCropFIRMaster?.data?.map((item) => ({
                    label: item.cropFirTypeName,
                    value: item.cropFirTypeId,
                  }));
                setCropFirTypeMasterDataList(formattedCropFirTypes || []);
              } else {
                showErrorMessage("Unable to get the crop Fir type");
              }
            } catch (error) {
              showErrorMessage(error?.message);
              console.log(error, "line 155");
            }
          } else {
            showErrorMessage("Unable to get the Season List Data ");
          }
        } catch (error) {
          showErrorMessage(error?.message);
          console.log(error, "line 138");
        }
      } else {
        showErrorMessage("Unable to get the Crop group master Data");
      }
    } catch (error) {
      showErrorMessage(error?.message);
      console.log(error, "line 123");
    } finally {
      setLoading(false);
    }
  };

  const toggleSeasonSelection = (seasonId) => {
    const newSeasons = seasons.includes(seasonId)
      ? seasons.filter((id) => id !== seasonId)
      : [...seasons, seasonId];

    setSeasons(newSeasons);

    // Clear season error when user selects something
    if (errors.seasons) {
      setErrors((prev) => ({
        ...prev,
        seasons: "",
      }));
    }
  };

  const renderInputField = (
    label,
    value,
    setValue,
    placeholder,
    keyboardType = "default",
    fieldName
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label} *</Text>
      <TextInput
        style={[styles.input, errors[fieldName] && styles.inputError]}
        value={value}
        placeholderTextColor={Colors.veryLightGrey}
        onChangeText={(text) => handleFieldChange(fieldName, text, setValue)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        returnKeyType="done"
      />
      {errors[fieldName] ? (
        <Text style={styles.errorText}>{errors[fieldName]}</Text>
      ) : null}
    </View>
  );

  const renderDropdown = (
    label,
    value,
    setValue,
    items,
    placeholder,
    fieldName
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label} *</Text>
      <Dropdown
        style={[styles.dropdown, errors[fieldName] && styles.dropdownError]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={items}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={(item) => {
          label === "Crop Group"
            ? handleCropGroupChange(item?.value)
            : handleFieldChange(fieldName, item.value, setValue);
        }}
      />
      {errors[fieldName] ? (
        <Text style={styles.errorText}>{errors[fieldName]}</Text>
      ) : null}
    </View>
  );

  const renderSeasonSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Season *</Text>
      <TouchableOpacity
        style={[styles.seasonSelector, errors.seasons && styles.dropdownError]}
        onPress={() => setSeasonModalVisible(true)}
      >
        <Text style={styles.seasonSelectorText}>
          {seasons.length > 0
            ? `${seasons.length} season(s) selected`
            : "Select seasons"}
        </Text>
      </TouchableOpacity>
      {errors.seasons ? (
        <Text style={styles.errorText}>{errors.seasons}</Text>
      ) : null}

      <CustomBottomSheet
        visible={seasonModalVisible}
        onRequestClose={() => setSeasonModalVisible(false)}
      >
        <Text style={styles.modalTitle}>Select Seasons *</Text>
        <FlatList
          data={seasonMasterDataList}
          keyExtractor={(item) => item.value.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.seasonItem,
                seasons.includes(item.value) && styles.selectedSeasonItem,
              ]}
              onPress={() => toggleSeasonSelection(item.value)}
            >
              <Text style={styles.seasonItemText}>{item.label}</Text>
              {seasons.includes(item.value) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setSeasonModalVisible(false)}
        >
          <Text style={styles.modalCloseButtonText}>Done</Text>
        </TouchableOpacity>
      </CustomBottomSheet>
    </View>
  );

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={item ? "Update Crop Details" : "Add New Crop"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? moderateScale(60) : moderateScale(0)
        }
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeader}>Seed Crop Name</Text>

          {renderInputField(
            "Crop Name",
            seedCropName,
            setSeedCropName,
            "Enter crop name",
            "default",
            "seedCropName"
          )}

          {renderDropdown(
            "Crop Group",
            cropGroup,
            setCropGroup,
            cropGroupMasterDataList,
            "Select crop group",
            "cropGroup"
          )}

          {renderInputField(
            "Testing Charge",
            testingCharge,
            setTestingCharge,
            "Enter charge",
            "numeric",
            "testingCharge"
          )}

          {renderInputField(
            "Min Sample Qty",
            minSampleQty,
            setMinSampleQty,
            "Enter quantity",
            "numeric",
            "minSampleQty"
          )}

          {renderInputField(
            "GoT Charge",
            gotCharge,
            setGotCharge,
            "Enter charge",
            "numeric",
            "gotCharge"
          )}

          {renderInputField(
            "MUL Ratio",
            mulRatio,
            setMulRatio,
            "Enter ratio",
            "numeric",
            "mulRatio"
          )}

          {renderInputField(
            "HSN Short Name",
            hsnShortName,
            setHsnShortName,
            "Enter HSN code",
            "default",
            "hsnShortName"
          )}

          {renderInputField(
            "Wheat Basis",
            wheatBasis,
            setWheatBasis,
            "Enter basis",
            "numeric",
            "wheatBasis"
          )}

          {renderDropdown(
            "Adv. Payable Flag",
            advancePayableFlag,
            setAdvancePayableFlag,
            yesNoItems,
            "Select option",
            "advancePayableFlag"
          )}

          {renderInputField(
            "Gunny Bag Rebate Rate",
            gunnyBagRebateRate,
            setGunnyBagRebateRate,
            "Enter rate",
            "numeric",
            "gunnyBagRebateRate"
          )}

          {renderDropdown(
            "Trans. Rebate Flag",
            transRebateFlag,
            setTransRebateFlag,
            yesNoItems,
            "Select option",
            "transRebateFlag"
          )}

          {renderDropdown(
            "Field Process",
            fieldProcess,
            setFieldProcess,
            yesNoItems,
            "Select option",
            "fieldProcess"
          )}

          {renderSeasonSelector()}

          {renderDropdown(
            "Inspection Checklist",
            inspectionChecklist,
            setInspectionChecklist,
            yesNoItems,
            "Select option",
            "inspectionChecklist"
          )}

          {inspectionChecklist === "Y" &&
            renderDropdown(
              "Crop FIR Type",
              cropFirType,
              setCropFirType,
              cropFirTypeMasterDataList,
              "Select FIR type",
              "cropFirType"
            )}

          {renderDropdown(
            "Gunny Bags Rebate Flag",
            gunnyBagsRebateFlag,
            setGunnyBagsRebateFlag,
            yesNoItems,
            "Select option",
            "gunnyBagsRebateFlag"
          )}

          {renderInputField(
            "Lot Size (raw seeds in kgs)",
            lotSize,
            setLotSize,
            "Enter lot size",
            "numeric",
            "lotSize"
          )}

          {renderDropdown(
            "Guarantee Required",
            guaranteeRequired,
            setGuaranteeRequired,
            yesNoItems,
            "Select option",
            "guaranteeRequired"
          )}

          {renderDropdown(
            "Adv Tag Required",
            advTagRequired,
            setAdvTagRequired,
            yesNoItems,
            "Select option",
            "advTagRequired"
          )}

          {renderDropdown(
            "UOM Short Name",
            uomShortName,
            setUomShortName,
            uomItems,
            "Select UOM",
            "uomShortName"
          )}

          {inspectionChecklist === "Y" &&
            renderInputField(
              "Checking Recurrence Duration",
              checkingRecurrenceDuration,
              setCheckingRecurrenceDuration,
              "Enter duration",
              "numeric",
              "checkingRecurrenceDuration"
            )}

          {renderInputField(
            "Notion Value (%)",
            notionValue,
            setNotionValue,
            "Enter value",
            "numeric",
            "notionValue"
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {item ? "Update Crop" : "Add Crop"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

EditCropDetails.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
};
export default EditCropDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(16),
  },
  sectionHeader: {
    fontSize: textScale(15),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(4),
    borderLeftWidth: moderateScale(2),
    padding: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    borderColor: Colors.primary,
  },
  inputContainer: {
    margin: moderateScale(10),
    gap: moderateScale(5),
  },
  label: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    letterSpacing: scale(0.3),
  },
  input: {
    borderWidth: moderateScale(2),
    borderColor: Colors.veryLightGrey,
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
    fontSize: textScale(15),
    color: Colors.black,
    fontFamily: FontFamily.PoppinsRegular,
    textTransform: "capitalize",
  },
  inputError: {
    borderColor: Colors.red,
  },
  dropdown: {
    height: moderateScale(50),
    borderColor: Colors.veryLightGrey,
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(5),
    paddingHorizontal: moderateScale(8),
  },
  dropdownError: {
    borderColor: Colors.red,
  },
  placeholderStyle: {
    fontSize: textScale(14),
    color: Colors.diabledColor,
    fontFamily: FontFamily.PoppinsRegular,
    letterSpacing: scale(0.2),
  },
  selectedTextStyle: {
    fontSize: textScale(15),
    fontFamily: FontFamily.PoppinsRegular,
    letterSpacing: scale(0.2),
    textTransform: "capitalize",
  },
  inputSearchStyle: {
    height: moderateScale(40),
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
  },
  seasonSelector: {
    height: moderateScale(50),
    borderColor: Colors.veryLightGrey,
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(5),
    paddingHorizontal: moderateScale(8),
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  seasonSelectorText: {
    fontSize: textScale(15),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
  },
  errorText: {
    color: Colors.red,
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    marginTop: moderateScale(2),
  },
  modalTitle: {
    fontSize: textScale(16),
    fontFamily: FontFamily.PoppinsMedium,
    marginBottom: moderateScale(15),
    textAlign: "center",
  },
  seasonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.veryLightGrey,
  },
  selectedSeasonItem: {
    backgroundColor: Colors.lightGreen,
  },
  seasonItemText: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsRegular,
  },
  checkmark: {
    color: Colors.greenColor,
    fontSize: textScale(16),
    fontWeight: "bold",
  },
  modalCloseButton: {
    backgroundColor: Colors.greenColor,
    padding: moderateScale(12),
    borderRadius: moderateScale(5),
    alignItems: "center",
    marginTop: moderateScale(15),
  },
  modalCloseButtonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
  },
  submitButton: {
    backgroundColor: Colors.greenColor,
    padding: moderateScale(13),
    borderRadius: moderateScale(5),
    alignItems: "center",
    marginVertical: moderateScaleVertical(20),
    marginHorizontal: moderateScale(10),
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
  },
});

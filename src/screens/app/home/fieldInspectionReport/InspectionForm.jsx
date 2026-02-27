import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../../../utils/responsiveSize";
import Colors from "../../../../utils/Colors";
import FontFamily from "../../../../utils/FontFamily";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../../../components/CustomButton";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import { showSuccessMessage } from "../../../../utils/HelperFunction";
import PropTypes from "prop-types";
import { compareTwoDates } from "../../../../utils/compareTwoDates";

const InspectionForm = ({ route }) => {
  const { data } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState(null);
  const cropFirTypeId = data?.cropFirTypeId ?? 3;
  const [errors, setErrors] = useState({});

  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [showTimeForField, setshowTimeForField] = useState("");

  const onChange = (event, selectedTime) => {
    setShow(Platform.OS === "ios");
    if (selectedTime) {
      //alert(selectedTime);
      const date = new Date(event.nativeEvent.timestamp);

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;

      console.log(formattedTime);
      handleInputChange(showTimeForField, formattedTime);
    }
  };

  // Define all possible Step 1 fields (label + field + placeholder)
  const STEP1_ALL_FIELDS = [
    {
      label: "Nature of Programme",
      field: "natureofprogramme",
      placeholder: "Enter nature of programme",
    },
    {
      label: "Report Number",
      field: "reportnumber",
      placeholder: "Enter report number",
    },
    {
      label: "Label of Farm",
      field: "labeoffarm",
      placeholder: "Enter farm label",
    },
    {
      label: "Seed Source",
      field: "seedsource",
      placeholder: "Enter seed source",
    },
    {
      label: "Total Acreage under Production (in Ha)",
      field: "totalacreageunderproductioninha",
      placeholder: "Enter total acreage",
      keyboardType: "numeric",
    },
    {
      label: "Acreage of Field No. Inspected (in Ha)",
      field: "acreageoffieldnoinspectedinha",
      placeholder: "Enter acreage",
      keyboardType: "numeric",
    },
    {
      label: "Previous crop",
      field: "previouscrop",
      placeholder: "Enter previous crop",
    },
    {
      label: "Isolation Distance",
      field: "isolationdistance",
      placeholder: "Enter isolation distance",
      keyboardType: "numeric",
    },
    {
      label: "Stage of growth of contaminant",
      field: "stageofgrowthofcontaminant",
      placeholder: "Enter growth stage",
    },
    {
      label: "Stage of seed crop at this inspection",
      field: "stageofseedcropatthisinspection",
      placeholder: "Enter crop stage",
    },
  ];

  // Visible field sets per crop FIR type
  const STEP1_FIELD_SETS = {
    1: [
      { label: "Seed Source", field: "seedsource" },
      { label: "Female Parent", field: "femaleParent" },
      { label: "Male Parent", field: "maleParent" },
      { label: "Code/Hybrid designation", field: "codeHybridDesignation" },
      { label: "Planting ratio (a:b)", field: "plantingRatio" },
      { label: "Previous crop", field: "previouscrop" },
      {
        label: "Are both end marked?",
        field: "areBothEndMarked",
        type: "switch",
      },
      {
        label: "Method of marking male rows",
        field: "methodOfMarkingMaleRows",
      },
      {
        label: "Stage of crop growth at this inspection",
        field: "stageOfCropGrowthAtInspection",
      },
      {
        label: "Stage of growth of contaminationt",
        field: "stageofgrowthofcontaminant",
      },
      {
        label: "Isolation Distance North",
        field: "isolationDistanceNorth",
        keyboardType: "decimal-pad",
      },
      {
        label: "Isolation Distance South",
        field: "isolationDistanceSouth",
        keyboardType: "decimal-pad",
      },
      {
        label: "Isolation Distance East",
        field: "isolationDistanceEast",
        keyboardType: "decimal-pad",
      },
      {
        label: "Isolation Distance West",
        field: "isolationDistanceWest",
        keyboardType: "decimal-pad",
      },
      { label: "Report Number", field: "reportnumber" },
      // { label: "Time From", field: "timeFrom" },
      // { label: "Time To", field: "timeTo" },
    ],
    2: STEP1_ALL_FIELDS.map((f) => ({ ...f })),
    3: [
      { label: "Seed Source", field: "seedsource" },
      { label: "Female Parent", field: "femaleParent" },
      { label: "Male Parent", field: "maleParent" },
      { label: "Code/Hybrid designation", field: "codeHybridDesignation" },
      { label: "Planting ratio (a:b)", field: "plantingRatio" },
      {
        label: "Are both end of male rows marked?",
        field: "areBothEndOfMaleRowsMarked",
        type: "switch",
      },
      {
        label: "Method of marking male rows",
        field: "methodOfMarkingMaleRows",
      },
      {
        label: "Isolation Distance (in meters)",
        field: "isolationDistanceMeters",
        keyboardType: "numeric",
      },
      {
        label: "Stage of Growth of Coteminant",
        field: "stageofgrowthofcontaminant",
      },
      {
        label: "Stage of Seed Crop at this Inspection",
        field: "stageofseedcropatthisinspection",
      },
    ],
  };

  const visibleStep1Fields =
    STEP1_FIELD_SETS[cropFirTypeId] || STEP1_FIELD_SETS[3];

  // Step 2 configurations per crop FIR type
  const STEP2_CONFIGS = {
    1: {
      title: "Pollen Shedding & Disease Count Details",
      headers: [
        "Count No.",
        "No. of pollen shedding heads",
        "No. of heads of off types shedding pollen",
        "No. of heads affected by Head Smut / Ergot",
        "No. of heads affected by Kernel Smut/Grain Smut",
        "No. of heads affected by Green Ear",
      ],
      fields: [
        "pollenSheddingHeads",
        "offTypesSheddingPollen",
        "headSmutErgot",
        "kernelSmutGrainSmut",
        "greenEar",
      ],
    },
    2: {
      title: "Count Details",
      headers: [
        "Count No.",
        "Plants/heads of off-type",
        "Inseparable other crops",
        "Objectionable weeds",
        "Affected by seed borne Disease",
      ],
      fields: ["offType", "otherCrops", "weeds", "disease"],
    },
    3: {
      title: "Maize Crop Inspection Details",
      headers: [
        "Count No.",
        "Composite/open pollinated variety and female parent of maize crop - Receptive Skills",
        "Female parent of maize crops - Shedding tassels",
        "Composite/open pollinated variety and female parent of maize crop - Off type with Shedding tassels",
        "Male parent of maize crops - Off type with Shedding tassels",
      ],
      fields: [
        "receptiveSkills",
        "femaleParentSheddingTassels",
        "compositeOffTypeSheddingTassels",
        "maleParentOffTypeSheddingTassels",
      ],
    },
  };

  const currentStep2Config = STEP2_CONFIGS[cropFirTypeId] || STEP2_CONFIGS[2];

  // Build label maps for better error messages
  const STEP1_LABEL_MAP = React.useMemo(() => {
    const map = {};
    // Date/time labels based on type
    if (cropFirTypeId === 1) {
      map.dateOfSowing = "Date of Sowing";
      map.expectedHarvest = "Expected Date Of Harvest";
      map.dateOfInspection = "Date of inspection";
      map.timeFrom = "Time From";
      map.timeTo = "Time To";
    } else if (cropFirTypeId === 2) {
      map.dateOfSowing = "Date of Sowing";
      map.expectedHarvestFrom = "Expected date of harvest (From)";
      map.expectedHarvestTo = "Expected date of harvest (To)";
      map.dateOfInspection = "Date of inspection";
    }
    // Visible inputs
    visibleStep1Fields.forEach((f) => {
      if (f.type !== "switch") map[f.field] = f.label;
    });
    return map;
  }, [cropFirTypeId, visibleStep1Fields]);

  const STEP3_LABEL_MAP = React.useMemo(() => {
    const map = {};
    const def = [];
    if (cropFirTypeId === 1) {
      def.push(
        {
          label: "No. of Border Row",
          field: "noOfBorderRow",
          keyboardType: "numeric",
        },
        { label: "Crop Condition", field: "cropCondition" },
        {
          label: "No. of times pollen shedders / off types were removed",
          field: "noOfTimesPollenSheddersRemoved",
          keyboardType: "numeric",
        },
        {
          label: "Frequency of pollen shedders, off types etc.",
          field: "frequencyOfPollenShedders",
        },
        {
          label: "Quality of seed production work",
          field: "qualityOfSeedProductionWork",
        },
        {
          label: "Estimated seed yield (Kgs/ Hect.)",
          field: "estimatedSeedYieldKgPerHa",
          keyboardType: "numeric",
        },
        {
          label: "Area rejected (in Ha)",
          field: "areaRejectedHa",
          keyboardType: "numeric",
        },
        {
          label: "Area certified (in Ha)",
          field: "areaCertifiedHa",
          keyboardType: "numeric",
        },
        { label: "Name", field: "name" },
        { label: "Designation", field: "designation" },
        { label: "Address", field: "address" },
        { label: "Remarks", field: "remarks" }
      );
    } else if (cropFirTypeId === 2) {
      def.push(
        {
          label: "Percentage of Off-Types plants",
          field: "offTypePercentage",
          keyboardType: "numeric",
        },
        {
          label: "Percentage of Inseparable Other Crops",
          field: "inseparableOtherCropsPercentage",
          keyboardType: "numeric",
        },
        {
          label: "Percentage of Objectionable Weed Plants",
          field: "objectionableWeedsPercentage",
          keyboardType: "numeric",
        },
        {
          label: "Percentage of Seed-borne Diseases",
          field: "seedBorneDiseasesPercentage",
          keyboardType: "numeric",
        },
        {
          label: "Name of Inseparable Other Crop Plants",
          field: "inseparableOtherCropsName",
        },
        {
          label: "Name of Objectionable Weed Plants",
          field: "objectionableWeedsName",
        },
        {
          label: "Name of Seed-borne Diseases",
          field: "seedBorneDiseasesName",
        },
        {
          label: "Names of Non-seed Borne Disease(s)",
          field: "nonSeedBorneDiseases",
        },
        { label: "Condition of Crop", field: "conditionOfCrop" },
        { label: "Quality of Production Work", field: "productionQuality" },
        {
          label: "Estimated Raw Seed Yield (Kg/hect)",
          field: "estimatedRawSeedYield",
          keyboardType: "numeric",
        },
        { label: "Submitted for (Grower Name)", field: "growerName" },
        {
          label: "Submitted By (Name of Inspecting Official)",
          field: "submittedBy",
        },
        { label: "Designation", field: "designation" },
        { label: "Remarks", field: "remarks" }
      );
    } else if (cropFirTypeId === 3) {
      def.push(
        {
          label: "Side of field from which inspection was started",
          field: "sideOfFieldFromWhichInspectionWasStarted",
        },
        { label: "Crop Condition", field: "cropCondition" },
        {
          label: "No. of times detasselled",
          field: "noOfTimesDetasselled",
          keyboardType: "numeric",
        },
        {
          label: "label.frequencyOfDetasselling",
          field: "frequencyOfDetasselling",
        },
        {
          label: "Quality of seed production work",
          field: "qualityOfSeedProductionWork",
        },
        {
          label: "Estimated seed yield (Kgs./acres)",
          field: "estimatedSeedYieldKgsPerAcres",
          keyboardType: "numeric",
        },
        {
          label:
            "Was Grower or his representative present at the time of inspection",
          field: "growerPresent",
        },
        {
          label: "No. of Border Row",
          field: "noOfBorderRow",
          keyboardType: "numeric",
        },
        { label: "Is this final report", field: "isFinalReport" },
        {
          label: "Area rejected(in Ha)",
          field: "areaRejectedHa",
          keyboardType: "numeric",
        },
        {
          label: "Area certified (in Ha)",
          field: "areaCertifiedHa",
          keyboardType: "numeric",
        },
        { label: "Remarks", field: "remarks" }
      );
    }
    def.forEach((f) => {
      map[f.field] = f.label;
    });
    return map;
  }, [cropFirTypeId]);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1 fields
    dateOfSowing: "",
    expectedHarvestFrom: "",
    expectedHarvestTo: "",
    expectedHarvest: "",
    timeFrom: "",
    timeTo: "",
    dateOfInspection: "",
    // Initialize all text input fields
    natureofprogramme: "",
    labeoffarm: "",
    acreageoffieldnoinspectedinha: "",
    stageofgrowthofcontaminant: "",
    stageOfCropGrowthAtInspection: "",
    reportnumber: "",
    seedsource: "",
    femaleParent: "",
    maleParent: "",
    codeHybridDesignation: "",
    plantingRatio: "",
    previouscrop: "",
    areBothEndMarked: false,
    areBothEndOfMaleRowsMarked: false,
    methodOfMarkingMaleRows: "",
    isolationdistance: "",
    isolationDistanceNorth: "",
    isolationDistanceSouth: "",
    isolationDistanceEast: "",
    isolationDistanceWest: "",
    isolationDistanceMeters: "",
    totalacreageunderproductioninha: "",

    // Step 2 fields - dynamic based on cropFirTypeId
    counts: new Array(10).fill().map(() => {
      if (cropFirTypeId === 1) {
        return {
          pollenSheddingHeads: "",
          offTypesSheddingPollen: "",
          headSmutErgot: "",
          kernelSmutGrainSmut: "",
          greenEar: "",
        };
      } else if (cropFirTypeId === 3) {
        return {
          receptiveSkills: "",
          femaleParentSheddingTassels: "",
          compositeOffTypeSheddingTassels: "",
          maleParentOffTypeSheddingTassels: "",
        };
      } else {
        // Default for type 2
        return {
          offType: "",
          otherCrops: "",
          weeds: "",
          disease: "",
        };
      }
    }),

    // Step 3 fields (union of all types)
    offTypePercentage: "",
    inseparableOtherCropsPercentage: "",
    objectionableWeedsPercentage: "",
    seedBorneDiseasesPercentage: "",
    seedBorneDiseasesName: "",
    inseparableOtherCropsName: "",
    objectionableWeedsName: "",
    nonSeedBorneDiseases: "",
    conditionOfCrop: "",
    confirmsToStandards: false,
    doesCropConformToStandards: false,
    productionQuality: "",
    qualityOfSeedProductionWork: "",
    estimatedSeedField: "",
    estimatedRawSeedYield: "",
    estimatedSeedYieldKgPerHa: "",
    estimatedSeedYieldKgsPerAcres: "",
    noOfBorderRow: "",
    noOfTimesPollenSheddersRemoved: "",
    frequencyOfPollenShedders: "",
    noOfTimesDetasselled: "",
    frequencyOfDetasselling: "",
    wasItDoneAtInspectionTime: false,
    detassellingDoneAtInspectionTime: false,
    growerPresent: false,
    wasGrowerPresentAtInspectionTime: false,
    isFinalReport: false,
    areaRejectedHa: "",
    areaCertifiedHa: "",
    sideOfFieldFromWhichInspectionWasStarted: "",
    name: "",
    address: "",
    growerName: "",
    submittedBy: "",
    designation: "",
    remarks: "",
  });

  // Default values per crop type for Step 1
  const STEP1_DEFAULTS_BY_TYPE = {
    1: {
      natureofprogramme: "",
      reportnumber: "",
      seedsource: "",
      previouscrop: "",
    },
    2: {
      labeoffarm: "",
      totalacreageunderproductioninha: String(data?.totalInspectedArea ?? ""),
      acreageoffieldnoinspectedinha: String(data?.totalInspectedArea ?? ""),
      isolationdistance: "",
    },
    3: {},
  };

  // Initialize defaults when component mounts
  useEffect(() => {
    const defaults = STEP1_DEFAULTS_BY_TYPE[cropFirTypeId] || {};
    if (Object.keys(defaults).length > 0) {
      setFormData((prev) => ({ ...prev, ...defaults }));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user types a non-empty value
    if (typeof value === "string") {
      const isEmpty = value.trim() === "";
      setErrors((prev) => {
        const updated = { ...prev };
        if (!isEmpty && updated[field]) {
          delete updated[field];
        }
        return updated;
      });
    } else {
      // For non-string fields, just clear the error when value changes
      setErrors((prev) => {
        const updated = { ...prev };
        if (updated[field]) delete updated[field];
        return updated;
      });
    }
  };

  const handleCountChange = (index, field, value) => {
    const newCounts = [...formData.counts];
    newCounts[index][field] = value;
    setFormData({ ...formData, counts: newCounts });
    const errorKey = `counts.${index}.${field}`;
    setErrors((prev) => {
      const updated = { ...prev };
      if (String(value).trim() !== "" && updated[errorKey]) {
        delete updated[errorKey];
      }
      return updated;
    });
  };

  const showDatePickerModal = (field) => {
    setCurrentDateField(field);
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      handleInputChange(currentDateField, formattedDate);
      setErrors((prev) => {
        const updated = { ...prev };
        if (updated[currentDateField]) delete updated[currentDateField];
        return updated;
      });
    }
    //// Date Validatiom
    if (currentDateField === "dateOfSowing") {
      if (formData.expectedHarvest) {
        const sowing = new Date(selectedDate);
        const harvest = new Date(formData.expectedHarvest);

        if (sowing >= harvest) {
        }
      } else {
      }
    }

    if (currentDateField === "expectedHarvest") {
      if (formData.dateOfSowing) {
        const sowing = formData.dateOfSowing;
        const harvest = formatDate(selectedDate);
        let compareDates = compareTwoDates(sowing, harvest);

        if (compareDates === 0) {
          alert("Sowing date is before harvest date");
          //console.log("✅ Sowing date is before harvest date");
        } else if (compareDates === 1) {
          alert("harvest date should be greater then sowing date");
          //console.log("❌ Sowing date is after harvest date");
          handleInputChange(currentDateField, "");
        } else {
          // alert("Both dates are the same");
          // console.log("⚠️ Both dates are the same");
        }
      }
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD format for API
  const convertDateFormat = (dateString) => {
    if (!dateString || typeof dateString !== "string") return "";
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateString; // Return as is if already in correct format
  };

  const isEmptyValue = (val) =>
    (typeof val === "string" && val.trim() === "") ||
    val === null ||
    val === undefined;

  const isNumericString = (val) => {
    if (typeof val !== "string") return false;
    if (val.trim() === "") return false;
    return /^-?\d*(\.\d+)?$/.test(val.trim());
  };

  const isValidDateDDMMYYYY = (val) => {
    if (typeof val !== "string") return false;
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return false;
    const [dd, mm, yyyy] = val.split("/").map((s) => Number.parseInt(s, 10));
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
    return true;
  };

  const isValidTimeHHMM = (val) => {
    if (typeof val !== "string") return false;
    if (!/^\d{2}:\d{2}$/.test(val)) return false;
    const [hh, mm] = val.split(":").map((s) => Number.parseInt(s, 10));
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return false;
    return true;
  };

  const validateStep = (currentStep) => {
    const stepErrors = {};

    if (currentStep === 1) {
      // Date fields required based on type
      if (cropFirTypeId === 1) {
        ["dateOfSowing", "expectedHarvest", "dateOfInspection"].forEach((f) => {
          if (isEmptyValue(formData[f]))
            stepErrors[f] = `${STEP1_LABEL_MAP[f]} is required`;
          else if (!isValidDateDDMMYYYY(formData[f]))
            stepErrors[
              f
            ] = `${STEP1_LABEL_MAP[f]} must be in dd/mm/yyyy format`;
        });
        ["timeFrom", "timeTo"].forEach((f) => {
          if (isEmptyValue(formData[f]))
            stepErrors[f] = `${STEP1_LABEL_MAP[f]} is required`;
          else if (!isValidTimeHHMM(formData[f]))
            stepErrors[f] = `${STEP1_LABEL_MAP[f]} must be in HH:MM format`;
        });
      }
      if (cropFirTypeId === 2) {
        [
          "dateOfSowing",
          "expectedHarvestFrom",
          "expectedHarvestTo",
          "dateOfInspection",
        ].forEach((f) => {
          if (isEmptyValue(formData[f]))
            stepErrors[f] = `${STEP1_LABEL_MAP[f]} is required`;
          else if (!isValidDateDDMMYYYY(formData[f]))
            stepErrors[
              f
            ] = `${STEP1_LABEL_MAP[f]} must be in dd/mm/yyyy format`;
        });
      }

      // Visible text fields (exclude switches)
      const requiredFields = visibleStep1Fields
        .filter((i) => i.type !== "switch")
        .map((i) => i.field);
      requiredFields.forEach((f) => {
        const label = STEP1_LABEL_MAP[f] || f;
        if (isEmptyValue(formData[f])) stepErrors[f] = `${label} is required`;
        else if (
          visibleStep1Fields.find(
            (i) => i.field === f && i.keyboardType === "numeric"
          ) &&
          !isNumericString(String(formData[f]))
        ) {
          stepErrors[f] = `${label} must be a number`;
        }
      });
    }

    if (currentStep === 2) {
      formData.counts.forEach((row, idx) => {
        const fields = currentStep2Config.fields;
        const isFirstRow = idx === 0;
        const anyFilled = fields.some((f) => !isEmptyValue(row[f]));
        if (isFirstRow || anyFilled) {
          fields.forEach((f) => {
            const headerIdx = fields.indexOf(f);
            const headerLabel = currentStep2Config.headers[headerIdx + 1] || f;
            const key = `counts.${idx}.${f}`;
            const value = row[f];
            if (isEmptyValue(value)) {
              stepErrors[key] = `${headerLabel} (Row ${idx + 1}) is required`;
            } else if (!isNumericString(String(value))) {
              stepErrors[key] = `${headerLabel} (Row ${
                idx + 1
              }) must be a number`;
            }
          });
        }
      });
    }

    if (currentStep === 3) {
      // Required fields per crop type (exclude switches)
      const step3FieldsByType = {
        1: [
          "noOfBorderRow",
          "cropCondition",
          "noOfTimesPollenSheddersRemoved",
          "frequencyOfPollenShedders",
          "qualityOfSeedProductionWork",
          "estimatedSeedYieldKgPerHa",
          "areaRejectedHa",
          "areaCertifiedHa",
          "name",
          "designation",
          "address",
          "remarks",
        ],
        2: [
          "offTypePercentage",
          "inseparableOtherCropsPercentage",
          "objectionableWeedsPercentage",
          "seedBorneDiseasesPercentage",
          "inseparableOtherCropsName",
          "objectionableWeedsName",
          "seedBorneDiseasesName",
          "nonSeedBorneDiseases",
          "conditionOfCrop",
          "productionQuality",
          "estimatedRawSeedYield",
          "growerName",
          "submittedBy",
          "designation",
          "remarks",
        ],
        3: [
          "sideOfFieldFromWhichInspectionWasStarted",
          "cropCondition",
          "noOfTimesDetasselled",
          "frequencyOfDetasselling",
          "qualityOfSeedProductionWork",
          "estimatedSeedYieldKgsPerAcres",
          "noOfBorderRow",
          "areaRejectedHa",
          "areaCertifiedHa",
          "remarks",
        ],
      };
      const req = step3FieldsByType[cropFirTypeId] || [];
      req.forEach((f) => {
        const label = STEP3_LABEL_MAP[f] || f;
        const value = formData[f];
        if (isEmptyValue(value)) stepErrors[f] = `${label} is required`;
        else if (
          [
            "noOfBorderRow",
            "noOfTimesPollenSheddersRemoved",
            "estimatedSeedYieldKgPerHa",
            "areaRejectedHa",
            "areaCertifiedHa",
            "offTypePercentage",
            "inseparableOtherCropsPercentage",
            "objectionableWeedsPercentage",
            "seedBorneDiseasesPercentage",
            "estimatedRawSeedYield",
            "noOfTimesDetasselled",
            "estimatedSeedYieldKgsPerAcres",
          ].includes(f) &&
          !isNumericString(String(value))
        ) {
          stepErrors[f] = `${label} must be a number`;
        }
      });
    }

    return stepErrors;
  };

  const nextStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep1 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={moderateScaleVertical(10)}
    >
      <ScrollView
        style={styles.stepContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Basic Information</Text>

        {cropFirTypeId === 1 && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Sowing</Text>
              <View style={styles.dateViewHolder}>
                <TextInput
                  style={[
                    styles.input,
                    { width: "80%" },
                    errors.dateOfSowing ? styles.errorInput : null,
                  ]}
                  placeholder="dd/mm/yyyy"
                  value={formData.dateOfSowing}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarView}
                  onPress={() => showDatePickerModal("dateOfSowing")}
                >
                  <FontAwesome
                    name="calendar"
                    size={moderateScale(25)}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
              {errors.dateOfSowing && (
                <Text style={styles.errorText}>{errors.dateOfSowing}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expected Date Of Harvest</Text>
              <View style={styles.dateViewHolder}>
                <TextInput
                  style={[
                    styles.input,
                    { width: "80%" },
                    errors.expectedHarvest ? styles.errorInput : null,
                  ]}
                  placeholder="dd/mm/yyyy"
                  value={formData.expectedHarvest}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarView}
                  onPress={() => showDatePickerModal("expectedHarvest")}
                >
                  <FontAwesome
                    name="calendar"
                    size={moderateScale(25)}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
              {errors.expectedHarvest && (
                <Text style={styles.errorText}>{errors.expectedHarvest}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of inspection</Text>
              <View style={styles.dateViewHolder}>
                <TextInput
                  style={[
                    styles.input,
                    { width: "80%" },
                    errors.dateOfInspection ? styles.errorInput : null,
                  ]}
                  placeholder="dd/mm/yyyy"
                  value={formData.dateOfInspection}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarView}
                  onPress={() => showDatePickerModal("dateOfInspection")}
                >
                  <FontAwesome
                    name="calendar"
                    size={moderateScale(25)}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
              {errors.dateOfInspection && (
                <Text style={styles.errorText}>{errors.dateOfInspection}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time From</Text>
              <TouchableOpacity
                //style={{ backgroundColor: "red" }}
                onPress={() => {
                  setshowTimeForField("timeFrom");
                  setShow(true);
                }}
              >
                <TextInput
                  editable={false}
                  style={[
                    styles.input,
                    errors.timeFrom ? styles.errorInput : null,
                  ]}
                  placeholder="HH:MM"
                  value={formData.timeFrom}
                  onChangeText={(text) => {
                    // Allow only digits and colon, max length 5
                    // const formatted = text.replace(/[^0-9:]/g, "").slice(0, 5);
                    // handleInputChange("timeFrom", formatted);
                  }}
                  keyboardType="numbers-and-punctuation"
                />
              </TouchableOpacity>

              {errors.timeFrom && (
                <Text style={styles.errorText}>{errors.timeFrom}</Text>
              )}
              {show && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time To</Text>
              <TouchableOpacity
                //style={{ backgroundColor: "red" }}
                onPress={() => {
                  setshowTimeForField("timeTo");
                  setShow(true);
                }}
              >
                <TextInput
                  editable={false}
                  style={[
                    styles.input,
                    errors.timeTo ? styles.errorInput : null,
                  ]}
                  placeholder="HH:MM"
                  value={formData.timeTo}
                  onChangeText={(text) => {
                    const formatted = text.replace(/[^0-9:]/g, "").slice(0, 5);
                    //handleInputChange("timeTo", formatted);
                  }}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                {errors.timeTo && (
                  <Text style={styles.errorText}>{errors.timeTo}</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {cropFirTypeId === 2 && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Sowing</Text>
              <View style={styles.dateViewHolder}>
                <TextInput
                  style={[
                    styles.input,
                    { width: "80%" },
                    errors.dateOfSowing ? styles.errorInput : null,
                  ]}
                  placeholder="dd/mm/yyyy"
                  value={formData.dateOfSowing}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarView}
                  onPress={() => showDatePickerModal("dateOfSowing")}
                >
                  <FontAwesome
                    name="calendar"
                    size={moderateScale(25)}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
              {errors.dateOfSowing && (
                <Text style={styles.errorText}>{errors.dateOfSowing}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expected date of harvest (From)</Text>
              <View style={styles.dateViewHolder}>
                <TextInput
                  style={[
                    styles.input,
                    { width: "80%" },
                    errors.expectedHarvestFrom ? styles.errorInput : null,
                  ]}
                  placeholder="dd/mm/yyyy"
                  value={formData.expectedHarvestFrom}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarView}
                  onPress={() => showDatePickerModal("expectedHarvestFrom")}
                >
                  <FontAwesome
                    name="calendar"
                    size={moderateScale(25)}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
              {errors.expectedHarvestFrom && (
                <Text style={styles.errorText}>
                  {errors.expectedHarvestFrom}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expected date of harvest (To)</Text>
              <View style={styles.dateViewHolder}>
                <TextInput
                  style={[
                    styles.input,
                    { width: "80%" },
                    errors.expectedHarvestTo ? styles.errorInput : null,
                  ]}
                  placeholder="dd/mm/yyyy"
                  value={formData.expectedHarvestTo}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarView}
                  onPress={() => showDatePickerModal("expectedHarvestTo")}
                >
                  <FontAwesome
                    name="calendar"
                    size={moderateScale(25)}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
              {errors.expectedHarvestTo && (
                <Text style={styles.errorText}>{errors.expectedHarvestTo}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of inspection</Text>
              <View style={styles.dateViewHolder}>
                <TextInput
                  style={[
                    styles.input,
                    { width: "80%" },
                    errors.dateOfInspection ? styles.errorInput : null,
                  ]}
                  placeholder="dd/mm/yyyy"
                  value={formData.dateOfInspection}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarView}
                  onPress={() => showDatePickerModal("dateOfInspection")}
                >
                  <FontAwesome
                    name="calendar"
                    size={moderateScale(25)}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
              {errors.dateOfInspection && (
                <Text style={styles.errorText}>{errors.dateOfInspection}</Text>
              )}
            </View>
          </>
        )}

        {/* Type 3 has no date fields in Step 1 per spec */}

        <Text style={styles.sectionTitle}>Checklist Items</Text>
        {visibleStep1Fields.map((item, index) => (
          <View key={item?.id} style={styles.inputGroup}>
            <Text style={styles.label}>{item.label}</Text>
            {item.type === "switch" ? (
              <View
                style={[styles.switchRow, { justifyContent: "flex-start" }]}
              >
                <View style={styles.switchContainer}>
                  <Switch
                    value={!!formData[item.field]}
                    onValueChange={(value) =>
                      handleInputChange(item.field, value)
                    }
                    trackColor={{ false: "#767577", true: Colors.lightGreen }}
                    thumbColor={
                      formData[item.field] ? Colors.greenColor : "#f4f3f4"
                    }
                  />
                </View>
              </View>
            ) : item.field === "plantingRatio" ? (
              <TextInput
                style={[
                  styles.input,
                  errors[item.field] ? styles.errorInput : null,
                ]}
                placeholder="e.g. 2:1"
                value={String(formData[item.field] ?? "")}
                onChangeText={(text) => {
                  // Allow only digits and one colon, max length 5
                  let formatted = text.replace(/[^0-9:]/g, "");
                  const parts = formatted.split(":");
                  if (parts.length > 2) {
                    formatted = parts[0] + ":" + parts[1];
                  }
                  handleInputChange(item.field, formatted);
                }}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            ) : (
              <TextInput
                style={[
                  styles.input,
                  errors[item.field] ? styles.errorInput : null,
                ]}
                placeholder={item.placeholder || "Enter value"}
                value={String(formData[item.field] ?? "")}
                onChangeText={(text) => {
                  if (item.field == "stageofgrowthofcontaminant") {
                    const hasSpecialChars = /[^a-zA-Z0-9]/.test(text);

                    if (hasSpecialChars) {
                      alert("Special characyers are not allow.");
                    } else {
                      handleInputChange(item.field, text);
                    }
                  } else {
                    handleInputChange(item.field, text);
                  }
                }}
                keyboardType={item.keyboardType || "default"}
              />
            )}
            {item.type !== "switch" && errors[item.field] && (
              <Text style={styles.errorText}>{errors[item.field]}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep2 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={moderateScaleVertical(10)}
    >
      <ScrollView
        style={styles.stepContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{currentStep2Config.title}</Text>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          style={styles.horizontalScrollContainer}
        >
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              {currentStep2Config.headers.map((header, index) => (
                <Text
                  key={index}
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    {
                      width:
                        index === 0 ? moderateScale(80) : moderateScale(150),
                    },
                  ]}
                >
                  {header}
                </Text>
              ))}
            </View>

            {formData.counts.map((count, index) => (
              <View key={index} style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.countCell,
                    { width: moderateScale(80) },
                  ]}
                >
                  {index + 1}
                </Text>
                {currentStep2Config.fields.map((field, fieldIndex) => (
                  <TextInput
                    key={fieldIndex}
                    style={[
                      styles.tableCell,
                      styles.inputCell,
                      { width: moderateScale(150) },
                      errors[`counts.${index}.${field}`]
                        ? styles.errorInput
                        : null,
                    ]}
                    value={count[field] || ""}
                    onChangeText={(text) =>
                      handleCountChange(index, field, text)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                ))}
              </View>
            ))}

            <View style={styles.tableFooter}>
              <Text
                style={[
                  styles.tableCell,
                  styles.footerCell,
                  { width: moderateScale(80) },
                ]}
              >
                TOTAL
              </Text>
              {currentStep2Config.fields.map((field, index) => {
                const total = formData.counts.reduce((sum, count) => {
                  return sum + (Number.parseFloat(count[field]) || 0);
                }, 0);
                return (
                  <Text
                    key={index}
                    style={[
                      styles.tableCell,
                      styles.footerCell,
                      { width: moderateScale(150) },
                    ]}
                  >
                    {total.toFixed(2)}
                  </Text>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep3 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={moderateScaleVertical(10)}
    >
      <ScrollView
        style={styles.stepContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Summary & Assessment</Text>

        {cropFirTypeId === 1 && (
          <>
            {[
              {
                label: "No. of Border Row",
                field: "noOfBorderRow",
                keyboardType: "number-pad",
              },
              { label: "Crop Condition", field: "cropCondition" },
              {
                label: "No. of times pollen shedders / off types were removed",
                field: "noOfTimesPollenSheddersRemoved",
                keyboardType: "number-pad",
              },
              {
                label: "Frequency of pollen shedders, off types etc.",
                field: "frequencyOfPollenShedders",
              },
              {
                label: "Was it done at inspection time?",
                field: "wasItDoneAtInspectionTime",
                type: "switch",
              },
              {
                label: "Quality of seed production work",
                field: "qualityOfSeedProductionWork",
              },
              {
                label:
                  "Does this crop conform to the standards for certification",
                field: "doesCropConformToStandards",
                type: "switch",
              },
              {
                label: "Estimated seed yield (Kgs/ Hect.)",
                field: "estimatedSeedYieldKgPerHa",
                keyboardType: "decimal-pad",
              },
              {
                label:
                  "Was the Grower or his representatives present at inspection time?",
                field: "wasGrowerPresentAtInspectionTime",
                type: "switch",
              },
              {
                label: "Is this the final report?",
                field: "isFinalReport",
                type: "switch",
              },
              {
                label: "Area rejected (in Ha)",
                field: "areaRejectedHa",
                keyboardType: "decimal-pad",
              },
              {
                label: "Area certified (in Ha)",
                field: "areaCertifiedHa",
                keyboardType: "decimal-pad",
              },
              { label: "Name", field: "name" },
              { label: "Designation", field: "designation" },
              { label: "Address", field: "address" },
              { label: "Remarks", field: "remarks", multiline: true },
            ].map((item, idx) => (
              <View key={idx} style={styles.inputGroup}>
                <Text style={styles.label}>{item.label}</Text>
                {item.type === "switch" ? (
                  <View
                    style={[styles.switchRow, { justifyContent: "flex-start" }]}
                  >
                    <View style={styles.switchContainer}>
                      <Switch
                        value={!!formData[item.field]}
                        onValueChange={(value) =>
                          handleInputChange(item.field, value)
                        }
                        trackColor={{
                          false: "#767577",
                          true: Colors.lightGreen,
                        }}
                        thumbColor={
                          formData[item.field] ? Colors.greenColor : "#f4f3f4"
                        }
                      />
                    </View>
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.input,
                      item.multiline ? styles.textArea : null,
                      errors[item.field] ? styles.errorInput : null,
                    ]}
                    value={String(formData[item.field] ?? "")}
                    onChangeText={(text) => {
                      if (item.field == "areaRejectedHa") {
                        const parts = text.split(".");
                        if (parts.length === 1 || parts[1].length <= 2) {
                          handleInputChange(item.field, text);
                        } else {
                          // console.log(
                          //   "❌ Invalid (more than 2 digits after decimal)"
                          // );
                        }
                      } else {
                        handleInputChange(item.field, text);
                      }
                    }}
                    keyboardType={item.keyboardType || "default"}
                    multiline={!!item.multiline}
                  />
                )}
                {item.type !== "switch" && errors[item.field] && (
                  <Text style={styles.errorText}>{errors[item.field]}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {cropFirTypeId === 2 && (
          <>
            {[
              {
                label: "Percentage of Off-Types plants",
                field: "offTypePercentage",
                keyboardType: "numeric",
              },
              {
                label: "Percentage of Inseparable Other Crops",
                field: "inseparableOtherCropsPercentage",
                keyboardType: "numeric",
              },
              {
                label: "Percentage of Objectionable Weed Plants",
                field: "objectionableWeedsPercentage",
                keyboardType: "numeric",
              },
              {
                label: "Percentage of Seed-borne Diseases",
                field: "seedBorneDiseasesPercentage",
                keyboardType: "numeric",
              },
              {
                label: "Name of Inseparable Other Crop Plants",
                field: "inseparableOtherCropsName",
              },
              {
                label: "Name of Objectionable Weed Plants",
                field: "objectionableWeedsName",
              },
              {
                label: "Name of Seed-borne Diseases",
                field: "seedBorneDiseasesName",
              },
              {
                label: "Names of Non-seed Borne Disease(s)",
                field: "nonSeedBorneDiseases",
              },
              { label: "Condition of Crop", field: "conditionOfCrop" },
              {
                label: "Does this crop confirm to standards of cert.?",
                field: "confirmsToStandards",
                type: "switch",
              },
              {
                label: "Quality of Production Work",
                field: "productionQuality",
              },
              {
                label: "Is this the final report?",
                field: "isFinalReport",
                type: "switch",
              },
              {
                label: "Estimated Raw Seed Yield (Kg/hect)",
                field: "estimatedRawSeedYield",
                keyboardType: "numeric",
              },
              {
                label:
                  "Was Grower or his representative present at the time of inspection",
                field: "growerPresent",
                type: "switch",
              },
              { label: "Submitted for (Grower Name)", field: "growerName" },
              {
                label: "Submitted By (Name of Inspecting Official)",
                field: "submittedBy",
              },
              { label: "Designation", field: "designation" },
              { label: "Remarks", field: "remarks", multiline: true },
            ].map((item, idx) => (
              <View key={idx} style={styles.inputGroup}>
                <Text style={styles.label}>{item.label}</Text>
                {item.type === "switch" ? (
                  <View
                    style={[styles.switchRow, { justifyContent: "flex-start" }]}
                  >
                    <View style={styles.switchContainer}>
                      <Switch
                        value={!!formData[item.field]}
                        onValueChange={(value) =>
                          handleInputChange(item.field, value)
                        }
                        trackColor={{
                          false: "#767577",
                          true: Colors.lightGreen,
                        }}
                        thumbColor={
                          formData[item.field] ? Colors.greenColor : "#f4f3f4"
                        }
                      />
                    </View>
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.input,
                      item.multiline ? styles.textArea : null,
                      errors[item.field] ? styles.errorInput : null,
                    ]}
                    value={String(formData[item.field] ?? "")}
                    onChangeText={(text) => handleInputChange(item.field, text)}
                    keyboardType={item.keyboardType || "default"}
                    multiline={!!item.multiline}
                  />
                )}
                {item.type !== "switch" && errors[item.field] && (
                  <Text style={styles.errorText}>{errors[item.field]}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {cropFirTypeId === 3 && (
          <>
            {[
              {
                label: "Side of field from which inspection was started",
                field: "sideOfFieldFromWhichInspectionWasStarted",
              },
              { label: "Crop Condition", field: "cropCondition" },
              {
                label: "No. of times detasselled",
                field: "noOfTimesDetasselled",
                keyboardType: "numeric",
              },
              {
                label: "label.frequencyOfDetasselling",
                field: "frequencyOfDetasselling",
              },
              {
                label: "label.detassellingDoneAtInspectionTime",
                field: "detassellingDoneAtInspectionTime",
                type: "switch",
              },
              {
                label: "Quality of seed production work",
                field: "qualityOfSeedProductionWork",
              },
              {
                label: "Quality of seed production work",
                field: "qualityOfSeedProductionWork",
              },
              {
                label: "Estimated seed yield (Kgs./acres)",
                field: "estimatedSeedYieldKgsPerAcres",
                keyboardType: "numeric",
              },
              {
                label:
                  "Was Grower or his representative present at the time of inspection",
                field: "growerPresent",
                type: "switch",
              },
              {
                label: "No. of Border Row",
                field: "noOfBorderRow",
                keyboardType: "numeric",
              },
              {
                label: "Is this final report",
                field: "isFinalReport",
                type: "switch",
              },
              {
                label: "Area rejected(in Ha)",
                field: "areaRejectedHa",
                keyboardType: "numeric",
              },
              {
                label: "Area certified (in Ha)",
                field: "areaCertifiedHa",
                keyboardType: "numeric",
              },
              { label: "Remarks", field: "remarks", multiline: true },
            ].map((item, idx) => (
              <View key={idx} style={styles.inputGroup}>
                <Text style={styles.label}>{item.label}</Text>
                {item.type === "switch" ? (
                  <View
                    style={[styles.switchRow, { justifyContent: "flex-start" }]}
                  >
                    <View style={styles.switchContainer}>
                      <Switch
                        value={!!formData[item.field]}
                        onValueChange={(value) =>
                          handleInputChange(item.field, value)
                        }
                        trackColor={{
                          false: "#767577",
                          true: Colors.lightGreen,
                        }}
                        thumbColor={
                          formData[item.field] ? Colors.greenColor : "#f4f3f4"
                        }
                      />
                    </View>
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.input,
                      item.multiline ? styles.textArea : null,
                    ]}
                    value={String(formData[item.field] ?? "")}
                    onChangeText={(text) => handleInputChange(item.field, text)}
                    keyboardType={item.keyboardType || "default"}
                    multiline={!!item.multiline}
                  />
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Helper function to convert boolean to Yes/No string
  const booleanToYesNo = (value) => {
    return value ? "Yes" : "No";
  };

  // Helper function to map counts data for different crop types
  const mapCountsData = (counts, cropType) => {
    if (cropType === 1) {
      // For type 1: Pollen Shedding & Disease Count Details
      return counts.map((count) => ({
        pollenSheddingHeadsCount:
          Number.parseInt(count.pollenSheddingHeads) || 0,
        offTypeSheddingHeadsCount1:
          Number.parseInt(count.offTypesSheddingPollen) || 0,
        normalHeadSmutErgotCount: Number.parseInt(count.headSmutErgot) || 0,
        normalKernelSmutCount: Number.parseInt(count.kernelSmutGrainSmut) || 0,
        normalGreenEarCount: Number.parseInt(count.greenEar) || 0,
        offTypeSheddingHeadsCount2:
          Number.parseInt(count.offTypesSheddingPollen) || 0,
        offTypeHeadSmutErgotCount: Number.parseInt(count.headSmutErgot) || 0,
        offTypeKernelSmutCount: Number.parseInt(count.kernelSmutGrainSmut) || 0,
        offTypeGreenEarCount: Number.parseInt(count.greenEar) || 0,
      }));
    } else if (cropType === 2) {
      // For type 2: Count Details
      return counts.map((count) => ({
        plantsOrHeadsOfOffType: Number.parseInt(count.offType) || 0,
        inseparableOtherCrops: Number.parseInt(count.otherCrops) || 0,
        objectionableWeeds: Number.parseInt(count.weeds) || 0,
        affectedBySeedBorneDisease: Number.parseInt(count.disease) || 0,
      }));
    } else if (cropType === 3) {
      // For type 3: Maize Crop Inspection Details
      return counts.map((count) => ({
        compositeOrFemaleParent1: count.receptiveSkills || "0",
        femaleParentOfCrops: count.femaleParentSheddingTassels || "0",
        compositeOrFemaleParent2: count.compositeOffTypeSheddingTassels || "0",
        maleParentOfCrops: count.maleParentOffTypeSheddingTassels || "0",
      }));
    }
    return [];
  };

  // Function to map form data to API payload based on crop type
  const mapFormDataToPayload = (formData, cropType, routeData) => {
    const basePayload = {
      scheduleId:
        routeData?.inspection?.schedule?.id || data?.inspection?.schedule?.id,
      cropId: routeData?.inspection?.crop?.id || data?.inspection?.crop?.id,
      seasonId: data?.inspection?.productionPlan?.seasonId,
      season: data?.inspection?.productionPlan?.season,
      seedClass:
        routeData?.inspection?.schedule?.seed ||
        data?.inspection?.schedule?.seed,
      areaOfInspectionField:
        routeData?.totalInspectedArea || data?.totalInspectedArea,
      totalAcreUnderSeedProd:
        routeData?.inspection?.schedule?.areaToBePlanted ||
        data?.inspection?.schedule?.areaToBePlanted,
      growerId: routeData?.inspection?.growerId || data?.inspection?.growerId,
      growerName:
        routeData?.inspection?.schedule?.growerName ||
        data?.inspection?.schedule?.growerName,
      growerDistrict:
        routeData?.grower?.districtId?.districtName ||
        data?.grower?.districtId?.districtName,
      growerState:
        routeData?.grower?.stateId?.stateName ||
        data?.grower?.stateId?.stateName,
      inspectionCount:
        routeData?.inspection?.schedule?.inspectionCount ||
        data?.inspection?.schedule?.inspectionCount ||
        1,
      inspectionInchargeId:
        routeData?.inspection?.schedule?.inspectionInChargeId ||
        data?.inspection?.schedule?.inspectionInChargeId ||
        "197",
      scheduleLandId: routeData?.inspection?.schedule?.landDetails?.map(
        (land) => land.landId
      ) ||
        data?.inspection?.schedule?.landDetails?.map((land) => land.landId) || [
          routeData?.selectedLands?.[0]?.id || data?.selectedLands?.[0]?.id,
        ],
      inspectionStatus: "APPROVED", // Default status
    };

    if (cropType === 1) {
      return {
        ...basePayload,
        // Step 1 fields
        reportNo: formData.reportnumber || "",
        timeFrom: formData.timeFrom || "",
        timeTo: formData.timeTo || "",
        dateOfInspection: convertDateFormat(formData.dateOfInspection),
        plantingRatio: formData.plantingRatio || "",
        previousCrop: formData.previouscrop || "",
        areBothEndMarked: booleanToYesNo(formData.areBothEndMarked),
        methodOfMarkingMaleRows: formData.methodOfMarkingMaleRows || "",
        stageOfGrowthOfAtTheInspection:
          formData.stageOfCropGrowthAtInspection || "",
        stageOfGrowthOfContaminant: formData.stageofgrowthofcontaminant || "",
        isolationDistanceNorth:
          Number.parseFloat(formData.isolationDistanceNorth) || 0,
        isolationDistanceSouth:
          Number.parseFloat(formData.isolationDistanceSouth) || 0,
        isolationDistanceEast:
          Number.parseFloat(formData.isolationDistanceEast) || 0,
        isolationDistanceWest:
          Number.parseFloat(formData.isolationDistanceWest) || 0,
        seedSource: formData.seedsource || "",
        femaleParent: formData.femaleParent || "",
        maleParent: formData.maleParent || "",
        hybridCodeDesignation: formData.codeHybridDesignation || "",
        dateOfSowing: convertDateFormat(formData.dateOfSowing),
        expectedDateOfHarvest: convertDateFormat(formData.expectedHarvest),
        // Step 2 fields
        productionInspectionFieldCountAs: mapCountsData(formData.counts, 1),
        // Step 3 fields
        noOfBorderRows: Number.parseInt(formData.noOfBorderRow) || 0,
        cropCondition: formData.cropCondition || "",
        noOfTimesPollenShedders:
          Number.parseInt(formData.noOfTimesPollenSheddersRemoved) || 0,
        frequencyOfPollenShedders: formData.frequencyOfPollenShedders || "",
        wasItDoneAtInspectionTime: booleanToYesNo(
          formData.wasItDoneAtInspectionTime
        ),
        qualityOfSeedProductionWork: formData.qualityOfSeedProductionWork || "",
        doesThisCropConfirmToStandard: booleanToYesNo(
          formData.doesCropConformToStandards
        ),
        estimatedSeedYield:
          Number.parseFloat(formData.estimatedSeedYieldKgPerHa) || 0,
        wasTheGrowerPresent: booleanToYesNo(
          formData.wasGrowerPresentAtInspectionTime
        ),
        isFinal: booleanToYesNo(formData.isFinalReport),
        areaRejected: Number.parseFloat(formData.areaRejectedHa) || 0,
        areaCertified: Number.parseFloat(formData.areaCertifiedHa) || 0,
        name: formData.name || "",
        designation: formData.designation || "",
        address: formData.address || "",
        remarks: formData.remarks || "",
        programmeRejected: "No", // Default value
        // Additional fields for Type 1
        growerVillage: data?.grower?.entityRegNo?.villageId?.villageName || "",
        growerTaluk: data?.grower?.entityRegNo?.taluqs?.talukaName || "",
        growerBlock: data?.grower?.entityRegNo?.block?.blockName || "",
        rejectedLands: [], // Default empty array
      };
    } else if (cropType === 2) {
      return {
        ...basePayload,
        // Step 1 fields
        natureOfProgramme: formData.natureofprogramme || "",
        reportNo: formData.reportnumber || "",
        dateOfInspection: convertDateFormat(formData.dateOfInspection),
        locationOfFarm: formData.labeoffarm || "",
        sourceOfSeed: formData.seedsource || "",
        totalAcreageUnderProduction:
          Number.parseFloat(formData.totalacreageunderproductioninha) || 0,
        acreageOfFieldInspected:
          Number.parseFloat(formData.acreageoffieldnoinspectedinha) || 0,
        previousCrop: formData.previouscrop || "",
        isolationDistance: Number.parseFloat(formData.isolationdistance) || 0,
        stageOfContaminant: formData.stageofgrowthofcontaminant || "",
        stageOfSeedCropAtTimeInspection:
          formData.stageofseedcropatthisinspection || "",
        dateOfSowing: convertDateFormat(formData.dateOfSowing),
        expectedDateOfHarvestFrom: convertDateFormat(
          formData.expectedHarvestFrom
        ),
        expectedDateOfHarvestTo: convertDateFormat(formData.expectedHarvestTo),
        // Step 2 fields
        fieldCounts: mapCountsData(formData.counts, 2),
        // Step 3 fields
        percentageOffTypes: Number.parseFloat(formData.offTypePercentage) || 0,
        percentageInseparableCrops:
          Number.parseFloat(formData.inseparableOtherCropsPercentage) || 0,
        percentageObjectionableWeeds:
          Number.parseFloat(formData.objectionableWeedsPercentage) || 0,
        percentageSeedBorneDiseases:
          Number.parseFloat(formData.seedBorneDiseasesPercentage) || 0,
        inseparableCropPlants: formData.inseparableOtherCropsName || "",
        objectionableWeedPlants: formData.objectionableWeedsName || "",
        seedBorneDiseases: formData.seedBorneDiseasesName || "",
        nonSeedBorneDiseases: formData.nonSeedBorneDiseases || "",
        conditionOfCrop: formData.conditionOfCrop || "",
        confirmStandard: booleanToYesNo(formData.confirmsToStandards),
        productionQuality: formData.productionQuality || "",
        isFinal: booleanToYesNo(formData.isFinalReport),
        estimatedRawSeedYield:
          Number.parseFloat(formData.estimatedRawSeedYield) || 0,
        growerPresent: booleanToYesNo(formData.growerPresent),
        submittedFor: formData.growerName || "",
        submittedBy: formData.submittedBy || "",
        designation: formData.designation || "",
        remarks: formData.remarks || "",
        programmeRejected: "No",
        growerVillage: data?.grower?.entityRegNo?.villageId?.villageName || "",
        growerTaluk: data?.grower?.entityRegNo?.taluqs?.talukaName,
        growerBlock: data?.grower?.entityRegNo?.block?.blockName,
        variety: data?.inspection?.productionPlan?.seedVariety,
        rejectedLands: [],
      };
    } else if (cropType === 3) {
      return {
        ...basePayload,
        // Step 1 fields
        sourceOfSeed: formData.seedsource || "",
        femaleParent: formData.femaleParent || "",
        maleParent: formData.maleParent || "",
        hybridCodeDesignation: formData.codeHybridDesignation || "",
        plantingRatio: formData.plantingRatio || "",
        areBothEndMaleRowsMarked: booleanToYesNo(
          formData.areBothEndOfMaleRowsMarked
        ),
        methodOfMarkingMaleRows: formData.methodOfMarkingMaleRows || "",
        isolationDistanceMeters:
          Number.parseFloat(formData.isolationDistanceMeters) || 0,
        stageOfGrowthCoteminant: formData.stageofgrowthofcontaminant || "",
        stageOfSeedCropAtInspection:
          formData.stageofseedcropatthisinspection || "",
        dateOfInspection: convertDateFormat(formData.dateOfInspection),
        // Step 2 fields
        fieldCount: mapCountsData(formData.counts, 3),
        // Step 3 fields
        sideOfFieldFromWhichInspectionStarted:
          formData.sideOfFieldFromWhichInspectionWasStarted || "",
        cropCondition: formData.cropCondition || "",
        numberOfTimesDetasselled:
          Number.parseInt(formData.noOfTimesDetasselled) || 0,
        frequencyOfDetasselling: formData.frequencyOfDetasselling || "",
        detassellingDoneAtInspectionTime: booleanToYesNo(
          formData.detassellingDoneAtInspectionTime
        ),
        qualityOfSeedProductionWork: formData.qualityOfSeedProductionWork || "",
        doesCropConformToStandards: booleanToYesNo(
          formData.doesCropConformToStandards
        ),
        estimatedSeedYieldQtlsOrAcres:
          formData.estimatedSeedYieldKgsPerAcres || "0",
        wasGrowerPresentAtInspection: booleanToYesNo(formData.growerPresent),
        numberOfBorderRow: Number.parseInt(formData.noOfBorderRow) || 0,
        isFinalReport: booleanToYesNo(formData.isFinalReport),
        areaRejectedHect: Number.parseFloat(formData.areaRejectedHa) || 0,
        areaCertifiedHect: Number.parseFloat(formData.areaCertifiedHa) || 0,
        remarks: formData.remarks || "",
        programmeRejected: "No", // Default value
        // Additional fields for Type 3
        growerVillage: data?.grower?.entityRegNo?.villageId?.villageName || "",
        growerTaluk: data?.grower?.entityRegNo?.taluqs?.talukaName || "",
        growerBlock: data?.grower?.entityRegNo?.block?.blockName || "",
        rejectedLands: [], // Default empty array
      };
    }

    return basePayload;
  };

  const handleSubmit = async (inspectionStatus = "APPROVED") => {
    const stepErrors = validateStep(3);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setLoading(true);
    try {
      // Map form data to API payload
      const payload = mapFormDataToPayload(formData, cropFirTypeId, data);

      // Update inspection status in payload
      payload.inspectionStatus = inspectionStatus;

      // Determine API endpoint based on crop type
      let apiEndpoint;
      switch (cropFirTypeId) {
        case 1:
          apiEndpoint = API_ROUTES.INSPECTION_SAVE_A;
          break;
        case 2:
          apiEndpoint = API_ROUTES.INSPECTION_SAVE_B;
          break;
        case 3:
          apiEndpoint = API_ROUTES.INSPECTION_SAVE_C;
          break;
        default:
          throw new Error("Invalid crop FIR type");
      }
      const encryptedPayload = encryptWholeObject(payload);
      const response = await apiRequest(apiEndpoint, "POST", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("API Response:", parsedDecrypted);
      if (
        parsedDecrypted &&
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        showSuccessMessage(parsedDecrypted?.message);
        navigation.push("FieldInspectionReport");
      } else {
        console.log("Error in ELse Block");
      }
    } catch (error) {
      console.error("Error submitting inspection form:", error?.message);
      alert("Failed to submit inspection form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={"Inspection Form"} />
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>Step {step} of 3</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      <View style={{ padding: moderateScale(10) }}>
        {step === 1 && (
          <CustomButton
            text={"Next"}
            buttonStyle={styles.nextButtonStyle}
            textStyle={styles.buttonText}
            handleAction={nextStep}
          />
        )}
        {step === 2 && (
          <View style={styles.step2}>
            <CustomButton
              text={"Previous"}
              buttonStyle={styles.prevButton}
              textStyle={styles.buttonText}
              handleAction={prevStep}
            />
            <CustomButton
              text={"Next"}
              buttonStyle={[styles.nextButtonStyle, { width: "45%" }]}
              textStyle={styles.buttonText}
              handleAction={nextStep}
            />
          </View>
        )}

        {step === 3 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.step3ButtonsContainer}
          >
            <CustomButton
              text={"Previous"}
              buttonStyle={[styles.prevButton, styles.hButton]}
              textStyle={styles.buttonText}
              handleAction={prevStep}
            />

            <CustomButton
              text={"Submit"}
              buttonStyle={[
                styles.prevButton,
                styles.hButton,
                { backgroundColor: Colors.greenColor },
              ]}
              textStyle={styles.buttonText}
              handleAction={() => handleSubmit("APPROVED")}
            />
            <CustomButton
              text={"Reject"}
              buttonStyle={[
                styles.prevButton,
                styles.hButton,
                { backgroundColor: Colors.redThemeColor },
              ]}
              textStyle={styles.buttonText}
              handleAction={() => handleSubmit("REJECTED")}
            />
            <CustomButton
              text={"Cancel"}
              buttonStyle={[
                styles.nextButtonStyle,
                styles.hButton,
                { backgroundColor: Colors.diabledColor },
              ]}
              textStyle={styles.buttonText}
              handleAction={() => navigation.goBack()}
            />
          </ScrollView>
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}
    </WrapperContainer>
  );
};

InspectionForm.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
};

export default InspectionForm;

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    padding: moderateScale(16),
  },
  stepIndicator: {
    padding: moderateScale(16),
    backgroundColor: Colors.lightBackground,
  },
  stepText: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    marginBottom: moderateScaleVertical(8),
  },
  progressBar: {
    height: moderateScale(10),
    backgroundColor: Colors.veryLightGrey,
    borderRadius: moderateScale(5),
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: Colors.lightGreen,
  },
  sectionTitle: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsRegular,
    marginVertical: moderateScaleVertical(10),
  },
  inputGroup: {
    marginBottom: moderateScaleVertical(20),
    gap: moderateScaleVertical(5),
  },
  label: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
  },
  input: {
    borderWidth: moderateScale(1),
    borderColor: Colors.lightGray,
    borderRadius: moderateScale(5),
    padding: moderateScale(12),
    fontSize: textScale(14),
    color: Colors.black,
  },
  textArea: {
    minHeight: moderateScale(80),
    textAlignVertical: "top",
  },
  checklistItem: {
    marginBottom: moderateScaleVertical(16),
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: moderateScaleVertical(10),
    overflow: "hidden",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: moderateScale(16),
  },
  switchLabel: {
    marginRight: moderateScale(8),
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
  },
  horizontalScrollContainer: {
    marginBottom: moderateScaleVertical(20),
  },
  tableContainer: {
    minWidth: moderateScale(800),
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: moderateScale(2),
    borderColor: Colors.lightGray,
    paddingBottom: moderateScale(8),
    marginBottom: moderateScale(8),
    backgroundColor: Colors.lightBackground,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: moderateScaleVertical(10),
    paddingVertical: moderateScaleVertical(5),
  },
  tableFooter: {
    flexDirection: "row",
    borderTopWidth: moderateScale(2),
    borderColor: Colors.lightGray,
    paddingTop: moderateScale(8),
    marginTop: moderateScale(8),
    marginBottom: moderateScaleVertical(10),
    backgroundColor: Colors.lightBackground,
  },
  tableCell: {
    padding: moderateScale(8),
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: moderateScale(2),
  },
  headerCell: {
    fontFamily: FontFamily.PoppinsSemiBold,
    fontSize: textScale(11),
    textAlign: "center",
    color: Colors.textColor,
    fontWeight: "600",
  },
  countCell: {
    fontFamily: FontFamily.PoppinsMedium,
    textAlign: "center",
    color: Colors.textColor,
    fontSize: textScale(13),
    fontWeight: "500",
  },
  inputCell: {
    borderWidth: moderateScale(1),
    borderColor: Colors.veryLightGrey,
    borderRadius: moderateScale(5),
    padding: moderateScale(8),
    textAlign: "center",
    height: moderateScale(45),
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsRegular,
    backgroundColor: Colors.white,
  },
  footerCell: {
    fontFamily: FontFamily.PoppinsSemiBold,
    textAlign: "center",
    fontSize: textScale(12),
    fontWeight: "600",
    color: Colors.greenColor,
  },
  errorInput: {
    borderColor: Colors.redThemeColor,
  },
  errorText: {
    color: Colors.redThemeColor,
    fontSize: textScale(11),
    marginTop: moderateScaleVertical(4),
    fontFamily: FontFamily.PoppinsRegular,
  },
  twoColumnLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginRight: moderateScale(8),
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: moderateScale(5),
    borderTopWidth: moderateScale(1),
    borderColor: Colors.lightGray,
  },
  navButton: {
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
    width: moderateScale(70),
    alignItems: "center",
    backgroundColor: Colors.lightGray,
  },
  nextButton: {
    backgroundColor: Colors.greenColor,
  },
  submitButton: {
    backgroundColor: Colors.lightGreen,
  },
  rejectButton: {
    backgroundColor: Colors.red,
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
  },
  navButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.PoppinsMedium,
    fontSize: textScale(10),
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
  dateViewHolder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextButtonStyle: {
    backgroundColor: Colors.greenColor,
    height: moderateScale(45),
  },
  buttonText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.white,
    fontSize: textScale(14),
  },
  prevButton: {
    backgroundColor: Colors.veryLightGrey,
    width: "45%",
    height: moderateScale(45),
  },
  step2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  step3ButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(4),
  },
  hButton: {
    width: moderateScale(140),
    height: moderateScale(45),
    marginRight: moderateScale(10),
  },
});
